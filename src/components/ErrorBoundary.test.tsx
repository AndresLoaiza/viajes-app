import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

function Boom({ explode }: { explode: boolean }) {
  if (explode) throw new Error('boom');
  return <p>Todo bien</p>;
}

describe('ErrorBoundary', () => {
  it('muestra fallback cuando el hijo lanza', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<ErrorBoundary><Boom explode /></ErrorBoundary>);
    expect(screen.getByText('Algo salió mal aquí')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reintentar/ })).toBeInTheDocument();
    vi.restoreAllMocks();
  });

  it('renderiza el hijo normal sin error', () => {
    render(<ErrorBoundary><Boom explode={false} /></ErrorBoundary>);
    expect(screen.getByText('Todo bien')).toBeInTheDocument();
  });

  it('Reintentar limpia el error', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { rerender } = render(<ErrorBoundary><Boom explode /></ErrorBoundary>);
    // el hijo deja de fallar y luego se reintenta → limpia el error y renderiza
    rerender(<ErrorBoundary><Boom explode={false} /></ErrorBoundary>);
    fireEvent.click(screen.getByRole('button', { name: /Reintentar/ }));
    expect(screen.getByText('Todo bien')).toBeInTheDocument();
    vi.restoreAllMocks();
  });
});
