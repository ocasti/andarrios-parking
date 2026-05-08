'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';

/**
 * Bloquea las rutas operativas (vigilante) si quien entra es admin.
 * No bloquea a usuarios anónimos — esas son las páginas pensadas para el portero.
 */
export default function RequireVigilante({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAdmin) {
      router.replace('/admin');
    }
  }, [isAdmin, loading, router]);

  if (loading) return <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--ink3)' }}>Cargando…</p>;
  if (isAdmin) return <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--ink3)' }}>Redirigiendo al panel administrativo…</p>;
  return <>{children}</>;
}
