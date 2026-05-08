import type { IMonthlyFeeRepository } from '../../../domain/repositories/IMonthlyFeeRepository';
import type { MonthlyFee } from '../../../domain/entities';
import type { AndarriosDB } from '../AndarriosDB';
import { monthlyFeeFromRow, monthlyFeeToRow } from '../mappers';

export class DexieMonthlyFeeRepository implements IMonthlyFeeRepository {
  constructor(private readonly db: AndarriosDB) {}

  async create(m: MonthlyFee): Promise<MonthlyFee> {
    await this.db.mensualidades.add(monthlyFeeToRow(m));
    return m;
  }

  async findByResidentAndMonth(
    residentId: string,
    monthKey: string,
  ): Promise<MonthlyFee | undefined> {
    const row = await this.db.mensualidades
      .where('[residente_id+mes_key]')
      .equals([residentId, monthKey])
      .first();
    return row ? monthlyFeeFromRow(row) : undefined;
  }

  async update(id: string, data: Partial<MonthlyFee>): Promise<void> {
    const updates: Record<string, unknown> = {};
    if (data.status !== undefined) updates['estado'] = data.status === 'pending' ? 'pendiente' : 'pagado';
    if (data.paymentDate !== undefined) updates['fecha_pago'] = data.paymentDate;
    if (data.amount !== undefined) updates['monto'] = data.amount;
    updates['updated_at'] = new Date().toISOString();
    await this.db.mensualidades.update(id, updates);
  }

  async upsert(m: MonthlyFee): Promise<void> {
    await this.db.mensualidades.put(monthlyFeeToRow(m));
  }
}
