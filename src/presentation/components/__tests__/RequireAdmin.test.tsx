import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import RequireAdmin from '../guards/RequireAdmin';

const mockReplace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ replace: mockReplace, push: vi.fn() })),
  usePathname: vi.fn(() => '/'),
}));

vi.mock('@/src/application/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '@/src/application/hooks/useAuth';

const mockUseAuth = useAuth as ReturnType<typeof vi.fn>;

describe('RequireAdmin', () => {
  beforeEach(() => {
    mockReplace.mockClear();
  });

  it('muestra children cuando isAdmin=true', () => {
    mockUseAuth.mockReturnValue({ user: { id: '1' }, isAdmin: true, loading: false });
    render(
      <RequireAdmin>
        <span>Contenido admin</span>
      </RequireAdmin>
    );
    expect(screen.getByText('Contenido admin')).toBeInTheDocument();
  });

  it('redirige a /admin cuando isAdmin=false y no loading', () => {
    mockUseAuth.mockReturnValue({ user: null, isAdmin: false, loading: false });
    render(
      <RequireAdmin>
        <span>Oculto</span>
      </RequireAdmin>
    );
    expect(mockReplace).toHaveBeenCalledWith('/admin');
  });

  it('muestra texto de carga cuando loading=true', () => {
    mockUseAuth.mockReturnValue({ user: null, isAdmin: false, loading: true });
    render(
      <RequireAdmin>
        <span>Oculto</span>
      </RequireAdmin>
    );
    expect(screen.getByText('Verificando acceso…')).toBeInTheDocument();
  });
});
