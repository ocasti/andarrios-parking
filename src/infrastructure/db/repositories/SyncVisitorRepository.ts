import { DexieVisitorRepository } from './DexieVisitorRepository';
import { enqueue } from '@/lib/sync';
import { visitorToRow } from '../mappers';
import type { Visitor } from '../../../domain/entities';

export class SyncVisitorRepository extends DexieVisitorRepository {
  override async create(visitor: Visitor): Promise<Visitor> {
    const result = await super.create(visitor);
    await enqueue({ table: 'visitantes', op: 'insert', payload: visitorToRow(result) });
    return result;
  }

  override async recordCheckOut(id: string, data: Partial<Visitor>): Promise<void> {
    await super.recordCheckOut(id, data);
    const payload: Record<string, unknown> = {};
    if (data.checkOut !== undefined) payload['salida'] = data.checkOut;
    if (data.hours !== undefined) payload['horas'] = data.hours;
    if (data.baseAmount !== undefined) payload['base'] = data.baseAmount;
    if (data.tax !== undefined) payload['iva'] = data.tax;
    if (data.total !== undefined) payload['total'] = data.total;
    payload['updated_at'] = new Date().toISOString();
    await enqueue({ table: 'visitantes', op: 'update', where: { id }, payload });
  }
}
