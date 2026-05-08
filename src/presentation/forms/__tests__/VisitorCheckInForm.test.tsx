import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VisitorCheckInForm from '../VisitorCheckInForm';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ replace: vi.fn(), push: vi.fn() })),
  usePathname: vi.fn(() => '/'),
}));

describe('VisitorCheckInForm', () => {
  const mockOnSubmit = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renders all form fields', () => {
    render(<VisitorCheckInForm onSubmit={mockOnSubmit} />);
    // AptoSelector uses ids apto-torre / apto-sel; form fields use vis-* ids
    expect(screen.getByLabelText('Tower')).toBeInTheDocument();
    expect(screen.getByLabelText('Apartment')).toBeInTheDocument();
    expect(screen.getByLabelText('Type')).toBeInTheDocument();
    expect(screen.getByLabelText('License plate')).toBeInTheDocument();
    expect(screen.getByLabelText('Visitor name (optional)')).toBeInTheDocument();
    expect(screen.getByLabelText('Phone (optional)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Register entry' })).toBeInTheDocument();
  });

  it('calls onSubmit with the correct data on submit', async () => {
    render(<VisitorCheckInForm onSubmit={mockOnSubmit} />);

    // Select tower 3 (id=apto-torre in AptoSelector)
    fireEvent.change(screen.getByLabelText('Tower'), { target: { value: '3' } });
    // Select apartment T03-201 (id=apto-sel in AptoSelector)
    fireEvent.change(screen.getByLabelText('Apartment'), { target: { value: 'T03-201' } });
    // Enter plate (id=vis-placa)
    fireEvent.change(screen.getByLabelText('License plate'), { target: { value: 'abc123' } });
    // Enter name (id=vis-nombre)
    fireEvent.change(screen.getByLabelText('Visitor name (optional)'), { target: { value: 'Juan' } });
    // Enter phone (id=vis-tel)
    fireEvent.change(screen.getByLabelText('Phone (optional)'), { target: { value: '3001234567' } });

    fireEvent.submit(screen.getByRole('button', { name: 'Register entry' }).closest('form')!);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        aptCode: 'T03-201',
        plate: 'ABC123',
        vehicleType: 'car',
        name: 'Juan',
        phone: '3001234567',
      });
    });
  });

  it('shows error when error prop is passed', () => {
    render(<VisitorCheckInForm onSubmit={mockOnSubmit} error="Parking lot full" />);
    expect(screen.getByText('Parking lot full')).toBeInTheDocument();
  });

  it('disables the button when disabled=true', () => {
    render(<VisitorCheckInForm onSubmit={mockOnSubmit} disabled />);
    expect(screen.getByRole('button', { name: 'No available spots' })).toBeDisabled();
  });

  it('normalizes the license plate to uppercase', () => {
    render(<VisitorCheckInForm onSubmit={mockOnSubmit} />);
    const plateInput = screen.getByLabelText('License plate');
    fireEvent.change(plateInput, { target: { value: 'abc-123' } });
    // The onChange handler calls toUpperCase() so controlled value becomes ABC-123
    expect((plateInput as HTMLInputElement).value).toBe('ABC-123');
  });

  it('does not call onSubmit if plate is empty', async () => {
    render(<VisitorCheckInForm onSubmit={mockOnSubmit} />);

    // Select a valid apartment
    fireEvent.change(screen.getByLabelText('Tower'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Apartment'), { target: { value: 'T01-101' } });
    // Leave plate empty

    fireEvent.click(screen.getByRole('button', { name: 'Register entry' }));

    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
    expect(screen.getByText('Enter the vehicle license plate.')).toBeInTheDocument();
  });

  it('does not call onSubmit if no apartment is selected', async () => {
    render(<VisitorCheckInForm onSubmit={mockOnSubmit} />);

    // Only fill plate, skip apartment selection
    fireEvent.change(screen.getByLabelText('License plate'), { target: { value: 'XYZ456' } });

    fireEvent.click(screen.getByRole('button', { name: 'Register entry' }));

    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
    expect(screen.getByText('Select tower and apartment.')).toBeInTheDocument();
  });
});
