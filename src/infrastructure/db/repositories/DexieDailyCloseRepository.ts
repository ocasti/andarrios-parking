import type { IDailyCloseRepository } from '../../../domain/repositories/IDailyCloseRepository';
import type { DailyClose } from '../../../domain/entities';
import type { AndarriosDB } from '../AndarriosDB';
import { dailyCloseFromRow, dailyCloseToRow } from '../mappers';

export class DexieDailyCloseRepository implements IDailyCloseRepository {
  constructor(private readonly db: AndarriosDB) {}

  async create(close: DailyClose): Promise<void> {
    await this.db.cierres.add(dailyCloseToRow(close));
  }

  async list(): Promise<DailyClose[]> {
    const rows = await this.db.cierres.toArray();
    return rows.map(dailyCloseFromRow);
  }
}
