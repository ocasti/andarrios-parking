import { describe, it, expect, beforeEach } from 'vitest';
import { AndarriosDB } from '../../AndarriosDB';
import { DexiePagoMensualidadRepository } from '../DexiePagoMensualidadRepository';
import { makePagoMensualidad } from './factories';

describe('DexiePagoMensualidadRepository', () => {
  let db: AndarriosDB;
  let repo: DexiePagoMensualidadRepository;

  beforeEach(() => {
    db = new AndarriosDB(`test-pago-${Math.random()}`);
    repo = new DexiePagoMensualidadRepository(db);
  });

  describe('crear', () => {
    it('crear guarda el pago de mensualidad', async () => {
      const pago = makePagoMensualidad({ id: 'pago-1' });

      await repo.crear(pago);

      const stored = await db.pagos.get('pago-1');
      expect(stored).toBeDefined();
      expect(stored?.id).toBe('pago-1');
    });

    it('crear múltiples pagos se acumulan correctamente', async () => {
      const p1 = makePagoMensualidad({ id: 'pago-a', residenteId: 'res-1', mesKey: '2024-06' });
      const p2 = makePagoMensualidad({ id: 'pago-b', residenteId: 'res-2', mesKey: '2024-06' });
      const p3 = makePagoMensualidad({ id: 'pago-c', residenteId: 'res-3', mesKey: '2024-07' });

      await repo.crear(p1);
      await repo.crear(p2);
      await repo.crear(p3);

      const all = await db.pagos.toArray();
      expect(all).toHaveLength(3);
      expect(all.map((p) => p.id)).toEqual(
        expect.arrayContaining(['pago-a', 'pago-b', 'pago-c']),
      );
    });

    it('el pago creado tiene los datos correctos', async () => {
      const pago = makePagoMensualidad({
        id: 'pago-2',
        residenteId: 'res-10',
        placa: 'XYZ789',
        cod: 'T02-205',
        nombre: 'Juan Pérez',
        tipo: 'carro',
        fecha: '2024-06-15T10:00:00.000Z',
        monto: 25000,
        mesKey: '2024-06',
      });

      await repo.crear(pago);

      const stored = await db.pagos.get('pago-2');
      expect(stored?.residente_id).toBe('res-10');
      expect(stored?.placa).toBe('XYZ789');
      expect(stored?.cod).toBe('T02-205');
      expect(stored?.nombre).toBe('Juan Pérez');
      expect(stored?.tipo).toBe('carro');
      expect(stored?.fecha).toBe('2024-06-15T10:00:00.000Z');
      expect(stored?.monto).toBe(25000);
      expect(stored?.mes_key).toBe('2024-06');
    });
  });
});
