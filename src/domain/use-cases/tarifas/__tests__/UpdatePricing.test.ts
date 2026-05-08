import { describe, it, expect, vi } from 'vitest';
import { updatePricing } from '../UpdatePricing';
import type { UpdatePricingDeps } from '../UpdatePricing';
import type { PricingConfig } from '../../../entities';

const NOW = '2026-04-01T08:00:00.000Z';

const currentPricing: PricingConfig = {
  id: 1,
  carMonthlyRate: 20000,
  motorcycleMonthlyRate: 10000,
  hourlyRate: 1000,
  freeHours: 2,
  iva: 19,
  visitorCapacity: 0,
  minHoursForCourtesy: 6,
  updatedAt: '2025-01-01T00:00:00.000Z',
};

function buildDeps(overrides: Partial<UpdatePricingDeps> = {}): UpdatePricingDeps {
  return {
    pricingRepo: {
      save: vi.fn().mockResolvedValue(undefined),
    },
    activityRepo: {
      log: vi.fn().mockResolvedValue(undefined),
    },
    now: vi.fn().mockReturnValue(NOW),
    ...overrides,
  };
}

describe('updatePricing', () => {
  it('updates only sent fields', async () => {
    // Arrange
    const deps = buildDeps();
    const updates = { carMonthlyRate: 25000 };

    // Act
    const result = await updatePricing(updates, currentPricing, deps);

    // Assert
    expect(result.carMonthlyRate).toBe(25000);
  });

  it('keeps unsent fields with previous values', async () => {
    // Arrange
    const deps = buildDeps();
    const updates = { carMonthlyRate: 25000 };

    // Act
    const result = await updatePricing(updates, currentPricing, deps);

    // Assert
    expect(result.motorcycleMonthlyRate).toBe(currentPricing.motorcycleMonthlyRate);
    expect(result.hourlyRate).toBe(currentPricing.hourlyRate);
    expect(result.freeHours).toBe(currentPricing.freeHours);
    expect(result.iva).toBe(currentPricing.iva);
    expect(result.visitorCapacity).toBe(currentPricing.visitorCapacity);
    expect(result.minHoursForCourtesy).toBe(currentPricing.minHoursForCourtesy);
    expect(result.id).toBe(currentPricing.id);
  });

  it('updates updatedAt', async () => {
    // Arrange
    const deps = buildDeps();

    // Act
    const result = await updatePricing({}, currentPricing, deps);

    // Assert
    expect(result.updatedAt).toBe(NOW);
    expect(result.updatedAt).not.toBe(currentPricing.updatedAt);
  });

  it('saves in repo', async () => {
    // Arrange
    const deps = buildDeps();
    const updates = { motorcycleMonthlyRate: 12000, iva: 20 };

    // Act
    const result = await updatePricing(updates, currentPricing, deps);

    // Assert
    expect(deps.pricingRepo.save).toHaveBeenCalledOnce();
    expect(deps.pricingRepo.save).toHaveBeenCalledWith(result);
  });

  it('logs activity', async () => {
    // Arrange
    const deps = buildDeps();

    // Act
    await updatePricing({ hourlyRate: 1500 }, currentPricing, deps);

    // Assert
    expect(deps.activityRepo.log).toHaveBeenCalledOnce();
    const actArg = (deps.activityRepo.log as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(actArg.category).toBe('pricing');
    expect(actArg.ts).toBe(NOW);
  });
});
