import { describe, it, expect, beforeEach } from 'vitest';
import { AndarriosDB } from '../../AndarriosDB';
import { DexieResidenteRepository } from '../DexieResidenteRepository';
import { makeResidente } from './factories';

describe('DexieResidenteRepository', () => {
  let db: AndarriosDB;
  let repo: DexieResidenteRepository;

  beforeEach(() => {
    db = new AndarriosDB(`test-residente-${Math.random()}`);
    repo = new DexieResidenteRepository(db);
  });

  describe('crear', () => {
    it('guarda y retorna el residente', async () => {
      const data = makeResidente({ id: 'r1', placa: 'ABC123' });
      const { id, placa, tipo, nombre, cod, torre, piso, apto, cel, fechaRegistro } = data;
      const result = await repo.crear({ id, placa, tipo, nombre, cod, torre, piso, apto, cel, fechaRegistro });

      expect(result.id).toBe('r1');
      expect(result.placa).toBe('ABC123');
      expect(result.deletedAt).toBeNull();
      expect(result.createdAt).toBeTruthy();

      const stored = await db.residentes.get('r1');
      expect(stored).toBeDefined();
      expect(stored?.placa).toBe('ABC123');
    });
  });

  describe('obtenerPorId', () => {
    it('retorna el residente por id', async () => {
      const residente = makeResidente({ id: 'r2', placa: 'BBB222' });
      await repo.crear({ id: residente.id, placa: residente.placa, tipo: residente.tipo, nombre: residente.nombre, cod: residente.cod, torre: residente.torre, piso: residente.piso, apto: residente.apto, cel: residente.cel, fechaRegistro: residente.fechaRegistro });

      const found = await repo.obtenerPorId('r2');

      expect(found).toBeDefined();
      expect(found?.id).toBe('r2');
      expect(found?.placa).toBe('BBB222');
    });

    it('retorna undefined si no existe', async () => {
      const found = await repo.obtenerPorId('no-existe');
      expect(found).toBeUndefined();
    });
  });

  describe('obtenerPorPlaca', () => {
    it('retorna residente activo por placa', async () => {
      const residente = makeResidente({ id: 'r3', placa: 'CCC333' });
      await repo.crear({ id: residente.id, placa: residente.placa, tipo: residente.tipo, nombre: residente.nombre, cod: residente.cod, torre: residente.torre, piso: residente.piso, apto: residente.apto, cel: residente.cel, fechaRegistro: residente.fechaRegistro });

      const found = await repo.obtenerPorPlaca('CCC333');

      expect(found).toBeDefined();
      expect(found?.placa).toBe('CCC333');
    });
  });

  describe('listarActivos', () => {
    it('incluye los no eliminados', async () => {
      const r = makeResidente({ id: 'r4', placa: 'DDD444' });
      await repo.crear({ id: r.id, placa: r.placa, tipo: r.tipo, nombre: r.nombre, cod: r.cod, torre: r.torre, piso: r.piso, apto: r.apto, cel: r.cel, fechaRegistro: r.fechaRegistro });

      const activos = await repo.listarActivos();

      expect(activos.some((x) => x.id === 'r4')).toBe(true);
    });

    it('excluye los eliminados (deleted_at != null)', async () => {
      const r = makeResidente({ id: 'r5', placa: 'EEE555' });
      await repo.crear({ id: r.id, placa: r.placa, tipo: r.tipo, nombre: r.nombre, cod: r.cod, torre: r.torre, piso: r.piso, apto: r.apto, cel: r.cel, fechaRegistro: r.fechaRegistro });
      await repo.eliminar('r5', '2024-06-01T12:00:00.000Z');

      const activos = await repo.listarActivos();

      expect(activos.some((x) => x.id === 'r5')).toBe(false);
    });
  });

  describe('eliminar', () => {
    it('marca deleted_at', async () => {
      const r = makeResidente({ id: 'r6', placa: 'FFF666' });
      await repo.crear({ id: r.id, placa: r.placa, tipo: r.tipo, nombre: r.nombre, cod: r.cod, torre: r.torre, piso: r.piso, apto: r.apto, cel: r.cel, fechaRegistro: r.fechaRegistro });

      const deletedAt = '2024-06-01T12:00:00.000Z';
      await repo.eliminar('r6', deletedAt);

      const stored = await db.residentes.get('r6');
      expect(stored?.deleted_at).toBe(deletedAt);
    });
  });

  describe('existePlaca', () => {
    it('retorna true si existe activo con esa placa', async () => {
      const r = makeResidente({ id: 'r7', placa: 'GGG777' });
      await repo.crear({ id: r.id, placa: r.placa, tipo: r.tipo, nombre: r.nombre, cod: r.cod, torre: r.torre, piso: r.piso, apto: r.apto, cel: r.cel, fechaRegistro: r.fechaRegistro });

      expect(await repo.existePlaca('GGG777')).toBe(true);
    });

    it('retorna false para placa inexistente', async () => {
      expect(await repo.existePlaca('ZZZ999')).toBe(false);
    });

    it('retorna false para placa de residente eliminado', async () => {
      const r = makeResidente({ id: 'r8', placa: 'HHH888' });
      await repo.crear({ id: r.id, placa: r.placa, tipo: r.tipo, nombre: r.nombre, cod: r.cod, torre: r.torre, piso: r.piso, apto: r.apto, cel: r.cel, fechaRegistro: r.fechaRegistro });
      await repo.eliminar('r8', '2024-06-01T12:00:00.000Z');

      expect(await repo.existePlaca('HHH888')).toBe(false);
    });
  });
});
