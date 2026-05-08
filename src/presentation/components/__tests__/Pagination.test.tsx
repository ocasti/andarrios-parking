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

  it('shows the current page number', () => {
    render(<Pagination {...defaultProps} />);
    expect(screen.getByText('2 / 5')).toBeInTheDocument();
  });

  it('calls onChange with previous page on click of Previous', () => {
    const onChange = vi.fn();
    render(<Pagination {...defaultProps} onChange={onChange} />);
    fireEvent.click(screen.getByText('‹ Previous'));
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it('calls onChange with next page on click of Next', () => {
    const onChange = vi.fn();
    render(<Pagination {...defaultProps} onChange={onChange} />);
    fireEvent.click(screen.getByText('Next ›'));
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('disables Previous button on page 1', () => {
    render(<Pagination {...defaultProps} page={1} />);
    expect(screen.getByText('‹ Previous')).toBeDisabled();
    expect(screen.getByText('« First')).toBeDisabled();
  });

  it('disables Next button on last page', () => {
    render(<Pagination {...defaultProps} page={5} />);
    expect(screen.getByText('Next ›')).toBeDisabled();
    expect(screen.getByText('Last »')).toBeDisabled();
  });

  it('shows the total record count', () => {
    render(<Pagination {...defaultProps} />);
    // page=2, pageSize=10 → from=11, to=20 of 50
    expect(screen.getByText('11–20 of 50')).toBeInTheDocument();
  });

  it('does not render anything if totalPages <= 1 and total <= pageSize', () => {
    const { container } = render(
      <Pagination page={1} totalPages={1} total={5} pageSize={10} onChange={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('calls onChange with page 1 on click of First', () => {
    const onChange = vi.fn();
    render(<Pagination {...defaultProps} page={3} onChange={onChange} />);
    fireEvent.click(screen.getByText('« First'));
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it('calls onChange with totalPages on click of Last', () => {
    const onChange = vi.fn();
    render(<Pagination {...defaultProps} page={2} onChange={onChange} />);
    fireEvent.click(screen.getByText('Last »'));
    expect(onChange).toHaveBeenCalledWith(5);
  });

  it('shows loading indicator when loading=true', () => {
    render(<Pagination {...defaultProps} loading={true} />);
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('shows No results when total is 0', () => {
    render(
      <Pagination page={1} totalPages={2} total={0} pageSize={10} onChange={vi.fn()} />
    );
    expect(screen.getByText('No results')).toBeInTheDocument();
  });

  it('disables all buttons when loading=true', () => {
    render(<Pagination {...defaultProps} loading={true} />);
    expect(screen.getByText('« First')).toBeDisabled();
    expect(screen.getByText('‹ Previous')).toBeDisabled();
    expect(screen.getByText('Next ›')).toBeDisabled();
    expect(screen.getByText('Last »')).toBeDisabled();
  });
});
