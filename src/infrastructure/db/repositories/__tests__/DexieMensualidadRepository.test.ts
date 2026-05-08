import { describe, it, expect, beforeEach } from 'vitest';
import { AndarriosDB } from '../../AndarriosDB';
import { DexieMensualidadRepository } from '../DexieMensualidadRepository';
import { makeMensualidad } from './factories';

describe('DexieMensualidadRepository', () => {
  let db: AndarriosDB;
  let repo: DexieMensualidadRepository;

  beforeEach(() => {
    db = new AndarriosDB(`test-mensualidad-${Math.random()}`);
    repo = new DexieMensualidadRepository(db);
  });

  describe('crear', () => {
    it('guarda mensualidad', async () => {
      const m = makeMensualidad({ id: 'm1', residenteId: 'r1', mesKey: '2024-06' });

      const result = await repo.crear(m);

      expect(result.id).toBe('m1');
      const stored = await db.mensualidades.get('m1');
      expect(stored?.mes_key).toBe('2024-06');
    });
  });

  describe('obtenerPorResidenteYMes', () => {
    it('retorna la mensualidad correcta', async () => {
      const m = makeMensualidad({ id: 'm2', residenteId: 'r2', mesKey: '2024-07' });
      await repo.crear(m);

      const found = await repo.obtenerPorResidenteYMes('r2', '2024-07');

      expect(found).toBeDefined();
      expect(found?.id).toBe('m2');
      expect(found?.mesKey).toBe('2024-07');
    });

    it('retorna undefined si no existe', async () => {
      const found = await repo.obtenerPorResidenteYMes('no-existe', '2024-07');
      expect(found).toBeUndefined();
    });
  });

  describe('actualizar', () => {
    it('modifica los campos indicados', async () => {
      const m = makeMensualidad({ id: 'm3', residenteId: 'r3', mesKey: '2024-08', estado: 'pendiente' });
      await repo.crear(m);

      await repo.actualizar('m3', { estado: 'pagado', fechaPago: '2024-08-10T00:00:00.000Z', monto: 20000 });

      const stored = await db.mensualidades.get('m3');
      expect(stored?.estado).toBe('pagado');
      expect(stored?.fecha_pago).toBe('2024-08-10T00:00:00.000Z');
      expect(stored?.monto).toBe(20000);
    });
  });

  describe('upsert', () => {
    it('inserta si no existe', async () => {
      const m = makeMensualidad({ id: 'm4', residenteId: 'r4', mesKey: '2024-09' });

      await repo.upsert(m);

      const stored = await db.mensualidades.get('m4');
      expect(stored?.id).toBe('m4');
    });

    it('actualiza si ya existe', async () => {
      const m = makeMensualidad({ id: 'm5', residenteId: 'r5', mesKey: '2024-10', estado: 'pendiente' });
      await repo.crear(m);

      const actualizado = { ...m, estado: 'pagado' as const, fechaPago: '2024-10-05T00:00:00.000Z', monto: 20000 };
      await repo.upsert(actualizado);

      const stored = await db.mensualidades.get('m5');
      expect(stored?.estado).toBe('pagado');
      expect(stored?.monto).toBe(20000);
    });
  });
});
