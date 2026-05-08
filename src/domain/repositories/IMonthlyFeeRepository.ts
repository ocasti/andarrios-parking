import type { MonthlyFee } from '../entities';

export interface IMonthlyFeeRepository {
  create(m: MonthlyFee): Promise<MonthlyFee>;
  findByResidentAndMonth(residentId: string, monthKey: string): Promise<MonthlyFee | undefined>;
  update(id: string, updates: Partial<MonthlyFee>): Promise<void>;
  upsert(m: MonthlyFee): Promise<void>;
}
