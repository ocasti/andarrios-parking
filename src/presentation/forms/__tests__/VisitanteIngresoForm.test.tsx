import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VisitanteIngresoForm from '../VisitanteIngresoForm';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ replace: vi.fn(), push: vi.fn() })),
  usePathname: vi.fn(() => '/'),
}));

describe('VisitanteIngresoForm', () => {
  const mockOnSubmit = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renderiza todos los campos del formulario', () => {
    render(<VisitanteIngresoForm onSubmit={mockOnSubmit} />);
    // AptoSelector uses ids apto-torre / apto-sel; form fields use vis-* ids
    expect(screen.getByLabelText('Torre')).toBeInTheDocument();
    expect(screen.getByLabelText('Apartamento')).toBeInTheDocument();
    expect(screen.getByLabelText('Tipo')).toBeInTheDocument();
    expect(screen.getByLabelText('Placa')).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre visitante (opcional)')).toBeInTheDocument();
    expect(screen.getByLabelText('Teléfono (opcional)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Registrar ingreso' })).toBeInTheDocument();
  });

  it('llama onSubmit con los datos correctos al enviar', async () => {
    render(<VisitanteIngresoForm onSubmit={mockOnSubmit} />);

    // Select torre 3 (id=apto-torre in AptoSelector)
    fireEvent.change(screen.getByLabelText('Torre'), { target: { value: '3' } });
    // Select apartment T03-201 (id=apto-sel in AptoSelector)
    fireEvent.change(screen.getByLabelText('Apartamento'), { target: { value: 'T03-201' } });
    // Enter placa (id=vis-placa)
    fireEvent.change(screen.getByLabelText('Placa'), { target: { value: 'abc123' } });
    // Enter nombre (id=vis-nombre)
    fireEvent.change(screen.getByLabelText('Nombre visitante (opcional)'), { target: { value: 'Juan' } });
    // Enter tel (id=vis-tel)
    fireEvent.change(screen.getByLabelText('Teléfono (opcional)'), { target: { value: '3001234567' } });

    fireEvent.submit(screen.getByRole('button', { name: 'Registrar ingreso' }).closest('form')!);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        cod: 'T03-201',
        placa: 'ABC123',
        tipo: 'carro',
        nombre: 'Juan',
        tel: '3001234567',
      });
    });
  });

  it('muestra error cuando se pasa prop error', () => {
    render(<VisitanteIngresoForm onSubmit={mockOnSubmit} error="Parqueadero lleno" />);
    expect(screen.getByText('Parqueadero lleno')).toBeInTheDocument();
  });

  it('deshabilita el botón cuando disabled=true', () => {
    render(<VisitanteIngresoForm onSubmit={mockOnSubmit} disabled />);
    expect(screen.getByRole('button', { name: 'Sin cupos disponibles' })).toBeDisabled();
  });

  it('normaliza la placa a mayúsculas', () => {
    render(<VisitanteIngresoForm onSubmit={mockOnSubmit} />);
    const placaInput = screen.getByLabelText('Placa');
    fireEvent.change(placaInput, { target: { value: 'abc-123' } });
    // The onChange handler calls toUpperCase() so controlled value becomes ABC-123
    expect((placaInput as HTMLInputElement).value).toBe('ABC-123');
  });

  it('no llama onSubmit si placa está vacía', async () => {
    render(<VisitanteIngresoForm onSubmit={mockOnSubmit} />);

    // Select a valid apartment
    fireEvent.change(screen.getByLabelText('Torre'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Apartamento'), { target: { value: 'T01-101' } });
    // Leave placa empty

    fireEvent.click(screen.getByRole('button', { name: 'Registrar ingreso' }));

    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
    expect(screen.getByText('Ingresa la placa del vehículo.')).toBeInTheDocument();
  });

  it('no llama onSubmit si no hay apartamento seleccionado', async () => {
    render(<VisitanteIngresoForm onSubmit={mockOnSubmit} />);

    // Only fill placa, skip apartment selection
    fireEvent.change(screen.getByLabelText('Placa'), { target: { value: 'XYZ456' } });

    fireEvent.click(screen.getByRole('button', { name: 'Registrar ingreso' }));

    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
    expect(screen.getByText('Selecciona torre y apartamento.')).toBeInTheDocument();
  });
});
