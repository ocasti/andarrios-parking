import { describe, it, expect, beforeEach } from 'vitest';
import { AndarriosDB } from '../../AndarriosDB';
import { DexieResidentRepository } from '../DexieResidentRepository';
import { makeResident } from './factories';

describe('DexieResidentRepository', () => {
  let db: AndarriosDB;
  let repo: DexieResidentRepository;

  beforeEach(() => {
    db = new AndarriosDB(`test-resident-${Math.random()}`);
    repo = new DexieResidentRepository(db);
  });

  describe('create', () => {
    it('saves and returns the resident', async () => {
      const data = makeResident({ id: 'r1', plate: 'ABC123' });
      const { id, plate, vehicleType, name, aptCode, tower, floor, unit, phone, registrationDate } = data;
      const result = await repo.create({ id, plate, vehicleType, name, aptCode, tower, floor, unit, phone, registrationDate });

      expect(result.id).toBe('r1');
      expect(result.plate).toBe('ABC123');
      expect(result.deletedAt).toBeNull();
      expect(result.createdAt).toBeTruthy();

      const stored = await db.residentes.get('r1');
      expect(stored).toBeDefined();
      expect(stored?.placa).toBe('ABC123');
    });
  });

  describe('findById', () => {
    it('returns resident by id', async () => {
      const resident = makeResident({ id: 'r2', plate: 'BBB222' });
      await repo.create({ id: resident.id, plate: resident.plate, vehicleType: resident.vehicleType, name: resident.name, aptCode: resident.aptCode, tower: resident.tower, floor: resident.floor, unit: resident.unit, phone: resident.phone, registrationDate: resident.registrationDate });

      const found = await repo.findById('r2');

      expect(found).toBeDefined();
      expect(found?.id).toBe('r2');
      expect(found?.plate).toBe('BBB222');
    });

    it('returns undefined if not found', async () => {
      const found = await repo.findById('non-existent');
      expect(found).toBeUndefined();
    });
  });

  describe('findByPlate', () => {
    it('returns active resident by plate', async () => {
      const resident = makeResident({ id: 'r3', plate: 'CCC333' });
      await repo.create({ id: resident.id, plate: resident.plate, vehicleType: resident.vehicleType, name: resident.name, aptCode: resident.aptCode, tower: resident.tower, floor: resident.floor, unit: resident.unit, phone: resident.phone, registrationDate: resident.registrationDate });

      const found = await repo.findByPlate('CCC333');

      expect(found).toBeDefined();
      expect(found?.plate).toBe('CCC333');
    });

    it('returns undefined for non-existent plate', async () => {
      const found = await repo.findByPlate('ZZZ999');
      expect(found).toBeUndefined();
    });
  });

  describe('listActive', () => {
    it('includes non-deleted residents', async () => {
      const r = makeResident({ id: 'r4', plate: 'DDD444' });
      await repo.create({ id: r.id, plate: r.plate, vehicleType: r.vehicleType, name: r.name, aptCode: r.aptCode, tower: r.tower, floor: r.floor, unit: r.unit, phone: r.phone, registrationDate: r.registrationDate });

      const active = await repo.listActive();

      expect(active.some((x) => x.id === 'r4')).toBe(true);
    });

    it('excludes deleted residents (deleted_at != null)', async () => {
      const r = makeResident({ id: 'r5', plate: 'EEE555' });
      await repo.create({ id: r.id, plate: r.plate, vehicleType: r.vehicleType, name: r.name, aptCode: r.aptCode, tower: r.tower, floor: r.floor, unit: r.unit, phone: r.phone, registrationDate: r.registrationDate });
      await repo.softDelete('r5', '2024-06-01T12:00:00.000Z');

      const active = await repo.listActive();

      expect(active.some((x) => x.id === 'r5')).toBe(false);
    });
  });

  describe('softDelete', () => {
    it('marks deleted_at on the DB row', async () => {
      const r = makeResident({ id: 'r6', plate: 'FFF666' });
      await repo.create({ id: r.id, plate: r.plate, vehicleType: r.vehicleType, name: r.name, aptCode: r.aptCode, tower: r.tower, floor: r.floor, unit: r.unit, phone: r.phone, registrationDate: r.registrationDate });

      const deletedAt = '2024-06-01T12:00:00.000Z';
      await repo.softDelete('r6', deletedAt);

      const stored = await db.residentes.get('r6');
      expect(stored?.deleted_at).toBe(deletedAt);
    });
  });

  describe('plateExists', () => {
    it('returns true if active resident with that plate exists', async () => {
      const r = makeResident({ id: 'r7', plate: 'GGG777' });
      await repo.create({ id: r.id, plate: r.plate, vehicleType: r.vehicleType, name: r.name, aptCode: r.aptCode, tower: r.tower, floor: r.floor, unit: r.unit, phone: r.phone, registrationDate: r.registrationDate });

      expect(await repo.plateExists('GGG777')).toBe(true);
    });

    it('returns false for non-existent plate', async () => {
      expect(await repo.plateExists('ZZZ999')).toBe(false);
    });

    it('returns false for plate of soft-deleted resident', async () => {
      const r = makeResident({ id: 'r8', plate: 'HHH888' });
      await repo.create({ id: r.id, plate: r.plate, vehicleType: r.vehicleType, name: r.name, aptCode: r.aptCode, tower: r.tower, floor: r.floor, unit: r.unit, phone: r.phone, registrationDate: r.registrationDate });
      await repo.softDelete('r8', '2024-06-01T12:00:00.000Z');

      expect(await repo.plateExists('HHH888')).toBe(false);
    });
  });
});
