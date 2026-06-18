import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import type { Rates } from '../../lib/currency';
import type { Expense, TripConfig } from '../../types/trip';

// --- mocks de dependencias ---
const apply = vi.fn();
let tableRows: Expense[] = [];
let tableLoading = false;
vi.mock('../../lib/realtime', () => ({
  useTable: () => ({ rows: tableRows, loading: tableLoading, apply }),
}));

let mutateResult: { data: unknown; error: unknown } = { data: { id: 'new-1' }, error: null };
const mutate = vi.fn((..._a: unknown[]) => Promise.resolve(mutateResult));
vi.mock('../../lib/mutate', () => ({
  mutate: (op: unknown) => mutate(op),
  uuid: () => 'uuid-1',
}));

const RATES: Rates = {
  base: 'COP', rates: { COP: 1, BRL: 0.5, ARS: 2, USD: 0.25 }, updated: 'x', fetchedAt: 1,
};
vi.mock('../../lib/currency', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../lib/currency')>();
  return { ...actual, fetchRates: () => Promise.resolve(RATES) };
});

import GastosSection from './GastosSection';

const trip = { id: 'brasil-2026' } as TripConfig;
const expense = (over: Partial<Expense> = {}): Expense => ({
  id: 'e1', trip_id: 'brasil-2026', description: 'Almuerzo', amount: 100, currency: 'BRL',
  paid_by: 'andres', category: 'comida', spent_on: '2026-06-18', created_by: 'andres',
  created_at: '2026-06-18T12:00:00Z', ...over,
});

function renderSection() {
  return render(<GastosSection trip={trip} identity="andres" />);
}

describe('GastosSection', () => {
  beforeEach(() => {
    apply.mockClear(); mutate.mockClear();
    tableRows = []; tableLoading = false;
    mutateResult = { data: { id: 'new-1' }, error: null };
    vi.stubGlobal('confirm', () => true);
  });

  it('sin gastos → hint vacío', () => {
    renderSection();
    fireEvent.click(screen.getByRole('button', { name: /^Gastos/ })); // abrir accordion
    expect(screen.getByText(/Sin gastos aún/)).toBeInTheDocument();
  });

  it('lista gasto con conversión a COP y total', async () => {
    tableRows = [expense()];
    renderSection();
    fireEvent.click(screen.getByRole('button', { name: /^Gastos/ }));
    // 100 BRL / 0.5 = 200 COP
    expect(await screen.findByText('Total del viaje')).toBeInTheDocument();
    expect(screen.getByText('Almuerzo')).toBeInTheDocument();
    expect(screen.getAllByText(/\$200/).length).toBeGreaterThan(0);
    expect(screen.getByText(/R\$100,00/)).toBeInTheDocument(); // monto original
  });

  it('guardar nuevo gasto → mutate insert + apply', async () => {
    renderSection();
    fireEvent.click(screen.getByLabelText('Agregar a Gastos'));

    fireEvent.change(screen.getByLabelText('Descripción *'), { target: { value: 'Taxi' } });
    fireEvent.change(screen.getByLabelText('Monto *'), { target: { value: '50' } });
    fireEvent.click(screen.getByRole('button', { name: 'Agregar' }));

    await waitFor(() => expect(mutate).toHaveBeenCalled());
    const op = mutate.mock.calls[0][0] as { type: string; row: { description: string; amount: number; id: string } };
    expect(op.type).toBe('insert');
    expect(op.row.description).toBe('Taxi');
    expect(op.row.amount).toBe(50);
    expect(op.row.id).toBe('uuid-1');
    expect(apply).toHaveBeenCalledWith(expect.objectContaining({ eventType: 'INSERT' }));
  });

  it('monto inválido → botón Agregar deshabilitado', () => {
    renderSection();
    fireEvent.click(screen.getByLabelText('Agregar a Gastos'));
    fireEvent.change(screen.getByLabelText('Descripción *'), { target: { value: 'Taxi' } });
    // sin monto
    expect(screen.getByRole('button', { name: 'Agregar' })).toBeDisabled();
  });

  it('input de monto descarta no-numéricos', () => {
    renderSection();
    fireEvent.click(screen.getByLabelText('Agregar a Gastos'));
    const amount = screen.getByLabelText('Monto *') as HTMLInputElement;
    fireEvent.change(amount, { target: { value: '5a0,5' } });
    expect(amount.value).toBe('50,5');
  });

  it('error de mutate → muestra alerta', async () => {
    mutateResult = { data: null, error: { message: 'boom' } };
    renderSection();
    fireEvent.click(screen.getByLabelText('Agregar a Gastos'));
    fireEvent.change(screen.getByLabelText('Descripción *'), { target: { value: 'Taxi' } });
    fireEvent.change(screen.getByLabelText('Monto *'), { target: { value: '50' } });
    fireEvent.click(screen.getByRole('button', { name: 'Agregar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/No se pudo guardar/);
    expect(apply).not.toHaveBeenCalled();
  });

  it('borrar gasto (confirm true) → mutate delete + apply', async () => {
    tableRows = [expense()];
    renderSection();
    fireEvent.click(screen.getByRole('button', { name: /^Gastos/ }));
    fireEvent.click(screen.getByLabelText('Borrar Almuerzo'));

    await waitFor(() => expect(mutate).toHaveBeenCalled());
    expect((mutate.mock.calls[0][0] as { type: string }).type).toBe('delete');
    expect(apply).toHaveBeenCalledWith(expect.objectContaining({ eventType: 'DELETE' }));
  });

  it('borrar cancelado (confirm false) → no muta', () => {
    vi.stubGlobal('confirm', () => false);
    tableRows = [expense()];
    renderSection();
    fireEvent.click(screen.getByRole('button', { name: /^Gastos/ }));
    fireEvent.click(screen.getByLabelText('Borrar Almuerzo'));
    expect(mutate).not.toHaveBeenCalled();
  });
});
