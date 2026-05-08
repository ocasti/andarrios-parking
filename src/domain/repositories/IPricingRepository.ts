import type { PricingConfig } from '../entities';

export interface IPricingRepository {
  get(): Promise<PricingConfig | undefined>;
  save(t: PricingConfig): Promise<void>;
}
