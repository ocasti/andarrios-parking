import { describe, it, expect, beforeEach } from 'vitest';
import { AndarriosDB } from '../../AndarriosDB';
import { DexieActivityLogRepository } from '../DexieActivityLogRepository';
import { makeActivityLog } from './factories';

describe('DexieActivityLogRepository', () => {
  let db: AndarriosDB;
  let repo: DexieActivityLogRepository;

  beforeEach(() => {
    db = new AndarriosDB(`test-activity-log-${Math.random()}`);
    repo = new DexieActivityLogRepository(db);
  });

  describe('log', () => {
    it('saves the activity entry to the table', async () => {
      const activity = makeActivityLog({ id: 'act-1' });

      await repo.log(activity);

      const stored = await db.actividad.get('act-1');
      expect(stored).toBeDefined();
      expect(stored?.id).toBe('act-1');
    });

    it('saves msg, ts, and category correctly', async () => {
      const ts = '2024-06-15T10:00:00.000Z';
      const activity = makeActivityLog({
        id: 'act-2',
        msg: 'Vehicle entered the parking lot',
        ts,
        category: 'visitor',
      });

      await repo.log(activity);

      const stored = await db.actividad.get('act-2');
      expect(stored?.msg).toBe('Vehicle entered the parking lot');
      expect(stored?.ts).toBe(ts);
      expect(stored?.tipo).toBe('visitor');
    });

    it('accumulates multiple activity records', async () => {
      const a1 = makeActivityLog({ id: 'act-a', msg: 'First activity' });
      const a2 = makeActivityLog({ id: 'act-b', msg: 'Second activity' });
      const a3 = makeActivityLog({ id: 'act-c', msg: 'Third activity' });

      await repo.log(a1);
      await repo.log(a2);
      await repo.log(a3);

      const all = await db.actividad.toArray();
      expect(all).toHaveLength(3);
      expect(all.map((a) => a.id)).toEqual(expect.arrayContaining(['act-a', 'act-b', 'act-c']));
    });
  });
});
