import type { IPricingRepository } from '../../../domain/repositories/IPricingRepository';
import type { PricingConfig } from '../../../domain/entities';
import type { AndarriosDB } from '../AndarriosDB';
import { pricingFromRow, pricingToRow } from '../mappers';
import { PRICING_ID } from '../../../domain/constants';

export class DexiePricingRepository implements IPricingRepository {
  constructor(private readonly db: AndarriosDB) {}

  async get(): Promise<PricingConfig | undefined> {
    const row = await this.db.tarifas.get(PRICING_ID);
    return row ? pricingFromRow(row) : undefined;
  }

  async save(t: PricingConfig): Promise<void> {
    await this.db.tarifas.put(pricingToRow(t));
  }
}
