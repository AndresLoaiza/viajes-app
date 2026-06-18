import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import type { TripConfig, TripPlaceSelection } from '../../types/trip';
import type { CityConfig, PlaceSelection } from '../../types/city';

const apply = vi.fn();
let tableRows: TripPlaceSelection[] = [];
vi.mock('../../lib/realtime', () => ({
  useTable: () => ({ rows: tableRows, loading: false, apply }),
}));

let mutateResult: { data: unknown; error: unknown } = { data: { id: 'new-1' }, error: null };
const mutate = vi.fn((..._a: unknown[]) => Promise.resolve(mutateResult));
vi.mock('../../lib/mutate', () => ({
  mutate: (op: unknown) => mutate(op),
  uuid: () => 'uuid-1',
}));

// Componentes pesados → stubs que exponen la lógica
vi.mock('../../components/CategoryGrid', () => ({
  default: ({ config, onPick }: { config: CityConfig; onPick: (id: string) => void }) => (
    <div>
      {config.categories.map((c) => (
        <button key={c.id} onClick={() => onPick(c.id)}>cat-{c.id}</button>
      ))}
    </div>
  ),
}));
vi.mock('../../components/PlaceCard', () => ({
  default: ({ place, selection, onChange }: {
    place: { id: string; name: string }; selection: PlaceSelection; onChange: (s: PlaceSelection) => void;
  }) => (
    <div>
      <span>{place.name}</span>
      <span data-testid={`sel-${place.id}`}>{selection.selected ? 'on' : 'off'}</span>
      <button onClick={() => onChange({ ...selection, selected: !selection.selected })}>toggle-{place.id}</button>
      <button onClick={() => onChange({ ...selection, notes: 'nota nueva' })}>note-{place.id}</button>
    </div>
  ),
}));

import LugaresModule from './LugaresModule';

const city = {
  id: 'rio', name: 'Río', flag: '🇧🇷',
  categories: [{ id: 'playas', name: 'Playas', emoji: '🏖️', color: '#000' }],
  places: [{ id: 'p1', name: 'Copacabana', category: 'playas', description: '', images: [] }],
  dates: [],
} as unknown as CityConfig;
const trip = { id: 'brasil-2026', cities: [city] } as unknown as TripConfig;

const sel = (over: Partial<TripPlaceSelection> = {}): TripPlaceSelection => ({
  id: 's1', trip_id: 'brasil-2026', city_id: 'rio', place_id: 'p1',
  selected_by: 'andres', note: null, created_at: '2026-06-01T00:00:00Z', ...over,
});

function openCategory() {
  render(<LugaresModule trip={trip} identity="andres" />);
  fireEvent.click(screen.getByRole('button', { name: 'cat-playas' }));
}

describe('LugaresModule', () => {
  beforeEach(() => {
    apply.mockClear(); mutate.mockClear();
    tableRows = [];
    mutateResult = { data: { id: 'new-1' }, error: null };
  });
  afterEach(() => vi.useRealTimers());

  it('elegir categoría muestra los lugares', () => {
    openCategory();
    expect(screen.getByText('Copacabana')).toBeInTheDocument();
  });

  it('marcar lugar → insert place_selections + overlay optimista', async () => {
    openCategory();
    expect(screen.getByTestId('sel-p1')).toHaveTextContent('off');
    fireEvent.click(screen.getByRole('button', { name: 'toggle-p1' }));

    await waitFor(() => expect(mutate).toHaveBeenCalled());
    const op = mutate.mock.calls[0][0] as { table: string; type: string; row: { place_id: string; selected_by: string } };
    expect(op.table).toBe('place_selections');
    expect(op.type).toBe('insert');
    expect(op.row.place_id).toBe('p1');
    expect(op.row.selected_by).toBe('andres');
    expect(apply).toHaveBeenCalledWith(expect.objectContaining({ eventType: 'INSERT' }));
  });

  it('desmarcar lugar ya seleccionado → delete', async () => {
    tableRows = [sel()];
    openCategory();
    expect(screen.getByTestId('sel-p1')).toHaveTextContent('on');
    fireEvent.click(screen.getByRole('button', { name: 'toggle-p1' }));

    await waitFor(() => expect(mutate).toHaveBeenCalled());
    expect((mutate.mock.calls[0][0] as { type: string }).type).toBe('delete');
    expect(apply).toHaveBeenCalledWith(expect.objectContaining({ eventType: 'DELETE' }));
  });

  it('selección del otro viajero → badge con su nombre', () => {
    tableRows = [sel({ id: 's2', selected_by: 'melisa' })];
    openCategory();
    expect(screen.getByText('Melisa')).toBeInTheDocument(); // badge "le gusta a Melisa"
  });

  it('cambiar nota → update debounced (800ms)', async () => {
    vi.useFakeTimers();
    tableRows = [sel()];
    render(<LugaresModule trip={trip} identity="andres" />);
    fireEvent.click(screen.getByRole('button', { name: 'cat-playas' }));
    fireEvent.click(screen.getByRole('button', { name: 'note-p1' }));

    expect(mutate).not.toHaveBeenCalled(); // aún no (debounce)
    await vi.advanceTimersByTimeAsync(900);
    expect(mutate).toHaveBeenCalled();
    const op = mutate.mock.calls[0][0] as { type: string; patch: { note: string } };
    expect(op.type).toBe('update');
    expect(op.patch.note).toBe('nota nueva');
  });

  it('error al marcar → alerta', async () => {
    mutateResult = { data: null, error: { message: 'x' } };
    openCategory();
    fireEvent.click(screen.getByRole('button', { name: 'toggle-p1' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/No se pudo guardar/);
  });
});
