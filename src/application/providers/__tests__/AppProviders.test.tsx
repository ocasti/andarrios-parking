import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AppProviders from '../AppProviders';

describe('AppProviders', () => {
  it('renderiza sus children correctamente', () => {
    render(<AppProviders><span>contenido</span></AppProviders>);
    expect(screen.getByText('contenido')).toBeInTheDocument();
  });
});
