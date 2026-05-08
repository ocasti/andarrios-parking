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

  it('returns initial online state with pending 0', () => {
    // Act
    const { result } = renderHook(() => useSync());

    // Assert
    expect(result.current.status).toBe('online');
    expect(result.current.pending).toBe(0);
  });

  it('reflects subscribeStatus changes', () => {
    // Arrange: capture the callback to fire it manually
    let capturedCb: ((s: string, p: number) => void) | null = null;
    (subscribeStatus as Mock).mockImplementation((cb: (s: string, p: number) => void) => {
      capturedCb = cb;
      cb('online', 0); // initial state
      return () => {};
    });

    // Act
    const { result } = renderHook(() => useSync());

    // Verify initial state
    expect(result.current.status).toBe('online');
    expect(result.current.pending).toBe(0);

    // Fire state change to syncing with 3 pending
    act(() => {
      capturedCb?.('syncing', 3);
    });

    // Assert: the hook reflects the new state
    expect(result.current.status).toBe('syncing');
    expect(result.current.pending).toBe(3);
  });
});
