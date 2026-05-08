import type { IActivityLogRepository } from '../../../domain/repositories/IActivityLogRepository';
import type { ActivityLog } from '../../../domain/entities';
import type { AndarriosDB } from '../AndarriosDB';
import { activityLogToRow } from '../mappers';

export class DexieActivityLogRepository implements IActivityLogRepository {
  constructor(private readonly db: AndarriosDB) {}

  async log(a: ActivityLog): Promise<void> {
    await this.db.actividad.add(activityLogToRow(a));
  }
}
