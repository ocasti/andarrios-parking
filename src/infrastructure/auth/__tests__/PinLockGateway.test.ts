import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { PinLockGateway } from '../PinLockGateway';
import { PIN_LOCK_KEY } from '../../../domain/constants';

describe('PinLockGateway', () => {
  let gateway: PinLockGateway;
  let store: Record<string, string>;

  beforeEach(() => {
    store = {};

    vi.stubGlobal('localStorage', {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => { store[key] = value; },
      removeItem: (key: string) => { delete store[key]; },
    });

    vi.stubGlobal('window', {
      dispatchEvent: vi.fn(),
    });

    gateway = new PinLockGateway();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('cuando window es undefined (entorno SSR)', () => {
    beforeEach(() => {
      vi.stubGlobal('window', undefined);
    });

    it('isUnlocked retorna false', () => {
      expect(gateway.isUnlocked()).toBe(false);
    });

    it('unlock no lanza', () => {
      expect(() => gateway.unlock()).not.toThrow();
    });

    it('lock no lanza', () => {
      expect(() => gateway.lock()).not.toThrow();
    });

    it('timeLeftMs retorna 0', () => {
      expect(gateway.timeLeftMs()).toBe(0);
    });
  });

  describe('isUnlocked', () => {
    it('retorna false inicialmente', () => {
      expect(gateway.isUnlocked()).toBe(false);
    });

    it('retorna true después de unlock', () => {
      gateway.unlock(60_000);
      expect(gateway.isUnlocked()).toBe(true);
    });

    it('retorna false después de lock', () => {
      gateway.unlock(60_000);
      gateway.lock();
      expect(gateway.isUnlocked()).toBe(false);
    });

    it('retorna false si el token expiró', () => {
      // Establece un timestamp en el pasado (ya expirado)
      store[PIN_LOCK_KEY] = String(Date.now() - 1000);
      expect(gateway.isUnlocked()).toBe(false);
    });
  });

  describe('timeLeftMs', () => {
    it('retorna 0 si no está desbloqueado', () => {
      expect(gateway.timeLeftMs()).toBe(0);
    });

    it('retorna valor positivo si está desbloqueado', () => {
      gateway.unlock(60_000);
      expect(gateway.timeLeftMs()).toBeGreaterThan(0);
    });
  });
});
