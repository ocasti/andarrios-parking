import { describe, it, expect, beforeEach } from 'vitest';
import { AndarriosDB } from '../../AndarriosDB';
import { DexieMonthlyPaymentRepository } from '../DexieMonthlyPaymentRepository';
import { makeMonthlyPayment } from './factories';

describe('DexieMonthlyPaymentRepository', () => {
  let db: AndarriosDB;
  let repo: DexieMonthlyPaymentRepository;

  beforeEach(() => {
    db = new AndarriosDB(`test-monthly-payment-${Math.random()}`);
    repo = new DexieMonthlyPaymentRepository(db);
  });

  describe('create', () => {
    it('saves the monthly payment', async () => {
      const payment = makeMonthlyPayment({ id: 'pago-1' });

      await repo.create(payment);

      const stored = await db.pagos.get('pago-1');
      expect(stored).toBeDefined();
      expect(stored?.id).toBe('pago-1');
    });

    it('accumulates multiple payments correctly', async () => {
      const p1 = makeMonthlyPayment({ id: 'pago-a', residentId: 'res-1', monthKey: '2024-06' });
      const p2 = makeMonthlyPayment({ id: 'pago-b', residentId: 'res-2', monthKey: '2024-06' });
      const p3 = makeMonthlyPayment({ id: 'pago-c', residentId: 'res-3', monthKey: '2024-07' });

      await repo.create(p1);
      await repo.create(p2);
      await repo.create(p3);

      const all = await db.pagos.toArray();
      expect(all).toHaveLength(3);
      expect(all.map((p) => p.id)).toEqual(
        expect.arrayContaining(['pago-a', 'pago-b', 'pago-c']),
      );
    });

    it('stores the correct data in the DB row', async () => {
      const payment = makeMonthlyPayment({
        id: 'pago-2',
        residentId: 'res-10',
        plate: 'XYZ789',
        aptCode: 'T02-205',
        name: 'Juan Pérez',
        vehicleType: 'car',
        date: '2024-06-15T10:00:00.000Z',
        amount: 25000,
        monthKey: '2024-06',
      });

      await repo.create(payment);

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
