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
  tarifaFromRow: vi.fn((row) => row),
}));

// Imports after mocks
import { liveQuery } from 'dexie';
import { useTarifas } from '../useTarifas';
import { TARIFA_DEFAULTS } from '@/src/domain/entities/Tarifa';
import { TARIFAS_ID } from '@/src/domain/constants';

const TARIFA_FALLBACK = { id: TARIFAS_ID, ...TARIFA_DEFAULTS, updatedAt: '' };

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

describe('useTarifas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retorna TARIFA_FALLBACK cuando no hay datos', () => {
    // Arrange: liveQuery devuelve un observable que no emite nada
    (liveQuery as Mock).mockReturnValue({
      subscribe: (obs: ObserverLike) => makeSubscription(obs),
    });

    // Act
    const { result } = renderHook(() => useTarifas());

    // Assert
    expect(result.current).toEqual(TARIFA_FALLBACK);
  });

  it('retorna la tarifa mapeada cuando existe en DB', async () => {
    // Arrange: tarifa que viene de la DB (ya mapeada, porque tarifaFromRow es identity en el mock)
    const tarifaDB = {
      id: TARIFAS_ID,
      carroMes: 25000,
      motoMes: 12000,
      visHora: 1500,
      horasGratis: 2,
      iva: 19,
      capacidadVisitantes: 10,
      horasMinRecortesia: 6,
      updatedAt: '2024-01-01T00:00:00Z',
    };

    (liveQuery as Mock).mockReturnValue({
      subscribe: (obs: ObserverLike) => {
        // Emitir sincrónicamente dentro de subscribe
        obs.next?.(tarifaDB);
        return makeSubscription(obs);
      },
    });

    // Act
    const { result } = renderHook(() => useTarifas());

    // Assert
    expect(result.current).toEqual(tarifaDB);
  });
});
