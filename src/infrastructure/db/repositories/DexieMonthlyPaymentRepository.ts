import type { IMonthlyPaymentRepository } from '../../../domain/repositories/IMonthlyPaymentRepository';
import type { MonthlyPayment } from '../../../domain/entities';
import type { AndarriosDB } from '../AndarriosDB';
import { monthlyPaymentToRow } from '../mappers';

export class DexieMonthlyPaymentRepository implements IMonthlyPaymentRepository {
  constructor(private readonly db: AndarriosDB) {}

  async create(payment: MonthlyPayment): Promise<void> {
    await this.db.pagos.add(monthlyPaymentToRow(payment));
  }
}
