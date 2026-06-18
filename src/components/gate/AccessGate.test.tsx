import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

let codeOk = false;
const stored: string[] = [];

vi.mock('../../lib/identity', () => ({
  checkAccessCode: (code: string) => Promise.resolve(codeOk && code.trim().length > 0),
  storeIdentity: (id: string) => { stored.push(id); },
}));

import AccessGate from './AccessGate';

describe('AccessGate', () => {
  beforeEach(() => { codeOk = false; stored.length = 0; });

  it('botón Entrar deshabilitado con código vacío', () => {
    render(<AccessGate onUnlocked={() => {}} />);
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeDisabled();
  });

  it('código incorrecto → muestra error y no avanza de paso', async () => {
    codeOk = false;
    render(<AccessGate onUnlocked={() => {}} />);
    fireEvent.change(screen.getByLabelText('Código secreto'), { target: { value: 'nope' } });
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.queryByText('¿Quién eres?')).toBeNull();
  });

  it('escribir limpia el error previo', async () => {
    codeOk = false;
    render(<AccessGate onUnlocked={() => {}} />);
    const input = screen.getByLabelText('Código secreto');
    fireEvent.change(input, { target: { value: 'nope' } });
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'no' } });
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('código correcto → paso "quién eres"; elegir → storeIdentity + onUnlocked', async () => {
    codeOk = true;
    const onUnlocked = vi.fn();
    render(<AccessGate onUnlocked={onUnlocked} />);
    fireEvent.change(screen.getByLabelText('Código secreto'), { target: { value: 'brasil2026' } });
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    await screen.findByText('¿Quién eres?');
    fireEvent.click(screen.getByRole('button', { name: /Melisa/ }));

    expect(stored).toEqual(['melisa']);
    expect(onUnlocked).toHaveBeenCalledWith('melisa');
  });

  it('Enter en el input también envía', async () => {
    codeOk = true;
    render(<AccessGate onUnlocked={() => {}} />);
    const input = screen.getByLabelText('Código secreto');
    fireEvent.change(input, { target: { value: 'brasil2026' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => expect(screen.getByText('¿Quién eres?')).toBeInTheDocument());
  });
});
