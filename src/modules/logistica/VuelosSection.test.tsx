import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import type { Flight, TripConfig } from '../../types/trip';

const apply = vi.fn();
let tableRows: Flight[] = [];
vi.mock('../../lib/realtime', () => ({
  useTable: () => ({ rows: tableRows, loading: false, apply }),
}));

let mutateResult: { data: unknown; error: unknown } = { data: { id: 'new-1' }, error: null };
const mutate = vi.fn((..._a: unknown[]) => Promise.resolve(mutateResult));
vi.mock('../../lib/mutate', () => ({
  mutate: (op: unknown) => mutate(op),
  uuid: () => 'uuid-1',
}));

import VuelosSection from './VuelosSection';

const trip = { id: 'brasil-2026', cities: [] } as unknown as TripConfig;
const flight = (over: Partial<Flight> = {}): Flight => ({
  id: 'f1', trip_id: 'brasil-2026', airline: 'GOL', flight_number: 'G3 1234',
  confirmation: 'ABC123', from_city: 'Bogotá', to_city: 'Río',
  departs_at: '2026-06-25T08:00:00Z', arrives_at: '2026-06-25T14:00:00Z',
  note: 'Equipaje 23kg', created_by: 'andres', created_at: '2026-06-01T00:00:00Z', ...over,
});

function renderSection() {
  return render(<VuelosSection trip={trip} identity="andres" />);
}

describe('VuelosSection', () => {
  beforeEach(() => {
    apply.mockClear(); mutate.mockClear();
    tableRows = [];
    mutateResult = { data: { id: 'new-1' }, error: null };
    vi.stubGlobal('confirm', () => true);
  });

  it('sin vuelos → hint vacío', () => {
    renderSection();
    fireEvent.click(screen.getByRole('button', { name: /^Vuelos/ }));
    expect(screen.getByText(/Sin vuelos aún/)).toBeInTheDocument();
  });

  it('lista vuelo con horas locales (slice del string, sin Date)', () => {
    tableRows = [flight()];
    renderSection();
    fireEvent.click(screen.getByRole('button', { name: /^Vuelos/ }));
    expect(screen.getByText('08:00')).toBeInTheDocument();
    expect(screen.getByText('14:00')).toBeInTheDocument();
    expect(screen.getByText('Bogotá')).toBeInTheDocument();
    expect(screen.getByText('GOL G3 1234')).toBeInTheDocument();
  });

  it('guardar nuevo vuelo → insert con departs_at UTC ficticio', async () => {
    renderSection();
    fireEvent.click(screen.getByLabelText('Agregar a Vuelos'));
    fireEvent.change(screen.getByLabelText('Origen *'), { target: { value: 'Río' } });
    fireEvent.change(screen.getByLabelText('Destino *'), { target: { value: 'Foz' } });
    fireEvent.change(screen.getByLabelText('Fecha *'), { target: { value: '2026-06-29' } });
    fireEvent.change(screen.getByLabelText('Sale *'), { target: { value: '10:30' } });
    fireEvent.change(screen.getByLabelText('Aerolínea *'), { target: { value: 'LATAM' } });
    fireEvent.click(screen.getByRole('button', { name: 'Agregar' }));

    await waitFor(() => expect(mutate).toHaveBeenCalled());
    const op = mutate.mock.calls[0][0] as { type: string; row: { departs_at: string; from_city: string } };
    expect(op.type).toBe('insert');
    expect(op.row.departs_at).toBe('2026-06-29T10:30:00Z');
    expect(op.row.from_city).toBe('Río');
    expect(apply).toHaveBeenCalledWith(expect.objectContaining({ eventType: 'INSERT' }));
  });

  it('faltan campos obligatorios → Agregar deshabilitado', () => {
    renderSection();
    fireEvent.click(screen.getByLabelText('Agregar a Vuelos'));
    fireEvent.change(screen.getByLabelText('Origen *'), { target: { value: 'Río' } });
    expect(screen.getByRole('button', { name: 'Agregar' })).toBeDisabled();
  });

  it('borrar vuelo (confirm) → mutate delete + apply', async () => {
    tableRows = [flight()];
    renderSection();
    fireEvent.click(screen.getByRole('button', { name: /^Vuelos/ }));
    fireEvent.click(screen.getByLabelText(/Borrar vuelo Bogotá a Río/));
    await waitFor(() => expect(mutate).toHaveBeenCalled());
    expect((mutate.mock.calls[0][0] as { type: string }).type).toBe('delete');
    expect(apply).toHaveBeenCalledWith(expect.objectContaining({ eventType: 'DELETE' }));
  });

  it('error de mutate → alerta, sin apply', async () => {
    mutateResult = { data: null, error: { message: 'x' } };
    renderSection();
    fireEvent.click(screen.getByLabelText('Agregar a Vuelos'));
    fireEvent.change(screen.getByLabelText('Origen *'), { target: { value: 'Río' } });
    fireEvent.change(screen.getByLabelText('Destino *'), { target: { value: 'Foz' } });
    fireEvent.change(screen.getByLabelText('Fecha *'), { target: { value: '2026-06-29' } });
    fireEvent.change(screen.getByLabelText('Sale *'), { target: { value: '10:30' } });
    fireEvent.change(screen.getByLabelText('Aerolínea *'), { target: { value: 'LATAM' } });
    fireEvent.click(screen.getByRole('button', { name: 'Agregar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/No se pudo guardar/);
    expect(apply).not.toHaveBeenCalled();
  });
});
