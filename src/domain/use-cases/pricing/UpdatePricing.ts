import type { PricingConfig, ActivityLog } from '../../entities';

export interface UpdatePricingDeps {
  pricingRepo: {
    save(t: PricingConfig): Promise<void>;
  };
  activityRepo: {
    log(a: ActivityLog): Promise<void>;
  };
  now(): string;
}

export async function updatePricing(
  updates: Partial<Omit<PricingConfig, 'id' | 'updatedAt'>>,
  currentPricing: PricingConfig,
  deps: UpdatePricingDeps,
): Promise<PricingConfig> {
  const updatedAt = deps.now();

  const updatedPricing: PricingConfig = {
    ...currentPricing,
    ...updates,
    updatedAt,
  };

  await deps.pricingRepo.save(updatedPricing);

  await deps.activityRepo.log({
    id: updatedAt + '-act',
    msg: `Pricing updated`,
    ts: updatedAt,
    category: 'pricing',
  });

  return updatedPricing;
}
