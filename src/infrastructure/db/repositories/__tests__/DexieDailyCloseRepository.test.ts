import { describe, it, expect, beforeEach } from 'vitest';
import { AndarriosDB } from '../../AndarriosDB';
import { DexieDailyCloseRepository } from '../DexieDailyCloseRepository';
import { makeDailyClose } from './factories';

describe('DexieDailyCloseRepository', () => {
  let db: AndarriosDB;
  let repo: DexieDailyCloseRepository;

  beforeEach(() => {
    db = new AndarriosDB(`test-daily-close-${Math.random()}`);
    repo = new DexieDailyCloseRepository(db);
  });

  describe('create', () => {
    it('saves the daily close', async () => {
      const close = makeDailyClose({ id: 'cierre-1', dateStr: '2024-06-01' });

      await repo.create(close);

      const stored = await db.cierres.get('cierre-1');
      expect(stored).toBeDefined();
      expect(stored?.id).toBe('cierre-1');
      expect(stored?.fecha_str).toBe('2024-06-01');
    });

    it('saves multiple closes which can then all be listed', async () => {
      const c1 = makeDailyClose({ id: 'cierre-x1', dateStr: '2024-06-01' });
      const c2 = makeDailyClose({ id: 'cierre-x2', dateStr: '2024-06-02' });
      const c3 = makeDailyClose({ id: 'cierre-x3', dateStr: '2024-06-03' });

      await repo.create(c1);
      await repo.create(c2);
      await repo.create(c3);

      const list = await repo.list();
      expect(list).toHaveLength(3);
      expect(list.map((c) => c.id)).toEqual(
        expect.arrayContaining(['cierre-x1', 'cierre-x2', 'cierre-x3']),
      );
    });
  });

  describe('list', () => {
    it('returns all daily closes', async () => {
      const c1 = makeDailyClose({
        id: 'cierre-2',
        dateStr: '2024-07-01',
        total: 150000,
      });
      const c2 = makeDailyClose({
        id: 'cierre-3',
        dateStr: '2024-07-02',
        total: 200000,
      });

      await repo.create(c1);
      await repo.create(c2);

      const list = await repo.list();
      expect(list).toHaveLength(2);
      const ids = list.map((c) => c.id);
      expect(ids).toContain('cierre-2');
      expect(ids).toContain('cierre-3');
    });

    it('returns empty array when no daily closes exist', async () => {
      const list = await repo.list();
      expect(list).toEqual([]);
    });
  });

  describe('round-trip (create + list)', () => {
    it('preserves all daily close data through create and list', async () => {
      const close = makeDailyClose({
        id: 'cierre-rt',
        closedAt: '2024-08-15T23:59:00.000Z',
        dateStr: '2024-08-15',
        visitorCharges: 5,
        visitorTotal: 15000,
        monthlyCharges: 12,
        monthlyTotal: 240000,
        totalTax: 2850,
        total: 257850,
      });

      await repo.create(close);
      const [recovered] = await repo.list();

      expect(recovered.id).toBe('cierre-rt');
      expect(recovered.dateStr).toBe('2024-08-15');
      expect(recovered.visitorCharges).toBe(5);
      expect(recovered.visitorTotal).toBe(15000);
      expect(recovered.monthlyCharges).toBe(12);
      expect(recovered.monthlyTotal).toBe(240000);
      expect(recovered.totalTax).toBe(2850);
      expect(recovered.total).toBe(257850);
    });
  });
});
