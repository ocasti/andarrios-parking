import { enqueue } from '@/lib/sync';
import { DexieApprovedPlateRepository } from './DexieApprovedPlateRepository';
import type { ApprovedPlate } from '../../../domain/entities/ApprovedPlate';
import { approvedPlateToRow } from '../mappers';

export class SyncApprovedPlateRepository extends DexieApprovedPlateRepository {
  override async create(data: ApprovedPlate): Promise<ApprovedPlate> {
    const result = await super.create(data);
    await enqueue({ table: 'placas_aprobadas', op: 'insert', payload: approvedPlateToRow(result) });
    return result;
  }

  override async revoke(plateId: string, deletedAt: string): Promise<void> {
    await super.revoke(plateId, deletedAt);
    await enqueue({ table: 'placas_aprobadas', op: 'update', where: { id: plateId }, payload: { deleted_at: deletedAt } });
  }
}
