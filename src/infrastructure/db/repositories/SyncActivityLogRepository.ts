import { DexieActivityLogRepository } from './DexieActivityLogRepository';
import { enqueue } from '@/lib/sync';
import { activityLogToRow } from '../mappers';
import type { ActivityLog } from '../../../domain/entities';

export class SyncActivityLogRepository extends DexieActivityLogRepository {
  override async log(a: ActivityLog): Promise<void> {
    await super.log(a);
    await enqueue({ table: 'actividad', op: 'insert', payload: activityLogToRow(a) });
  }
}
