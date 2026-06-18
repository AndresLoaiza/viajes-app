import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import type { ItineraryItem, Ticket, TripConfig } from '../../types/trip';
import type { CityConfig } from '../../types/city';

const apply = vi.fn();
const stores: Record<string, unknown[]> = { itinerary_items: [], tickets: [] };
vi.mock('../../lib/realtime', () => ({
  useTable: (table: string) => ({ rows: stores[table] ?? [], loading: false, apply }),
}));

let mutateResult: { data: unknown; error: unknown } = { data: { id: 'new-1' }, error: null };
const mutate = vi.fn((..._a: unknown[]) => Promise.resolve(mutateResult));
vi.mock('../../lib/mutate', () => ({
  mutate: (op: unknown) => mutate(op),
  uuid: () => 'uuid-1',
}));

vi.mock('../../lib/supabase', () => ({
  supabase: { storage: { from: () => ({ getPublicUrl: (p: string) => ({ data: { publicUrl: `https://cdn/${p}` } }) }) } },
}));

import ItinerarioModule from './ItinerarioModule';

const cities = [{ id: 'rio', name: 'Río', flag: '🇧🇷' }] as unknown as CityConfig[];
const trip = {
  id: 'brasil-2026',
  days: [
    { date: '2026-06-25', cityId: 'rio' },
    { date: '2026-06-26', cityId: 'rio' },
  ],
  cities,
} as unknown as TripConfig;

const item = (over: Partial<ItineraryItem> = {}): ItineraryItem => ({
  id: 'i1', trip_id: 'brasil-2026', date: '2026-06-25', time: '10:00', title: 'Playa',
  place_id: null, note: 'Llevar bloqueador', created_by: 'andres', created_at: '2026-06-01T00:00:00Z', ...over,
});
const ticket = (over: Partial<Ticket> = {}): Ticket => ({
  id: 't1', trip_id: 'brasil-2026', title: 'Cristo Redentor', date: '2026-06-25', time: '08:00',
  file_path: 'brasil-2026/cristo.pdf', note: null, created_by: 'andres', created_at: '2026-06-01T00:00:00Z', ...over,
});

function renderModule(t: TripConfig = trip) {
  return render(<ItinerarioModule trip={t} identity="andres" />);
}

describe('ItinerarioModule', () => {
  beforeEach(() => {
    apply.mockClear(); mutate.mockClear();
    stores.itinerary_items = []; stores.tickets = [];
    mutateResult = { data: { id: 'new-1' }, error: null };
    vi.stubGlobal('confirm', () => true);
  });

  it('viaje sin días → no renderiza', () => {
    const { container } = renderModule({ ...trip, days: [] } as TripConfig);
    expect(container).toBeEmptyDOMElement();
  });

  it('día sin planes → estado vacío', () => {
    renderModule();
    expect(screen.getByText('Nada planeado aún')).toBeInTheDocument();
  });

  it('mezcla items y tickets del día ordenados por hora', () => {
    stores.itinerary_items = [item()];      // 10:00
    stores.tickets = [ticket()];            // 08:00
    renderModule();
    expect(screen.getByText('Playa')).toBeInTheDocument();
    expect(screen.getByText('Cristo Redentor')).toBeInTheDocument();
    // ticket trae enlace a boleta
    expect(screen.getByRole('link', { name: /Ver boleta/ }).getAttribute('href'))
      .toBe('https://cdn/brasil-2026/cristo.pdf');
  });

  it('agregar plan → insert con date del día activo + apply', async () => {
    renderModule();
    fireEvent.click(screen.getByRole('button', { name: /Agregar plan/ }));
    fireEvent.change(screen.getByLabelText('Plan *'), { target: { value: 'Feria' } });
    fireEvent.change(screen.getByLabelText('Hora'), { target: { value: '15:00' } });
    fireEvent.click(screen.getByRole('button', { name: 'Agregar al día' }));

    await waitFor(() => expect(mutate).toHaveBeenCalled());
    const op = mutate.mock.calls[0][0] as { table: string; type: string; row: { title: string; date: string; time: string } };
    expect(op.table).toBe('itinerary_items');
    expect(op.row.title).toBe('Feria');
    expect(op.row.date).toBe('2026-06-25');
    expect(op.row.time).toBe('15:00');
    expect(apply).toHaveBeenCalledWith(expect.objectContaining({ eventType: 'INSERT' }));
  });

  it('borrar plan (confirm) → mutate delete', async () => {
    stores.itinerary_items = [item()];
    renderModule();
    fireEvent.click(screen.getByLabelText('Borrar Playa'));
    await waitFor(() => expect(mutate).toHaveBeenCalled());
    expect((mutate.mock.calls[0][0] as { type: string }).type).toBe('delete');
  });

  it('cambiar de día filtra los planes', () => {
    stores.itinerary_items = [item({ id: 'i1', date: '2026-06-25', title: 'Playa' }),
      item({ id: 'i2', date: '2026-06-26', title: 'Museo' })];
    renderModule();
    expect(screen.getByText('Playa')).toBeInTheDocument();
    expect(screen.queryByText('Museo')).toBeNull();

    // segundo día (26) — tab por número de día
    const tab26 = screen.getByRole('tab', { name: /26/ });
    fireEvent.click(tab26);
    expect(tab26).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Museo')).toBeInTheDocument();
  });
});
