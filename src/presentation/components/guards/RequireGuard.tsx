'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/application/hooks/useAuth';

/**
 * Blocks operational routes (guard) if the user is admin.
 * Does not block anonymous users — those are the pages intended for the guard/doorman.
 */
export default function RequireGuard({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAdmin) {
      router.replace('/admin');
    }
  }, [isAdmin, loading, router]);

  if (loading) return <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--ink3)' }}>Loading…</p>;
  if (isAdmin) return <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--ink3)' }}>Redirecting to admin panel…</p>;
  return <>{children}</>;
}
