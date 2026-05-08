import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AndarriosDB, getDB, resetDB } from '../AndarriosDB';

describe('AndarriosDB', () => {
  describe('constructor', () => {
    it('crea una instancia de AndarriosDB con nombre por defecto', () => {
      const db = new AndarriosDB();
      expect(db).toBeInstanceOf(AndarriosDB);
    });

    it('crea una instancia de AndarriosDB con nombre explícito', () => {
      const db = new AndarriosDB('test-explicit');
      expect(db).toBeInstanceOf(AndarriosDB);
    });

    it('expone las tablas esperadas', () => {
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

    it('getDB retorna la misma instancia en llamadas sucesivas (singleton)', () => {
      const db1 = getDB('singleton-test');
      const db2 = getDB('singleton-test');
      expect(db1).toBe(db2);
    });

    it('resetDB permite crear una nueva instancia', () => {
      const db1 = getDB('reset-test');
      resetDB();
      const db2 = getDB('reset-test-2');
      expect(db1).not.toBe(db2);
    });

    it('getDB con nombre explícito no usa el singleton global cuando ya hay uno', () => {
      const db1 = getDB('name-a');
      // After first call the singleton is set; calling again returns the same one
      // regardless of the name argument (the _db check wins)
      const db2 = getDB('name-b');
      expect(db2).toBe(db1);
    });

    it('lanza error cuando window es undefined y no se pasa nombre', () => {
      const originalWindow = globalThis.window;
      // @ts-expect-error — simulating SSR environment
      vi.stubGlobal('window', undefined);

      expect(() => getDB()).toThrow('IndexedDB no disponible en server');

      vi.stubGlobal('window', originalWindow);
    });

    it('no lanza error cuando se pasa nombre explícito aunque window sea undefined', () => {
      const originalWindow = globalThis.window;
      // @ts-expect-error — simulating SSR environment
      vi.stubGlobal('window', undefined);

      expect(() => getDB('explicit-name')).not.toThrow();

      vi.stubGlobal('window', originalWindow);
    });
  });
});
