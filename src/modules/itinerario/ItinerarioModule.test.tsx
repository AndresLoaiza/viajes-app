import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import type { ItineraryItem, Ticket, TripConfig } from '../../types/trip';
import type { CityConfig } from '../../types/city';

const apply = vi.fn();
const stores: Record<string, unknown[]> = { itinerary_items: [], tickets: [], place_selections: [] };
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

// useMundial mockeado; los helpers puros (partidosDeFecha, etc.) quedan reales.
let partidosMock: Partido[] = [];
vi.mock('../../lib/mundial', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../lib/mundial')>();
  return { ...actual, useMundial: () => ({ partidos: partidosMock, loading: false }) };
});

import ItinerarioModule from './ItinerarioModule';
import type { Partido } from '../../lib/mundial';

const partido = (over: Partial<Partido> = {}): Partido => ({
  id: 'm1', ext_id: '1', fase: 'grupos', grupo: 'A', fecha_hora: '2026-06-25T18:00:00Z',
  equipo_local: 'Brazil', equipo_visitante: 'Croatia', bandera_local: null, bandera_visitante: null,
  gol_local_real: null, gol_visitante_real: null, estado: 'programado', ...over,
});

const cities = [{
  id: 'rio', name: 'Río', flag: '🇧🇷',
  places: [{ id: 'cristo', name: 'Cristo Redentor', category: 'cultura', description: '', images: [] }],
}] as unknown as CityConfig[];
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
  place_id: null, note: 'Llevar bloqueador', done: false, position: null, created_by: 'andres', created_at: '2026-06-01T00:00:00Z', ...over,
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
    stores.itinerary_items = []; stores.tickets = []; stores.place_selections = [];
    partidosMock = [];
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

  it('muestra los partidos del Mundial del día (read-only)', () => {
    // 18:00Z → 15:00 local (UTC-3) del 25-jun
    partidosMock = [partido({ id: 'm1', equipo_local: 'Brazil', equipo_visitante: 'Croatia' })];
    render(<ItinerarioModule trip={trip} identity="andres" />);
    expect(screen.getByText('Brazil')).toBeInTheDocument();
    expect(screen.getByText('Croatia')).toBeInTheDocument();
    expect(screen.getByText(/Mundial · Grupo A/)).toBeInTheDocument();
  });

  it('partido por definir → "Por definir" (se actualiza cuando se sepa)', () => {
    partidosMock = [partido({ equipo_local: 'Por definir', equipo_visitante: 'Por definir', fase: 'eliminacion', grupo: null })];
    render(<ItinerarioModule trip={trip} identity="andres" />);
    expect(screen.getByText(/Por definir/)).toBeInTheDocument();
    expect(screen.getByText(/Mundial · Eliminación/)).toBeInTheDocument();
  });

  it('lugar con día preferido = hoy aparece en Días (read-only)', () => {
    // día activo por defecto = 2026-06-25 (día 25); id 'thu-25' codifica el 25
    stores.place_selections = [{
      id: 's1', trip_id: 'brasil-2026', city_id: 'rio', place_id: 'cristo',
      selected_by: 'melisa', note: null, preferred_dates: ['thu-25'], created_at: '',
    }];
    renderModule();
    expect(screen.getByText('Cristo Redentor')).toBeInTheDocument();
    expect(screen.getByText(/Quieren ir · Melisa/)).toBeInTheDocument();
  });

  it('muestra a ambos: uno fija el día, el otro también eligió el lugar', () => {
    stores.place_selections = [
      { id: 'a', trip_id: 'brasil-2026', city_id: 'rio', place_id: 'cristo', selected_by: 'andres', note: null, preferred_dates: ['thu-25'], created_at: '' },
      { id: 'b', trip_id: 'brasil-2026', city_id: 'rio', place_id: 'cristo', selected_by: 'melisa', note: null, preferred_dates: [], created_at: '' },
    ];
    renderModule();
    expect(screen.getByText(/Quieren ir · Andrés y Melisa/)).toBeInTheDocument();
  });

  it('marcar lugar como visitado en Días → update visited', async () => {
    stores.place_selections = [{
      id: 's1', trip_id: 'brasil-2026', city_id: 'rio', place_id: 'cristo',
      selected_by: 'andres', note: null, preferred_dates: ['thu-25'], position: null, visited: false, created_at: '',
    }];
    renderModule();
    fireEvent.click(screen.getByRole('button', { name: /Marcar Cristo Redentor como visitado/ }));
    await waitFor(() => expect(mutate).toHaveBeenCalled());
    const op = mutate.mock.calls[0][0] as { table: string; patch: { visited: boolean } };
    expect(op.table).toBe('place_selections');
    expect(op.patch.visited).toBe(true);
  });

  it('quitar lugar del día → update preferred_dates sin ese día', async () => {
    stores.place_selections = [{
      id: 's1', trip_id: 'brasil-2026', city_id: 'rio', place_id: 'cristo',
      selected_by: 'andres', note: null, preferred_dates: ['thu-25', 'fri-26'], position: null, visited: false, created_at: '',
    }];
    renderModule(); // activo = 25
    fireEvent.click(screen.getByRole('button', { name: /Quitar Cristo Redentor del día/ }));
    await waitFor(() => expect(mutate).toHaveBeenCalled());
    const op = mutate.mock.calls[0][0] as { type: string; patch: { preferred_dates: string[] } };
    expect(op.type).toBe('update');
    expect(op.patch.preferred_dates).toEqual(['fri-26']); // quita el 25, deja el 26
  });

  it('lugar con día preferido distinto NO aparece hoy', () => {
    stores.place_selections = [{
      id: 's1', trip_id: 'brasil-2026', city_id: 'rio', place_id: 'cristo',
      selected_by: 'melisa', note: null, preferred_dates: ['fri-26'], created_at: '',
    }];
    renderModule(); // activo = 25
    expect(screen.queryByText('Cristo Redentor')).toBeNull();
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

  it('marcar plan como visitado → update done', async () => {
    stores.itinerary_items = [item()];
    renderModule();
    fireEvent.click(screen.getByRole('button', { name: /Marcar Playa como visitado/ }));
    await waitFor(() => expect(mutate).toHaveBeenCalled());
    const op = mutate.mock.calls[0][0] as { type: string; patch: { done: boolean } };
    expect(op.type).toBe('update');
    expect(op.patch.done).toBe(true);
  });

  it('reordenar (bajar) un plan sin hora → update position numérica', async () => {
    stores.itinerary_items = [item({ id: 'i1', title: 'Uno', time: null }), item({ id: 'i2', title: 'Dos', time: null })];
    renderModule();
    fireEvent.click(screen.getByRole('button', { name: 'Bajar Uno' }));
    await waitFor(() => expect(mutate).toHaveBeenCalled());
    const op = mutate.mock.calls[0][0] as { type: string; patch: { position: number } };
    expect(op.type).toBe('update');
    expect(typeof op.patch.position).toBe('number');
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
