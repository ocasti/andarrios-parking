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

  it('isAdmin true cuando el usuario existe en admin_profiles', async () => {
    // Arrange: getSession retorna un usuario y maybeSingle retorna perfil admin
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

  it('isAdmin false cuando el usuario no está en admin_profiles', async () => {
    // Arrange: getSession retorna un usuario pero maybeSingle no encuentra perfil
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

  it('logout llama a signOut y limpia el estado', async () => {
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

    // Llamar logout
    await act(async () => {
      const { logout } = await import('../useAuth');
      await logout();
    });

    // Assert: signOut fue llamado
    expect(signOutMock).toHaveBeenCalledTimes(1);
  });

  it('init no ejecuta refresh dos veces cuando ya está inicializado (singleton guard)', async () => {
    // Arrange: montar dos hooks en la misma prueba sin reset entre ellos
    // El segundo renderHook llama a init() que debe hacer early-return
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

    // Primer hook → init() ejecuta, _initialized=true
    const { result: r1 } = renderHook(() => useAuth());
    await waitFor(() => expect(r1.current.loading).toBe(false));
    const firstCallCount = getSessionMock.mock.calls.length;

    // Segundo hook → init() debe retornar temprano (singleton guard)
    const { result: r2 } = renderHook(() => useAuth());
    await waitFor(() => expect(r2.current.loading).toBe(false));

    // El número de llamadas no debería aumentar (init fue early-return)
    expect(getSessionMock.mock.calls.length).toBe(firstCallCount);
  });

  it('isAdmin false cuando checkAdmin lanza una excepción', async () => {
    // Arrange: getSession retorna usuario pero maybeSingle lanza error
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

    // Assert: el catch devuelve false, no debe romperse el hook
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.user).toEqual({ id: 'user-err', email: 'err@test.com' });
  });

  it('onAuthStateChange dispara un refresh cuando cambia el estado de auth', async () => {
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

    // Simular cambio de auth: ahora hay un usuario
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

    // Disparar el callback de onAuthStateChange
    await act(async () => {
      authChangeCallback?.();
    });

    await waitFor(() => {
      expect(result.current.user?.id).toBe('user-3');
    });
    expect(result.current.isAdmin).toBe(true);
  });
});
