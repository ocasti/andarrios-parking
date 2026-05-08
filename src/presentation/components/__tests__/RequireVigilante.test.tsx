import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import RequireVigilante from '../guards/RequireVigilante';

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

describe('RequireVigilante', () => {
  beforeEach(() => {
    mockReplace.mockClear();
  });

  it('muestra children cuando no es admin', () => {
    mockUseAuth.mockReturnValue({ user: null, isAdmin: false, loading: false });
    render(
      <RequireVigilante>
        <span>Contenido vigilante</span>
      </RequireVigilante>
    );
    expect(screen.getByText('Contenido vigilante')).toBeInTheDocument();
  });

  it('redirige a /admin cuando es admin', () => {
    mockUseAuth.mockReturnValue({ user: { id: '1' }, isAdmin: true, loading: false });
    render(
      <RequireVigilante>
        <span>Oculto</span>
      </RequireVigilante>
    );
    expect(mockReplace).toHaveBeenCalledWith('/admin');
  });

  it('muestra cargando mientras loading', () => {
    mockUseAuth.mockReturnValue({ user: null, isAdmin: false, loading: true });
    render(
      <RequireVigilante>
        <span>Oculto</span>
      </RequireVigilante>
    );
    expect(screen.getByText('Cargando…')).toBeInTheDocument();
  });
});
