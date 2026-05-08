import { DexieMonthlyFeeRepository } from './DexieMonthlyFeeRepository';
import { enqueue } from '@/lib/sync';
import { monthlyFeeToRow } from '../mappers';
import type { MonthlyFee } from '../../../domain/entities';

export class SyncMonthlyFeeRepository extends DexieMonthlyFeeRepository {
  override async create(m: MonthlyFee): Promise<MonthlyFee> {
    const result = await super.create(m);
    await enqueue({ table: 'mensualidades', op: 'insert', payload: monthlyFeeToRow(m) });
    return result;
  }

  override async update(id: string, data: Partial<MonthlyFee>): Promise<void> {
    await super.update(id, data);
    const payload: Record<string, unknown> = {};
    if (data.status !== undefined) payload['estado'] = data.status === 'pending' ? 'pendiente' : 'pagado';
    if (data.paymentDate !== undefined) payload['fecha_pago'] = data.paymentDate;
    if (data.amount !== undefined) payload['monto'] = data.amount;
    payload['updated_at'] = new Date().toISOString();
    await enqueue({ table: 'mensualidades', op: 'update', where: { id }, payload });
  }
}
