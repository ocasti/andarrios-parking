import type { ActivityLog } from '../entities';

export interface IActivityLogRepository {
  log(a: ActivityLog): Promise<void>;
}
