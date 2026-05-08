import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AndarriosDB, getDB, resetDB } from '../AndarriosDB';

describe('AndarriosDB', () => {
  describe('constructor', () => {
    it('creates an AndarriosDB instance with default name', () => {
      const db = new AndarriosDB();
      expect(db).toBeInstanceOf(AndarriosDB);
    });

    it('creates an AndarriosDB instance with explicit name', () => {
      const db = new AndarriosDB('test-explicit');
      expect(db).toBeInstanceOf(AndarriosDB);
    });

    it('exposes the expected tables', () => {
      const db = new AndarriosDB(`test-tables-${Math.random()}`);
      expect(db.residentes).toBeDefined();
      expect(db.visitantes).toBeDefined();
      expect(db.mensualidades).toBeDefined();
      expect(db.pagos).toBeDefined();
      expect(db.cierres).toBeDefined();
      expect(db.actividad).toBeDefined();
      expect(db.tarifas).toBeDefined();
      expect(db.queue).toBeDefined();
      expect(db.meta).toBeDefined();
    });
  });

  describe('getDB (singleton)', () => {
    beforeEach(() => {
      resetDB();
    });

    afterEach(() => {
      resetDB();
    });

    it('getDB returns the same instance on successive calls (singleton)', () => {
      const db1 = getDB('singleton-test');
      const db2 = getDB('singleton-test');
      expect(db1).toBe(db2);
    });

    it('resetDB allows creating a new instance', () => {
      const db1 = getDB('reset-test');
      resetDB();
      const db2 = getDB('reset-test-2');
      expect(db1).not.toBe(db2);
    });

    it('getDB with explicit name does not use the global singleton when one already exists', () => {
      const db1 = getDB('name-a');
      // After first call the singleton is set; calling again returns the same one
      // regardless of the name argument (the _db check wins)
      const db2 = getDB('name-b');
      expect(db2).toBe(db1);
    });

    it('throws when window is undefined and no name is provided', () => {
      const originalWindow = globalThis.window;
      // @ts-expect-error — simulating SSR environment
      vi.stubGlobal('window', undefined);

      expect(() => getDB()).toThrow('IndexedDB no disponible en server');

      vi.stubGlobal('window', originalWindow);
    });

    it('does not throw when explicit name is provided even if window is undefined', () => {
      const originalWindow = globalThis.window;
      // @ts-expect-error — simulating SSR environment
      vi.stubGlobal('window', undefined);

      expect(() => getDB('explicit-name')).not.toThrow();

      vi.stubGlobal('window', originalWindow);
    });
  });
});
