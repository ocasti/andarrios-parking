import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusBar from '../ui/StatusBar';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ replace: vi.fn(), push: vi.fn() })),
  usePathname: vi.fn(() => '/'),
}));

describe('StatusBar', () => {
  it("shows 'Online' when online and no pending", () => {
    render(<StatusBar status="online" pending={0} />);
    expect(screen.getByText('Online')).toBeInTheDocument();
  });

  it("shows 'Syncing (2)' when online with 2 pending", () => {
    render(<StatusBar status="online" pending={2} />);
    expect(screen.getByText('Syncing (2)')).toBeInTheDocument();
  });

  it("shows 'No network' when offline and no pending", () => {
    render(<StatusBar status="offline" pending={0} />);
    expect(screen.getByText('No network')).toBeInTheDocument();
  });

  it("shows 'No network — 3 pending' when offline with 3 pending", () => {
    render(<StatusBar status="offline" pending={3} />);
    expect(screen.getByText('No network — 3 pending')).toBeInTheDocument();
  });

  it("shows 'Syncing…' when syncing", () => {
    render(<StatusBar status="syncing" pending={1} />);
    expect(screen.getByText('Syncing… (1)')).toBeInTheDocument();
  });

  it("applies CSS class 'online' when status is online", () => {
    render(<StatusBar status="online" pending={0} />);
    const bar = screen.getByTestId('status-bar');
    expect(bar).toHaveClass('online');
  });

  it("applies CSS class 'offline' when status is offline", () => {
    render(<StatusBar status="offline" pending={0} />);
    const bar = screen.getByTestId('status-bar');
    expect(bar).toHaveClass('offline');
  });

  it("applies CSS class 'syncing' when status is syncing", () => {
    render(<StatusBar status="syncing" pending={0} />);
    const bar = screen.getByTestId('status-bar');
    expect(bar).toHaveClass('syncing');
  });
});
