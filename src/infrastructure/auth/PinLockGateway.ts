import { PIN_LOCK_KEY, TURNO_DURACION_MS } from '../../domain/constants';

export class PinLockGateway {
  isUnlocked(): boolean {
    if (typeof window === 'undefined') return false;
    const v = localStorage.getItem(PIN_LOCK_KEY);
    if (!v) return false;
    const until = parseInt(v, 10);
    return !isNaN(until) && Date.now() < until;
  }

  unlock(durationMs: number = TURNO_DURACION_MS): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(PIN_LOCK_KEY, String(Date.now() + durationMs));
    window.dispatchEvent(new Event('pinlock-changed'));
  }

  lock(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(PIN_LOCK_KEY);
    window.dispatchEvent(new Event('pinlock-changed'));
  }

  timeLeftMs(): number {
    if (typeof window === 'undefined') return 0;
    const v = localStorage.getItem(PIN_LOCK_KEY);
    if (!v) return 0;
    const until = parseInt(v, 10);
    return Math.max(0, until - Date.now());
  }
}
