import { describe, it, expect, beforeEach } from 'vitest';
import { AndarriosDB } from '../../AndarriosDB';
import { DexieCierreCajaRepository } from '../DexieCierreCajaRepository';
import { makeCierreCaja } from './factories';

describe('DexieCierreCajaRepository', () => {
  let db: AndarriosDB;
  let repo: DexieCierreCajaRepository;

  beforeEach(() => {
    db = new AndarriosDB(`test-cierre-${Math.random()}`);
    repo = new DexieCierreCajaRepository(db);
  });

  describe('crear', () => {
    it('crear guarda el cierre de caja', async () => {
      const cierre = makeCierreCaja({ id: 'cierre-1', fechaStr: '2024-06-01' });

      await repo.crear(cierre);

      const stored = await db.cierres.get('cierre-1');
      expect(stored).toBeDefined();
      expect(stored?.id).toBe('cierre-1');
      expect(stored?.fecha_str).toBe('2024-06-01');
    });

    it('crear múltiples cierres y listarlos todos', async () => {
      const c1 = makeCierreCaja({ id: 'cierre-x1', fechaStr: '2024-06-01' });
      const c2 = makeCierreCaja({ id: 'cierre-x2', fechaStr: '2024-06-02' });
      const c3 = makeCierreCaja({ id: 'cierre-x3', fechaStr: '2024-06-03' });

      await repo.crear(c1);
      await repo.crear(c2);
      await repo.crear(c3);

      const lista = await repo.listar();
      expect(lista).toHaveLength(3);
      expect(lista.map((c) => c.id)).toEqual(
        expect.arrayContaining(['cierre-x1', 'cierre-x2', 'cierre-x3']),
      );
    });
  });

  describe('listar', () => {
    it('listar retorna todos los cierres', async () => {
      const c1 = makeCierreCaja({
        id: 'cierre-2',
        fechaStr: '2024-07-01',
        total: 150000,
      });
      const c2 = makeCierreCaja({
        id: 'cierre-3',
        fechaStr: '2024-07-02',
        total: 200000,
      });

      await repo.crear(c1);
      await repo.crear(c2);

      const lista = await repo.listar();
      expect(lista).toHaveLength(2);
      const ids = lista.map((c) => c.id);
      expect(ids).toContain('cierre-2');
      expect(ids).toContain('cierre-3');
    });

    it('listar retorna array vacío cuando no hay cierres', async () => {
      const lista = await repo.listar();
      expect(lista).toEqual([]);
    });
  });

  describe('round-trip (crear + listar)', () => {
    it('los datos del cierre se conservan al hacer listar', async () => {
      const cierre = makeCierreCaja({
        id: 'cierre-rt',
        fecha: '2024-08-15T23:59:00.000Z',
        fechaStr: '2024-08-15',
        cobrosVis: 5,
        totalVis: 15000,
        cobrosMens: 12,
        totalMens: 240000,
        totalIva: 2850,
        total: 257850,
      });

      await repo.crear(cierre);
      const [recovered] = await repo.listar();

      expect(recovered.id).toBe('cierre-rt');
      expect(recovered.fechaStr).toBe('2024-08-15');
      expect(recovered.cobrosVis).toBe(5);
      expect(recovered.totalVis).toBe(15000);
      expect(recovered.cobrosMens).toBe(12);
      expect(recovered.totalMens).toBe(240000);
      expect(recovered.totalIva).toBe(2850);
      expect(recovered.total).toBe(257850);
    });
  });
});
