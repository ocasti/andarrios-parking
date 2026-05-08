import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AptoSelector from '../ui/AptoSelector';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ replace: vi.fn(), push: vi.fn() })),
  usePathname: vi.fn(() => '/'),
}));

describe('AptoSelector', () => {
  it('renders tower and apartment selects', () => {
    render(<AptoSelector tower="" apt="" onChange={vi.fn()} />);
    expect(screen.getByLabelText('Tower')).toBeInTheDocument();
    expect(screen.getByLabelText('Apartment')).toBeInTheDocument();
  });

  it('does not show apartment options when no tower is selected', () => {
    render(<AptoSelector tower="" apt="" onChange={vi.fn()} />);
    const aptoSelect = screen.getByLabelText('Apartment');
    // Only the placeholder option should be present
    expect(aptoSelect).toBeDisabled();
    const options = Array.from(aptoSelect.querySelectorAll('option'));
    expect(options).toHaveLength(1);
    expect(options[0].value).toBe('');
  });

  it('calls onChange with tower and empty string when tower changes', () => {
    const onChange = vi.fn();
    render(<AptoSelector tower="" apt="" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Tower'), { target: { value: '3' } });
    expect(onChange).toHaveBeenCalledWith('3', '');
  });

  it('generates the correct apartment options for a tower', () => {
    render(<AptoSelector tower="8" apt="" onChange={vi.fn()} />);
    const aptoSelect = screen.getByLabelText('Apartment');
    const options = Array.from(aptoSelect.querySelectorAll('option'));
    // 6 floors × 4 units = 24 options + 1 placeholder = 25
    expect(options).toHaveLength(25);
    // First real option: floor 1, unit 1 → T08-101
    expect(options[1].value).toBe('T08-101');
    // Last option: floor 6, unit 4 → T08-604
    expect(options[24].value).toBe('T08-604');
  });

  it('shows the apartment code in the readonly input', () => {
    render(<AptoSelector tower="1" apt="T01-201" onChange={vi.fn()} />);
    const input = screen.getByDisplayValue('T01-201');
    expect(input).toHaveAttribute('readOnly');
  });
});
