'use client';
import { useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import { useAuth } from '@/lib/useAuth';
import { isUnlocked, unlock } from '@/lib/pinLock';

/**
 * Bloquea las páginas operativas tras un PIN compartido de portería.
 * El admin (logueado) NO necesita el PIN — entra directo.
 */
export default function RequireGuardPin({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAuth();
  const [ready, setReady] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setUnlocked(isUnlocked());
    setReady(true);
    const onChange = () => setUnlocked(isUnlocked());
    window.addEventListener('pinlock-changed', onChange);
    window.addEventListener('storage', onChange);
    // Re-evaluar cada minuto por si expiró
    const i = setInterval(onChange, 60000);
    return () => {
      window.removeEventListener('pinlock-changed', onChange);
      window.removeEventListener('storage', onChange);
      clearInterval(i);
    };
  }, []);

  if (!ready || loading) return null;
  if (isAdmin || unlocked) return <>{children}</>;

  async function tryUnlock() {
    if (!pin.trim()) return;
    setError(''); setBusy(true);
    try {
      const sb = getSupabase();
      const { data, error } = await sb.rpc('verify_porteria_pin', { p_pin: pin });
      if (error) throw error;
      if (data === true) {
        unlock();
        setUnlocked(true);
        setPin('');
      } else {
        setError('PIN incorrecto. Inténtalo de nuevo.');
        setPin('');
      }
    } catch (e: any) {
      setError(e?.message ?? 'Error al verificar PIN.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{
      minHeight: 'calc(100vh - 60px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }}>
      <div className="card" style={{ maxWidth: 360, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 44, marginBottom: 8 }}>🔐</div>
        <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: 22, color: 'var(--leaf)', marginBottom: 4 }}>
          Acceso de portería
        </h2>
        <p style={{ fontSize: 12.5, color: 'var(--ink3)', marginBottom: '1.2rem' }}>
          Ingresa el PIN compartido del turno
        </p>
        <input
          type="password"
          inputMode="numeric"
          autoFocus
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') tryUnlock(); }}
          placeholder="• • • •"
          maxLength={12}
          style={{
            width: '100%', height: 56, fontSize: 28, textAlign: 'center',
            letterSpacing: '0.4em', border: '1.5px solid var(--bdk)', borderRadius: 12,
            color: 'var(--leaf)', fontFamily: '"Playfair Display", serif',
            background: 'var(--bg)',
          }}
        />
        {error && <div className="al ae" style={{ marginTop: 12, justifyContent: 'center' }}>⚠️ {error}</div>}
        <button
          className="btn bp"
          onClick={tryUnlock}
          disabled={busy || pin.length < 4}
          style={{ marginTop: 14, width: '100%', height: 44, fontSize: 14 }}
        >
          {busy ? 'Verificando…' : '🔓 Desbloquear'}
        </button>
        <p style={{ fontSize: 10.5, color: 'var(--ink3)', marginTop: '1rem', lineHeight: 1.4 }}>
          La sesión queda activa durante el turno (12 horas) o hasta<br />
          que cierres turno manualmente. Si olvidaste el PIN, contacta al administrador.
        </p>
      </div>
    </div>
  );
}
