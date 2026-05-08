'use client';
import { useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabase';

export interface AuthState {
  user: { id: string; email?: string } | null;
  isAdmin: boolean;
  loading: boolean;
}

// Singleton de estado para evitar múltiples fetches concurrentes
let _state: AuthState = { user: null, isAdmin: false, loading: true };
const _listeners = new Set<(s: AuthState) => void>();
let _initialized = false;

async function checkAdmin(userId: string): Promise<boolean> {
  try {
    const { data } = await getSupabase()
      .from('admin_profiles').select('user_id').eq('user_id', userId).maybeSingle();
    return !!data;
  } catch { return false; }
}

async function refresh(): Promise<void> {
  const { data } = await getSupabase().auth.getSession();
  const user = data.session?.user ?? null;
  const isAdmin = user ? await checkAdmin(user.id) : false;
  _state = { user: user ? { id: user.id, email: user.email } : null, isAdmin, loading: false };
  _listeners.forEach((l) => l(_state));
}

export function _resetAuthForTests(): void {
  _state = { user: null, isAdmin: false, loading: true };
  _listeners.clear();
  _initialized = false;
}

function init(): void {
  if (_initialized) return;
  _initialized = true;
  void refresh();
  getSupabase().auth.onAuthStateChange(() => { void refresh(); });
}

export function useAuth(): AuthState {
  const [s, setS] = useState<AuthState>(_state);
  useEffect(() => {
    init();
    _listeners.add(setS);
    setS({ ..._state });
    return () => { _listeners.delete(setS); };
  }, []);
  return s;
}

export async function logout(): Promise<void> {
  await getSupabase().auth.signOut();
  await refresh();
}
