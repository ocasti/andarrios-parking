import type { DailyClose } from '../entities';

export interface IDailyCloseRepository {
  create(close: DailyClose): Promise<void>;
  list(): Promise<DailyClose[]>;
}
