import { DexieDailyCloseRepository } from './DexieDailyCloseRepository';
import { enqueue } from '@/lib/sync';
import { dailyCloseToRow } from '../mappers';
import type { DailyClose } from '../../../domain/entities';

export class SyncDailyCloseRepository extends DexieDailyCloseRepository {
  override async create(close: DailyClose): Promise<void> {
    await super.create(close);
    await enqueue({ table: 'cierres_caja', op: 'insert', payload: dailyCloseToRow(close) });
  }
}
