import { describe, it, expect, beforeEach } from 'vitest';
import { AndarriosDB } from '../../AndarriosDB';
import { DexieTarifaRepository } from '../DexieTarifaRepository';
import { makeTarifa } from './factories';

describe('DexieTarifaRepository', () => {
  let db: AndarriosDB;
  let repo: DexieTarifaRepository;

  beforeEach(() => {
    db = new AndarriosDB(`test-tarifa-${Math.random()}`);
    repo = new DexieTarifaRepository(db);
  });

  describe('obtener', () => {
    it('retorna undefined si no hay tarifas', async () => {
      const tarifa = await repo.obtener();
      expect(tarifa).toBeUndefined();
    });

    it('retorna las tarifas guardadas', async () => {
      const t = makeTarifa({ id: 1, carroMes: 25000, motoMes: 12000 });
      await repo.guardar(t);

      const found = await repo.obtener();

      expect(found).toBeDefined();
      expect(found?.carroMes).toBe(25000);
      expect(found?.motoMes).toBe(12000);
    });
  });

  describe('guardar', () => {
    it('guarda las tarifas', async () => {
      const t = makeTarifa({ id: 1 });

      await repo.guardar(t);

      const stored = await db.tarifas.get(1);
      expect(stored).toBeDefined();
    });

    it('sobrescribe tarifas existentes', async () => {
      const original = makeTarifa({ id: 1, carroMes: 20000 });
      await repo.guardar(original);

      const actualizada = makeTarifa({ id: 1, carroMes: 30000 });
      await repo.guardar(actualizada);

      const found = await repo.obtener();
      expect(found?.carroMes).toBe(30000);
    });
  });
});
