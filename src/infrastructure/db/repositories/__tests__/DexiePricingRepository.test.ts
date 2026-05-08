import { describe, it, expect, beforeEach } from 'vitest';
import { AndarriosDB } from '../../AndarriosDB';
import { DexiePricingRepository } from '../DexiePricingRepository';
import { makePricingConfig } from './factories';

describe('DexiePricingRepository', () => {
  let db: AndarriosDB;
  let repo: DexiePricingRepository;

  beforeEach(() => {
    db = new AndarriosDB(`test-pricing-${Math.random()}`);
    repo = new DexiePricingRepository(db);
  });

  describe('get', () => {
    it('returns undefined when no pricing config exists', async () => {
      const pricing = await repo.get();
      expect(pricing).toBeUndefined();
    });

    it('returns the saved pricing config', async () => {
      const t = makePricingConfig({ id: 1, carMonthlyRate: 25000, motorcycleMonthlyRate: 12000 });
      await repo.save(t);

      const found = await repo.get();

      expect(found).toBeDefined();
      expect(found?.carMonthlyRate).toBe(25000);
      expect(found?.motorcycleMonthlyRate).toBe(12000);
    });
  });

  describe('save', () => {
    it('saves the pricing config', async () => {
      const t = makePricingConfig({ id: 1 });

      await repo.save(t);

      const stored = await db.tarifas.get(1);
      expect(stored).toBeDefined();
    });

    it('overwrites existing pricing config', async () => {
      const original = makePricingConfig({ id: 1, carMonthlyRate: 20000 });
      await repo.save(original);

      const updated = makePricingConfig({ id: 1, carMonthlyRate: 30000 });
      await repo.save(updated);

      const found = await repo.get();
      expect(found?.carMonthlyRate).toBe(30000);
    });
  });
});
