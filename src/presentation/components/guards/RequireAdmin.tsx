'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/application/hooks/useAuth';

export default function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.replace('/admin');
    }
  }, [user, isAdmin, loading, router]);

  if (loading) return <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--ink3)' }}>Verificando acceso…</p>;
  if (!user || !isAdmin) return <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--ink3)' }}>Redirigiendo…</p>;
  return <>{children}</>;
}
