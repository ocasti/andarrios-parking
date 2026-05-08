'use client';
// PIN lock para vigilante. Mantiene desbloqueo en localStorage por 30min.

const LOCK_KEY = 'andarrios_porteria_unlock';
// 12 horas = duración típica de un turno. El guardia desbloquea al inicio del
// turno y termina cerrando manualmente con "Cerrar turno". El expiry es solo
// un safety net por si dejan el equipo desatendido.
export const LOCK_DURATION_MS = 12 * 60 * 60 * 1000;

export function isUnlocked(): boolean {
  if (typeof window === 'undefined') return false;
  const v = localStorage.getItem(LOCK_KEY);
  if (!v) return false;
  const until = parseInt(v, 10);
  return !isNaN(until) && Date.now() < until;
}

export function unlock(durationMs: number = LOCK_DURATION_MS) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCK_KEY, String(Date.now() + durationMs));
  window.dispatchEvent(new Event('pinlock-changed'));
}

export function lock() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(LOCK_KEY);
  window.dispatchEvent(new Event('pinlock-changed'));
}

export function timeLeftMs(): number {
  if (typeof window === 'undefined') return 0;
  const v = localStorage.getItem(LOCK_KEY);
  if (!v) return 0;
  const until = parseInt(v, 10);
  return Math.max(0, until - Date.now());
}
