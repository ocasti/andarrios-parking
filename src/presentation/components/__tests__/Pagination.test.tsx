import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Pagination from '../ui/Pagination';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ replace: vi.fn(), push: vi.fn() })),
  usePathname: vi.fn(() => '/'),
}));

describe('Pagination', () => {
  const defaultProps = {
    page: 2,
    totalPages: 5,
    total: 50,
    pageSize: 10,
    onChange: vi.fn(),
  };

  it('muestra el número de página actual', () => {
    render(<Pagination {...defaultProps} />);
    expect(screen.getByText('2 / 5')).toBeInTheDocument();
  });

  it('llama onChange con página anterior al hacer click en Anterior', () => {
    const onChange = vi.fn();
    render(<Pagination {...defaultProps} onChange={onChange} />);
    fireEvent.click(screen.getByText('‹ Anterior'));
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it('llama onChange con página siguiente al hacer click en Siguiente', () => {
    const onChange = vi.fn();
    render(<Pagination {...defaultProps} onChange={onChange} />);
    fireEvent.click(screen.getByText('Siguiente ›'));
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('deshabilita botón Anterior en página 1', () => {
    render(<Pagination {...defaultProps} page={1} />);
    expect(screen.getByText('‹ Anterior')).toBeDisabled();
    expect(screen.getByText('« Inicio')).toBeDisabled();
  });

  it('deshabilita botón Siguiente en última página', () => {
    render(<Pagination {...defaultProps} page={5} />);
    expect(screen.getByText('Siguiente ›')).toBeDisabled();
    expect(screen.getByText('Fin »')).toBeDisabled();
  });

  it('muestra el total de registros', () => {
    render(<Pagination {...defaultProps} />);
    // page=2, pageSize=10 → from=11, to=20 de 50
    expect(screen.getByText('11–20 de 50')).toBeInTheDocument();
  });

  it('no renderiza nada si totalPages <= 1 y total <= pageSize', () => {
    const { container } = render(
      <Pagination page={1} totalPages={1} total={5} pageSize={10} onChange={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('llama onChange con página 1 al hacer click en Inicio', () => {
    const onChange = vi.fn();
    render(<Pagination {...defaultProps} page={3} onChange={onChange} />);
    fireEvent.click(screen.getByText('« Inicio'));
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it('llama onChange con totalPages al hacer click en Fin', () => {
    const onChange = vi.fn();
    render(<Pagination {...defaultProps} page={2} onChange={onChange} />);
    fireEvent.click(screen.getByText('Fin »'));
    expect(onChange).toHaveBeenCalledWith(5);
  });

  it('muestra indicador de carga cuando loading=true', () => {
    render(<Pagination {...defaultProps} loading={true} />);
    expect(screen.getByText('Cargando…')).toBeInTheDocument();
  });

  it('muestra Sin resultados cuando total es 0', () => {
    render(
      <Pagination page={1} totalPages={2} total={0} pageSize={10} onChange={vi.fn()} />
    );
    expect(screen.getByText('Sin resultados')).toBeInTheDocument();
  });

  it('deshabilita todos los botones cuando loading=true', () => {
    render(<Pagination {...defaultProps} loading={true} />);
    expect(screen.getByText('« Inicio')).toBeDisabled();
    expect(screen.getByText('‹ Anterior')).toBeDisabled();
    expect(screen.getByText('Siguiente ›')).toBeDisabled();
    expect(screen.getByText('Fin »')).toBeDisabled();
  });
});
