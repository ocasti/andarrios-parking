import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AppProviders from '../AppProviders';

describe('AppProviders', () => {
  it('renders children correctly', () => {
    render(<AppProviders><span>contenido</span></AppProviders>);
    expect(screen.getByText('contenido')).toBeInTheDocument();
  });
});
