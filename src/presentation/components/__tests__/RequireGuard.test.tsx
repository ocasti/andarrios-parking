import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import RequireGuard from '../guards/RequireGuard';

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

describe('RequireGuard', () => {
  beforeEach(() => {
    mockReplace.mockClear();
  });

  it('shows children when not admin', () => {
    mockUseAuth.mockReturnValue({ user: null, isAdmin: false, loading: false });
    render(
      <RequireGuard>
        <span>Guard content</span>
      </RequireGuard>
    );
    expect(screen.getByText('Guard content')).toBeInTheDocument();
  });

  it('redirects to /admin when admin', () => {
    mockUseAuth.mockReturnValue({ user: { id: '1' }, isAdmin: true, loading: false });
    render(
      <RequireGuard>
        <span>Hidden</span>
      </RequireGuard>
    );
    expect(mockReplace).toHaveBeenCalledWith('/admin');
  });

  it('shows loading while loading', () => {
    mockUseAuth.mockReturnValue({ user: null, isAdmin: false, loading: true });
    render(
      <RequireGuard>
        <span>Hidden</span>
      </RequireGuard>
    );
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });
});
