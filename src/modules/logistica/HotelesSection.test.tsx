import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import type { Hotel, TripConfig } from '../../types/trip';
import type { CityConfig } from '../../types/city';

const apply = vi.fn();
let tableRows: Hotel[] = [];
vi.mock('../../lib/realtime', () => ({
  useTable: () => ({ rows: tableRows, loading: false, apply }),
}));

let mutateResult: { data: unknown; error: unknown } = { data: { id: 'new-1' }, error: null };
const mutate = vi.fn((..._a: unknown[]) => Promise.resolve(mutateResult));
vi.mock('../../lib/mutate', () => ({
  mutate: (op: unknown) => mutate(op),
  uuid: () => 'uuid-1',
}));

import HotelesSection from './HotelesSection';

const cities = [
  { id: 'rio', name: 'Río', flag: '🇧🇷' },
  { id: 'foz', name: 'Foz', flag: '🇧🇷' },
] as unknown as CityConfig[];
const trip = { id: 'brasil-2026', cities } as unknown as TripConfig;
const hotel = (over: Partial<Hotel> = {}): Hotel => ({
  id: 'h1', trip_id: 'brasil-2026', name: 'Hotel Copacabana', city_id: 'rio',
  address: 'Av. Atlântica 100', check_in: '2026-06-25', check_out: '2026-06-28',
  confirmation: 'PIN999', note: 'Pagado', lat: null, lon: null,
  created_by: 'andres', created_at: '2026-06-01T00:00:00Z', ...over,
});

function renderSection() {
  return render(<HotelesSection trip={trip} identity="andres" />);
}

describe('HotelesSection', () => {
  beforeEach(() => {
    apply.mockClear(); mutate.mockClear();
    tableRows = [];
    mutateResult = { data: { id: 'new-1' }, error: null };
    vi.stubGlobal('confirm', () => true);
  });

  it('sin hoteles → hint vacío', () => {
    renderSection();
    fireEvent.click(screen.getByRole('button', { name: /^Hoteles/ }));
    expect(screen.getByText(/Sin hoteles aún/)).toBeInTheDocument();
  });

  it('lista hotel con ciudad y link de dirección', () => {
    tableRows = [hotel()];
    renderSection();
    fireEvent.click(screen.getByRole('button', { name: /^Hoteles/ }));
    expect(screen.getByText('Hotel Copacabana')).toBeInTheDocument();
    expect(screen.getByText('🇧🇷 Río')).toBeInTheDocument();
    const link = screen.getByText('Av. Atlântica 100').closest('a');
    expect(link?.getAttribute('href')).toMatch(/google\.com\/maps/);
  });

  it('badge "Sin pagar" derivado de la nota', () => {
    tableRows = [hotel({ note: 'Sin pagar todavía' })];
    renderSection();
    fireEvent.click(screen.getByRole('button', { name: /^Hoteles/ }));
    expect(screen.getByText('Sin pagar')).toBeInTheDocument();
  });

  it('guardar nuevo hotel → insert con city_id por defecto', async () => {
    renderSection();
    fireEvent.click(screen.getByLabelText('Agregar a Hoteles'));
    fireEvent.change(screen.getByLabelText('Nombre *'), { target: { value: 'Pousada Foz' } });
    fireEvent.change(screen.getByLabelText('Check-in *'), { target: { value: '2026-06-29' } });
    fireEvent.change(screen.getByLabelText('Check-out *'), { target: { value: '2026-06-30' } });
    fireEvent.click(screen.getByRole('button', { name: 'Agregar' }));

    await waitFor(() => expect(mutate).toHaveBeenCalled());
    const op = mutate.mock.calls[0][0] as { type: string; row: { name: string; city_id: string } };
    expect(op.type).toBe('insert');
    expect(op.row.name).toBe('Pousada Foz');
    expect(op.row.city_id).toBe('rio'); // primera ciudad por defecto
  });

  it('borrar hotel (confirm) → mutate delete', async () => {
    tableRows = [hotel()];
    renderSection();
    fireEvent.click(screen.getByRole('button', { name: /^Hoteles/ }));
    fireEvent.click(screen.getByLabelText('Borrar Hotel Copacabana'));
    await waitFor(() => expect(mutate).toHaveBeenCalled());
    expect((mutate.mock.calls[0][0] as { type: string }).type).toBe('delete');
  });
});
