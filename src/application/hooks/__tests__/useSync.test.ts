import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// --- Mocks ---

vi.mock('@/lib/sync', () => ({
  initSync: vi.fn(async () => {}),
  subscribeStatus: vi.fn((cb: (s: string, p: number) => void) => {
    cb('online', 0);
    return () => {};
  }),
}));

// Imports after mocks
import { initSync, subscribeStatus } from '@/lib/sync';
import { useSync } from '../useSync';

describe('useSync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Re-setup the default mock behavior after clearAllMocks
    (subscribeStatus as Mock).mockImplementation((cb: (s: string, p: number) => void) => {
      cb('online', 0);
      return () => {};
    });
    (initSync as Mock).mockResolvedValue(undefined);
  });

  it('retorna estado inicial online con pending 0', () => {
    // Act
    const { result } = renderHook(() => useSync());

    // Assert
    expect(result.current.status).toBe('online');
    expect(result.current.pending).toBe(0);
  });

  it('refleja cambios del subscribeStatus', () => {
    // Arrange: capturamos el callback para dispararlo manualmente
    let capturedCb: ((s: string, p: number) => void) | null = null;
    (subscribeStatus as Mock).mockImplementation((cb: (s: string, p: number) => void) => {
      capturedCb = cb;
      cb('online', 0); // estado inicial
      return () => {};
    });

    // Act
    const { result } = renderHook(() => useSync());

    // Verificamos estado inicial
    expect(result.current.status).toBe('online');
    expect(result.current.pending).toBe(0);

    // Disparamos cambio de estado a syncing con 3 pendientes
    act(() => {
      capturedCb?.('syncing', 3);
    });

    // Assert: el hook refleja el nuevo estado
    expect(result.current.status).toBe('syncing');
    expect(result.current.pending).toBe(3);
  });
});
