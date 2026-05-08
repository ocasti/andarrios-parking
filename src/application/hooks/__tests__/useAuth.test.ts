import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

// --- Mocks ---

vi.mock('@/lib/supabase', () => ({
  getSupabase: vi.fn(() => ({
    auth: {
      getSession: vi.fn(async () => ({ data: { session: null } })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      signOut: vi.fn(async () => ({})),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn(async () => ({ data: null })),
    })),
  })),
}));

// Imports after mocks
import { getSupabase } from '@/lib/supabase';
import { useAuth, _resetAuthForTests } from '../useAuth';

describe('useAuth', () => {
  beforeEach(() => {
    _resetAuthForTests();
    vi.clearAllMocks();

    // Re-setup default mock after clearAllMocks
    (getSupabase as Mock).mockReturnValue({
      auth: {
        getSession: vi.fn(async () => ({ data: { session: null } })),
        onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
        signOut: vi.fn(async () => ({})),
      },
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn(async () => ({ data: null })),
      })),
    });
  });

  it('inicia con loading true', async () => {
    // Arrange: bloqueamos getSession para que no resuelva durante este test
    (getSupabase as Mock).mockReturnValue({
      auth: {
        getSession: vi.fn(() => new Promise<{ data: { session: null } }>(() => {})), // never resolves
        onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
        signOut: vi.fn(async () => ({})),
      },
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn(async () => ({ data: null })),
      })),
    });

    // Act: renderizar — el refresh asíncrono no completará porque getSession no resuelve
    const { result } = renderHook(() => useAuth());

    // Assert: el estado inicial tiene loading: true
    expect(result.current.loading).toBe(true);
  });

  it('loading false después de refresh', async () => {
    // Act
    const { result } = renderHook(() => useAuth());

    // Assert: esperar a que el refresh asíncrono complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('user null cuando no hay sesión', async () => {
    // Arrange: getSession devuelve sesión vacía (ya configurado en beforeEach)

    // Act
    const { result } = renderHook(() => useAuth());

    // Assert: esperar que el refresh complete y user sea null
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.user).toBeNull();
  });

  it('isAdmin false cuando no hay sesión', async () => {
    // Arrange: sin sesión, isAdmin debe ser false

    // Act
    const { result } = renderHook(() => useAuth());

    // Assert
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.isAdmin).toBe(false);
  });
});
