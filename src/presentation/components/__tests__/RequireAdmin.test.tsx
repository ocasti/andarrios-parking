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

  it('shows children when isAdmin=true', () => {
    mockUseAuth.mockReturnValue({ user: { id: '1' }, isAdmin: true, loading: false });
    render(
      <RequireAdmin>
        <span>Admin content</span>
      </RequireAdmin>
    );
    expect(screen.getByText('Admin content')).toBeInTheDocument();
  });

  it('redirects to /admin when isAdmin=false and not loading', () => {
    mockUseAuth.mockReturnValue({ user: null, isAdmin: false, loading: false });
    render(
      <RequireAdmin>
        <span>Hidden</span>
      </RequireAdmin>
    );
    expect(mockReplace).toHaveBeenCalledWith('/admin');
  });

  it('shows loading text when loading=true', () => {
    mockUseAuth.mockReturnValue({ user: null, isAdmin: false, loading: true });
    render(
      <RequireAdmin>
        <span>Hidden</span>
      </RequireAdmin>
    );
    expect(screen.getByText('Verifying access…')).toBeInTheDocument();
  });
});
