import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AptoSelector from '../ui/AptoSelector';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ replace: vi.fn(), push: vi.fn() })),
  usePathname: vi.fn(() => '/'),
}));

describe('AptoSelector', () => {
  it('renderiza select de torre y apartamento', () => {
    render(<AptoSelector torre="" apto="" onChange={vi.fn()} />);
    expect(screen.getByLabelText('Torre')).toBeInTheDocument();
    expect(screen.getByLabelText('Apartamento')).toBeInTheDocument();
  });

  it('no muestra opciones de apartamento cuando no hay torre seleccionada', () => {
    render(<AptoSelector torre="" apto="" onChange={vi.fn()} />);
    const aptoSelect = screen.getByLabelText('Apartamento');
    // Only the placeholder option should be present
    expect(aptoSelect).toBeDisabled();
    const options = Array.from(aptoSelect.querySelectorAll('option'));
    expect(options).toHaveLength(1);
    expect(options[0].value).toBe('');
  });

  it('llama onChange con torre y string vacío al cambiar torre', () => {
    const onChange = vi.fn();
    render(<AptoSelector torre="" apto="" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Torre'), { target: { value: '3' } });
    expect(onChange).toHaveBeenCalledWith('3', '');
  });

  it('genera las opciones correctas de apartamento para una torre', () => {
    render(<AptoSelector torre="8" apto="" onChange={vi.fn()} />);
    const aptoSelect = screen.getByLabelText('Apartamento');
    const options = Array.from(aptoSelect.querySelectorAll('option'));
    // 6 pisos × 4 aptos = 24 options + 1 placeholder = 25
    expect(options).toHaveLength(25);
    // First real option: piso 1, apto 1 → T08-101
    expect(options[1].value).toBe('T08-101');
    // Last option: piso 6, apto 4 → T08-604
    expect(options[24].value).toBe('T08-604');
  });

  it('muestra el código de apto en el input readonly', () => {
    render(<AptoSelector torre="1" apto="T01-201" onChange={vi.fn()} />);
    const input = screen.getByDisplayValue('T01-201');
    expect(input).toHaveAttribute('readOnly');
  });
});
