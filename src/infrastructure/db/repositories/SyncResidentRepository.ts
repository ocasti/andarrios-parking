import { DexieResidentRepository } from './DexieResidentRepository';
import { enqueue } from '@/lib/sync';
import { residentToRow } from '../mappers';
import type { Resident, NewResident } from '../../../domain/entities';

export class SyncResidentRepository extends DexieResidentRepository {
  override async create(data: NewResident & { id: string }): Promise<Resident> {
    const result = await super.create(data);
    await enqueue({ table: 'residentes', op: 'insert', payload: residentToRow(result) });
    return result;
  }

  override async softDelete(id: string, deletedAt: string): Promise<void> {
    await super.softDelete(id, deletedAt);
    await enqueue({
      table: 'residentes',
      op: 'update',
      where: { id },
      payload: { deleted_at: deletedAt, updated_at: deletedAt },
    });
  }
}
