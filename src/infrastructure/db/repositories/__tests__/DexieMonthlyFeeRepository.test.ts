import { describe, it, expect, beforeEach } from 'vitest';
import { AndarriosDB } from '../../AndarriosDB';
import { DexieMonthlyFeeRepository } from '../DexieMonthlyFeeRepository';
import { makeMonthlyFee } from './factories';

describe('DexieMonthlyFeeRepository', () => {
  let db: AndarriosDB;
  let repo: DexieMonthlyFeeRepository;

  beforeEach(() => {
    db = new AndarriosDB(`test-monthly-fee-${Math.random()}`);
    repo = new DexieMonthlyFeeRepository(db);
  });

  describe('create', () => {
    it('saves monthly fee', async () => {
      const m = makeMonthlyFee({ id: 'm1', residentId: 'r1', monthKey: '2024-06' });

      const result = await repo.create(m);

      expect(result.id).toBe('m1');
      const stored = await db.mensualidades.get('m1');
      expect(stored?.mes_key).toBe('2024-06');
    });
  });

  describe('findByResidentAndMonth', () => {
    it('returns the correct monthly fee', async () => {
      const m = makeMonthlyFee({ id: 'm2', residentId: 'r2', monthKey: '2024-07' });
      await repo.create(m);

      const found = await repo.findByResidentAndMonth('r2', '2024-07');

      expect(found).toBeDefined();
      expect(found?.id).toBe('m2');
      expect(found?.monthKey).toBe('2024-07');
    });

    it('returns undefined if not found', async () => {
      const found = await repo.findByResidentAndMonth('non-existent', '2024-07');
      expect(found).toBeUndefined();
    });
  });

  describe('update', () => {
    it('modifies the indicated fields', async () => {
      const m = makeMonthlyFee({ id: 'm3', residentId: 'r3', monthKey: '2024-08', status: 'pending' });
      await repo.create(m);

      await repo.update('m3', { status: 'paid', paymentDate: '2024-08-10T00:00:00.000Z', amount: 20000 });

      const stored = await db.mensualidades.get('m3');
      expect(stored?.estado).toBe('pagado');
      expect(stored?.fecha_pago).toBe('2024-08-10T00:00:00.000Z');
      expect(stored?.monto).toBe(20000);
    });

    it('updates only updated_at when data has no optional fields', async () => {
      const m = makeMonthlyFee({ id: 'm6', residentId: 'r6', monthKey: '2024-11', status: 'pending' });
      await repo.create(m);

      await repo.update('m6', {});

      const stored = await db.mensualidades.get('m6');
      expect(stored?.estado).toBe('pendiente');
      expect(stored?.updated_at).toBeTruthy();
    });
  });

  describe('upsert', () => {
    it('inserts if not exists', async () => {
      const m = makeMonthlyFee({ id: 'm4', residentId: 'r4', monthKey: '2024-09' });

      await repo.upsert(m);

      const stored = await db.mensualidades.get('m4');
      expect(stored?.id).toBe('m4');
    });

    it('updates if already exists', async () => {
      const m = makeMonthlyFee({ id: 'm5', residentId: 'r5', monthKey: '2024-10', status: 'pending' });
      await repo.create(m);

      const updated = { ...m, status: 'paid' as const, paymentDate: '2024-10-05T00:00:00.000Z', amount: 20000 };
      await repo.upsert(updated);

      const stored = await db.mensualidades.get('m5');
      expect(stored?.estado).toBe('pagado');
      expect(stored?.monto).toBe(20000);
    });
  });
});
