import { describe, it, expect, beforeEach } from 'vitest';
import { AndarriosDB } from '../../AndarriosDB';
import { DexieVisitorRepository } from '../DexieVisitorRepository';
import { makeVisitor } from './factories';

describe('DexieVisitorRepository', () => {
  let db: AndarriosDB;
  let repo: DexieVisitorRepository;

  beforeEach(() => {
    db = new AndarriosDB(`test-visitor-${Math.random()}`);
    repo = new DexieVisitorRepository(db);
  });

  describe('create', () => {
    it('saves visitor', async () => {
      const v = makeVisitor({ id: 'v1', plate: 'VIS001' });

      const result = await repo.create(v);

      expect(result.id).toBe('v1');
      const stored = await db.visitantes.get('v1');
      expect(stored?.placa).toBe('VIS001');
    });
  });

  describe('findById', () => {
    it('returns existing visitor by id', async () => {
      await repo.create(makeVisitor({ id: 'vObt1', plate: 'OBT001' }));
      const found = await repo.findById('vObt1');
      expect(found?.id).toBe('vObt1');
    });

    it('returns undefined for non-existent id', async () => {
      const found = await repo.findById('non-existent');
      expect(found).toBeUndefined();
    });
  });

  describe('listActive', () => {
    it('returns only visitors without checkout', async () => {
      const active = makeVisitor({ id: 'v2', plate: 'VIS002', checkOut: null });
      const withCheckOut = makeVisitor({
        id: 'v3',
        plate: 'VIS003',
        checkOut: '2024-06-01T12:00:00.000Z',
      });
      await repo.create(active);
      await repo.create(withCheckOut);

      const activeList = await repo.listActive();

      expect(activeList.some((x) => x.id === 'v2')).toBe(true);
      expect(activeList.some((x) => x.id === 'v3')).toBe(false);
    });
  });

  describe('activePlateExists', () => {
    it('returns true for plate without checkout', async () => {
      const v = makeVisitor({ id: 'v4', plate: 'ACTIVA1', checkOut: null });
      await repo.create(v);

      expect(await repo.activePlateExists('ACTIVA1')).toBe(true);
    });

    it('returns false for plate with checkout', async () => {
      const v = makeVisitor({
        id: 'v5',
        plate: 'SALIDA1',
        checkOut: '2024-06-01T14:00:00.000Z',
      });
      await repo.create(v);

      expect(await repo.activePlateExists('SALIDA1')).toBe(false);
    });
  });

  describe('recordCheckOut', () => {
    it('updates checkout fields', async () => {
      const v = makeVisitor({ id: 'v6', plate: 'VIS006', checkOut: null });
      await repo.create(v);

      await repo.recordCheckOut('v6', {
        checkOut: '2024-06-01T12:00:00.000Z',
        hours: 2,
        baseAmount: 2000,
        tax: 380,
        total: 2380,
      });

      const stored = await db.visitantes.get('v6');
      expect(stored?.salida).toBe('2024-06-01T12:00:00.000Z');
      expect(stored?.horas).toBe(2);
      expect(stored?.base).toBe(2000);
      expect(stored?.iva).toBe(380);
      expect(stored?.total).toBe(2380);
    });
  });

  describe('countActive', () => {
    it('counts active visitors correctly', async () => {
      await repo.create(makeVisitor({ id: 'v7', plate: 'CNT001', checkOut: null }));
      await repo.create(makeVisitor({ id: 'v8', plate: 'CNT002', checkOut: null }));
      await repo.create(
        makeVisitor({ id: 'v9', plate: 'CNT003', checkOut: '2024-06-01T12:00:00.000Z' }),
      );

      const count = await repo.countActive();

      expect(count).toBe(2);
    });
  });

  describe('findLastCheckOutByPlate', () => {
    it('returns the most recent checkout for the plate', async () => {
      const plate = 'REINGRESO1';
      await repo.create(
        makeVisitor({ id: 'v10', plate, checkOut: '2024-06-01T10:00:00.000Z' }),
      );
      await repo.create(
        makeVisitor({ id: 'v11', plate, checkOut: '2024-06-01T14:00:00.000Z' }),
      );

      const last = await repo.findLastCheckOutByPlate(plate, '2024-06-01T00:00:00.000Z');

      expect(last).toBeDefined();
      expect(last?.id).toBe('v11');
    });
  });
});
