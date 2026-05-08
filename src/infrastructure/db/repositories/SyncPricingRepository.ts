import { DexiePricingRepository } from './DexiePricingRepository';
import { enqueue } from '@/lib/sync';
import { pricingToRow } from '../mappers';
import type { PricingConfig } from '../../../domain/entities';

export class SyncPricingRepository extends DexiePricingRepository {
  override async save(t: PricingConfig): Promise<void> {
    await super.save(t);
    const { id, ...rest } = pricingToRow(t);
    await enqueue({ table: 'tarifas', op: 'update', where: { id }, payload: rest });
  }
}
