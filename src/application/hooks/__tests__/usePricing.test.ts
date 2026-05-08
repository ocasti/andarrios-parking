import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { Subscription } from 'dexie';

// --- Mocks ---

vi.mock('dexie', async (importOriginal) => {
  const actual = await importOriginal<typeof import('dexie')>();
  return {
    ...actual,
    liveQuery: vi.fn(),
  };
});

vi.mock('@/src/infrastructure/db/AndarriosDB', () => ({
  getDB: vi.fn(),
}));

vi.mock('@/src/infrastructure/db/mappers', () => ({
  pricingFromRow: vi.fn((row) => row),
}));

// Imports after mocks
import { liveQuery } from 'dexie';
import { usePricing } from '../usePricing';
import { PRICING_DEFAULTS } from '@/src/domain/entities/PricingConfig';
import { PRICING_ID } from '@/src/domain/constants';

const PRICING_FALLBACK = { id: PRICING_ID, ...PRICING_DEFAULTS, updatedAt: '' };

type ObserverLike = {
  next?: (value: unknown) => void;
  error?: (e: unknown) => void;
};

function makeSubscription(observer: ObserverLike): Subscription {
  return {
    unsubscribe: vi.fn(),
    closed: false,
  } as unknown as Subscription;
}

describe('usePricing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns PRICING_FALLBACK when there is no data', () => {
    // Arrange: liveQuery returns an observable that emits nothing
    (liveQuery as Mock).mockReturnValue({
      subscribe: (obs: ObserverLike) => makeSubscription(obs),
    });

    // Act
    const { result } = renderHook(() => usePricing());

    // Assert
    expect(result.current).toEqual(PRICING_FALLBACK);
  });

  it('does not change state when row is undefined (next with undefined)', () => {
    (liveQuery as Mock).mockReturnValue({
      subscribe: (obs: ObserverLike) => {
        obs.next?.(undefined);
        return makeSubscription(obs);
      },
    });

    const { result } = renderHook(() => usePricing());

    expect(result.current).toEqual(PRICING_FALLBACK);
  });

  it('calls console.warn when the observable emits an error', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    (liveQuery as Mock).mockReturnValue({
      subscribe: (obs: ObserverLike) => {
        obs.error?.(new Error('DB error'));
        return makeSubscription(obs);
      },
    });

    renderHook(() => usePricing());

    expect(warnSpy).toHaveBeenCalledWith('[usePricing]', expect.any(Error));
    warnSpy.mockRestore();
  });

  it('returns the mapped pricing config when it exists in DB', async () => {
    // Arrange: pricing config from DB (already mapped, since pricingFromRow is identity in the mock)
    const pricingDB = {
      id: PRICING_ID,
      carMonthlyRate: 25000,
      motorcycleMonthlyRate: 12000,
      hourlyRate: 1500,
      freeHours: 2,
      iva: 19,
      visitorCapacity: 10,
      minHoursForCourtesy: 6,
      updatedAt: '2024-01-01T00:00:00Z',
    };

    (liveQuery as Mock).mockReturnValue({
      subscribe: (obs: ObserverLike) => {
        // Emit synchronously inside subscribe
        obs.next?.(pricingDB);
        return makeSubscription(obs);
      },
    });

    // Act
    const { result } = renderHook(() => usePricing());

    // Assert
    expect(result.current).toEqual(pricingDB);
  });
});
