import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusBar from '../ui/StatusBar';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ replace: vi.fn(), push: vi.fn() })),
  usePathname: vi.fn(() => '/'),
}));

describe('StatusBar', () => {
  it("muestra 'En línea' cuando online y sin pendientes", () => {
    render(<StatusBar status="online" pending={0} />);
    expect(screen.getByText('En línea')).toBeInTheDocument();
  });

  it("muestra 'Sincronizando (2)' cuando online con 2 pendientes", () => {
    render(<StatusBar status="online" pending={2} />);
    expect(screen.getByText('Sincronizando (2)')).toBeInTheDocument();
  });

  it("muestra 'Sin red' cuando offline sin pendientes", () => {
    render(<StatusBar status="offline" pending={0} />);
    expect(screen.getByText('Sin red')).toBeInTheDocument();
  });

  it("muestra 'Sin red — 3 pendientes' cuando offline con 3 pendientes", () => {
    render(<StatusBar status="offline" pending={3} />);
    expect(screen.getByText('Sin red — 3 pendientes')).toBeInTheDocument();
  });

  it("muestra 'Sincronizando…' cuando syncing", () => {
    render(<StatusBar status="syncing" pending={1} />);
    expect(screen.getByText('Sincronizando… (1)')).toBeInTheDocument();
  });

  it("aplica clase CSS 'online' cuando status es online", () => {
    render(<StatusBar status="online" pending={0} />);
    const bar = screen.getByTestId('status-bar');
    expect(bar).toHaveClass('online');
  });

  it("aplica clase CSS 'offline' cuando status es offline", () => {
    render(<StatusBar status="offline" pending={0} />);
    const bar = screen.getByTestId('status-bar');
    expect(bar).toHaveClass('offline');
  });

  it("aplica clase CSS 'syncing' cuando status es syncing", () => {
    render(<StatusBar status="syncing" pending={0} />);
    const bar = screen.getByTestId('status-bar');
    expect(bar).toHaveClass('syncing');
  });
});
