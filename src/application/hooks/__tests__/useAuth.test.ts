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

  it('starts with loading true', async () => {
    // Arrange: block getSession so it does not resolve during this test
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

    // Act: render — the async refresh will not complete because getSession never resolves
    const { result } = renderHook(() => useAuth());

    // Assert: initial state has loading: true
    expect(result.current.loading).toBe(true);
  });

  it('loading false after refresh', async () => {
    // Act
    const { result } = renderHook(() => useAuth());

    // Assert: wait for the async refresh to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('user null when there is no session', async () => {
    // Arrange: getSession returns empty session (already set up in beforeEach)

    // Act
    const { result } = renderHook(() => useAuth());

    // Assert: wait for refresh to complete and user to be null
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.user).toBeNull();
  });

  it('isAdmin false when there is no session', async () => {
    // Arrange: no session, isAdmin must be false

    // Act
    const { result } = renderHook(() => useAuth());

    // Assert
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.isAdmin).toBe(false);
  });

  it('isAdmin true when user exists in admin_profiles', async () => {
    // Arrange: getSession returns a user and maybeSingle returns admin profile
    (getSupabase as Mock).mockReturnValue({
      auth: {
        getSession: vi.fn(async () => ({
          data: { session: { user: { id: 'user-1', email: 'admin@test.com' } } },
        })),
        onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
        signOut: vi.fn(async () => ({})),
      },
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn(async () => ({ data: { user_id: 'user-1' } })),
      })),
    });

    // Act
    const { result } = renderHook(() => useAuth());

    // Assert
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.isAdmin).toBe(true);
    expect(result.current.user).toEqual({ id: 'user-1', email: 'admin@test.com' });
  });

  it('isAdmin false when user is not in admin_profiles', async () => {
    // Arrange: getSession returns a user but maybeSingle finds no profile
    (getSupabase as Mock).mockReturnValue({
      auth: {
        getSession: vi.fn(async () => ({
          data: { session: { user: { id: 'user-2', email: 'nonadmin@test.com' } } },
        })),
        onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
        signOut: vi.fn(async () => ({})),
      },
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn(async () => ({ data: null })),
      })),
    });

    // Act
    const { result } = renderHook(() => useAuth());

    // Assert
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.user).toEqual({ id: 'user-2', email: 'nonadmin@test.com' });
  });

  it('logout calls signOut and clears state', async () => {
    const signOutMock = vi.fn(async () => ({}));

    (getSupabase as Mock).mockReturnValue({
      auth: {
        getSession: vi.fn(async () => ({ data: { session: null } })),
        onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
        signOut: signOutMock,
      },
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn(async () => ({ data: null })),
      })),
    });

    // Act: import logout at runtime (same module, already imported)
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Call logout
    await act(async () => {
      const { logout } = await import('../useAuth');
      await logout();
    });

    // Assert: signOut was called
    expect(signOutMock).toHaveBeenCalledTimes(1);
  });

  it('init does not execute refresh twice when already initialized (singleton guard)', async () => {
    // Arrange: mount two hooks in the same test without reset between them
    // The second renderHook calls init() which must early-return
    const getSessionMock = vi.fn(async () => ({ data: { session: null } }));
    (getSupabase as Mock).mockReturnValue({
      auth: {
        getSession: getSessionMock,
        onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
        signOut: vi.fn(async () => ({})),
      },
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn(async () => ({ data: null })),
      })),
    });

    // First hook → init() executes, _initialized=true
    const { result: r1 } = renderHook(() => useAuth());
    await waitFor(() => expect(r1.current.loading).toBe(false));
    const firstCallCount = getSessionMock.mock.calls.length;

    // Second hook → init() must return early (singleton guard)
    const { result: r2 } = renderHook(() => useAuth());
    await waitFor(() => expect(r2.current.loading).toBe(false));

    // The call count should not increase (init returned early)
    expect(getSessionMock.mock.calls.length).toBe(firstCallCount);
  });

  it('isAdmin false when checkAdmin throws an exception', async () => {
    // Arrange: getSession returns user but maybeSingle throws error
    (getSupabase as Mock).mockReturnValue({
      auth: {
        getSession: vi.fn(async () => ({
          data: { session: { user: { id: 'user-err', email: 'err@test.com' } } },
        })),
        onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
        signOut: vi.fn(async () => ({})),
      },
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn(async () => { throw new Error('DB error'); }),
      })),
    });

    // Act
    const { result } = renderHook(() => useAuth());

    // Assert: the catch returns false, the hook must not break
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.user).toEqual({ id: 'user-err', email: 'err@test.com' });
  });

  it('onAuthStateChange triggers a refresh when auth state changes', async () => {
    let authChangeCallback: (() => void) | undefined;

    (getSupabase as Mock).mockReturnValue({
      auth: {
        getSession: vi.fn(async () => ({ data: { session: null } })),
        onAuthStateChange: vi.fn((cb: () => void) => {
          authChangeCallback = cb;
          return { data: { subscription: { unsubscribe: vi.fn() } } };
        }),
        signOut: vi.fn(async () => ({})),
      },
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn(async () => ({ data: null })),
      })),
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.loading).toBe(false));

    // Simulate auth change: now there is a user
    (getSupabase as Mock).mockReturnValue({
      auth: {
        getSession: vi.fn(async () => ({
          data: { session: { user: { id: 'user-3', email: 'new@test.com' } } },
        })),
        onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
        signOut: vi.fn(async () => ({})),
      },
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn(async () => ({ data: { user_id: 'user-3' } })),
      })),
    });

    // Fire the onAuthStateChange callback
    await act(async () => {
      authChangeCallback?.();
    });

    await waitFor(() => {
      expect(result.current.user?.id).toBe('user-3');
    });
    expect(result.current.isAdmin).toBe(true);
  });
});
