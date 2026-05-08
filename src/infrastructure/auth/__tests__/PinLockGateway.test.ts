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

  describe('when window is undefined (SSR environment)', () => {
    beforeEach(() => {
      vi.stubGlobal('window', undefined);
    });

    it('isUnlocked returns false', () => {
      expect(gateway.isUnlocked()).toBe(false);
    });

    it('unlock does not throw', () => {
      expect(() => gateway.unlock()).not.toThrow();
    });

    it('lock does not throw', () => {
      expect(() => gateway.lock()).not.toThrow();
    });

    it('timeLeftMs returns 0', () => {
      expect(gateway.timeLeftMs()).toBe(0);
    });
  });

  describe('isUnlocked', () => {
    it('returns false initially', () => {
      expect(gateway.isUnlocked()).toBe(false);
    });

    it('returns true after unlock', () => {
      gateway.unlock(60_000);
      expect(gateway.isUnlocked()).toBe(true);
    });

    it('returns false after lock', () => {
      gateway.unlock(60_000);
      gateway.lock();
      expect(gateway.isUnlocked()).toBe(false);
    });

    it('returns false if the token has expired', () => {
      // Sets a timestamp in the past (already expired)
      store[PIN_LOCK_KEY] = String(Date.now() - 1000);
      expect(gateway.isUnlocked()).toBe(false);
    });
  });

  describe('timeLeftMs', () => {
    it('returns 0 if not unlocked', () => {
      expect(gateway.timeLeftMs()).toBe(0);
    });

    it('returns positive value if unlocked', () => {
      gateway.unlock(60_000);
      expect(gateway.timeLeftMs()).toBeGreaterThan(0);
    });
  });
});
