import type { MonthlyPayment } from '../entities';

export interface IMonthlyPaymentRepository {
  create(payment: MonthlyPayment): Promise<void>;
}
