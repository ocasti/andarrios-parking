'use client';
import { useEffect, useState } from 'react';
import { liveQuery } from 'dexie';
import { getDB } from '@/src/infrastructure/db/AndarriosDB';
import { tarifaFromRow } from '@/src/infrastructure/db/mappers';
import type { Tarifa } from '@/src/domain/entities';
import { TARIFA_DEFAULTS } from '@/src/domain/entities/Tarifa';
import { TARIFAS_ID } from '@/src/domain/constants';

const TARIFA_FALLBACK: Tarifa = { id: TARIFAS_ID, ...TARIFA_DEFAULTS, updatedAt: '' };

export function useTarifas(): Tarifa {
  const [tarifa, setTarifa] = useState<Tarifa>(TARIFA_FALLBACK);

  useEffect(() => {
    const sub = liveQuery(() => getDB().tarifas.get(TARIFAS_ID)).subscribe({
      next: (row) => { if (row) setTarifa(tarifaFromRow(row)); },
      error: (e) => console.warn('[useTarifas]', e),
    });
    return () => sub.unsubscribe();
  }, []);

  return tarifa;
}
