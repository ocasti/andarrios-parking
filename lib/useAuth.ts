'use client';
import { useEffect, useState } from 'react';
import { getSupabase } from './supabase';

interface AuthState {
  user: any | null;
  isAdmin: boolean;
  loading: boolean;
}

let _state: AuthState = { user: null, isAdmin: false, loading: true };
const _listeners = new Set<(s: AuthState) => void>();
let _initialized = false;

function emit() { _listeners.forEach((l) => l(_state)); }

async function checkAdmin(userId: string | undefined): Promise<boolean> {
  if (!userId) return false;
  try {
    const { data } = await getSupabase().from('admin_profiles').select('user_id').eq('user_id', userId).maybeSingle();
    return !!data;
  } catch { return false; }
}

async function refresh() {
  const sb = getSupabase();
  const { data } = await sb.auth.getSession();
  const user = data.session?.user ?? null;
  const isAdmin = user ? await checkAdmin(user.id) : false;
  _state = { user, isAdmin, loading: false };
  emit();
}

function init() {
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
    setS(_state);
    return () => { _listeners.delete(setS); };
  }, []);
  return s;
}

export async function logout() {
  await getSupabase().auth.signOut();
  await refresh();
}
