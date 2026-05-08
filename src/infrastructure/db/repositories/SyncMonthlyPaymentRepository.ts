import { DexieMonthlyPaymentRepository } from './DexieMonthlyPaymentRepository';
import { enqueue } from '@/lib/sync';
import { monthlyPaymentToRow } from '../mappers';
import type { MonthlyPayment } from '../../../domain/entities';

export class SyncMonthlyPaymentRepository extends DexieMonthlyPaymentRepository {
  override async create(payment: MonthlyPayment): Promise<void> {
    await super.create(payment);
    await enqueue({
      table: 'pagos_mensualidades',
      op: 'insert',
      payload: monthlyPaymentToRow(payment),
    });
  }
}
