'use client';
import { useEffect, useState } from 'react';
import { liveQuery } from 'dexie';
import { getDB } from '@/src/infrastructure/db/AndarriosDB';
import { pricingFromRow } from '@/src/infrastructure/db/mappers';
import type { PricingConfig } from '@/src/domain/entities';
import { PRICING_DEFAULTS } from '@/src/domain/entities/PricingConfig';
import { PRICING_ID } from '@/src/domain/constants';

const PRICING_FALLBACK: PricingConfig = { id: PRICING_ID, ...PRICING_DEFAULTS, updatedAt: '' };

export function usePricing(): PricingConfig {
  const [pricing, setPricing] = useState<PricingConfig>(PRICING_FALLBACK);

  useEffect(() => {
    const sub = liveQuery(() => getDB().tarifas.get(PRICING_ID)).subscribe({
      next: (row) => { if (row) setPricing(pricingFromRow(row)); },
      error: (e) => console.warn('[usePricing]', e),
    });
    return () => sub.unsubscribe();
  }, []);

  return pricing;
}
