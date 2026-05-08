import { describe, it, expect, beforeEach } from 'vitest';
import { AndarriosDB } from '../../AndarriosDB';
import { DexieVisitanteRepository } from '../DexieVisitanteRepository';
import { makeVisitante } from './factories';

describe('DexieVisitanteRepository', () => {
  let db: AndarriosDB;
  let repo: DexieVisitanteRepository;

  beforeEach(() => {
    db = new AndarriosDB(`test-visitante-${Math.random()}`);
    repo = new DexieVisitanteRepository(db);
  });

  describe('crear', () => {
    it('guarda visitante', async () => {
      const v = makeVisitante({ id: 'v1', placa: 'VIS001' });

      const result = await repo.crear(v);

      expect(result.id).toBe('v1');
      const stored = await db.visitantes.get('v1');
      expect(stored?.placa).toBe('VIS001');
    });
  });

  describe('listarActivos', () => {
    it('retorna solo sin salida', async () => {
      const activo = makeVisitante({ id: 'v2', placa: 'VIS002', salida: null });
      const conSalida = makeVisitante({
        id: 'v3',
        placa: 'VIS003',
        salida: '2024-06-01T12:00:00.000Z',
      });
      await repo.crear(activo);
      await repo.crear(conSalida);

      const activos = await repo.listarActivos();

      expect(activos.some((x) => x.id === 'v2')).toBe(true);
      expect(activos.some((x) => x.id === 'v3')).toBe(false);
    });
  });

  describe('existePlacaActiva', () => {
    it('retorna true para placa sin salida', async () => {
      const v = makeVisitante({ id: 'v4', placa: 'ACTIVA1', salida: null });
      await repo.crear(v);

      expect(await repo.existePlacaActiva('ACTIVA1')).toBe(true);
    });

    it('retorna false para placa con salida', async () => {
      const v = makeVisitante({
        id: 'v5',
        placa: 'SALIDA1',
        salida: '2024-06-01T14:00:00.000Z',
      });
      await repo.crear(v);

      expect(await repo.existePlacaActiva('SALIDA1')).toBe(false);
    });
  });

  describe('registrarSalida', () => {
    it('actualiza los campos de salida', async () => {
      const v = makeVisitante({ id: 'v6', placa: 'VIS006', salida: null });
      await repo.crear(v);

      await repo.registrarSalida('v6', {
        salida: '2024-06-01T12:00:00.000Z',
        horas: 2,
        base: 2000,
        iva: 380,
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

  describe('contarActivos', () => {
    it('cuenta correctamente', async () => {
      await repo.crear(makeVisitante({ id: 'v7', placa: 'CNT001', salida: null }));
      await repo.crear(makeVisitante({ id: 'v8', placa: 'CNT002', salida: null }));
      await repo.crear(
        makeVisitante({ id: 'v9', placa: 'CNT003', salida: '2024-06-01T12:00:00.000Z' }),
      );

      const count = await repo.contarActivos();

      expect(count).toBe(2);
    });
  });

  describe('obtenerUltimaSalidaPorPlaca', () => {
    it('retorna la salida más reciente', async () => {
      const placa = 'REINGRESO1';
      await repo.crear(
        makeVisitante({ id: 'v10', placa, salida: '2024-06-01T10:00:00.000Z' }),
      );
      await repo.crear(
        makeVisitante({ id: 'v11', placa, salida: '2024-06-01T14:00:00.000Z' }),
      );

      const ultima = await repo.obtenerUltimaSalidaPorPlaca(placa, '2024-06-01T00:00:00.000Z');

      expect(ultima).toBeDefined();
      expect(ultima?.id).toBe('v11');
    });
  });
});
