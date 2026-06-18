import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ItineraryItem, Ticket, TripConfig } from '../../types/trip';
import type { CityConfig } from '../../types/city';

const stores: Record<string, unknown[]> = { itinerary_items: [], tickets: [] };
vi.mock('../../lib/realtime', () => ({
  useTable: (table: string) => ({ rows: stores[table] ?? [], loading: false, apply: () => {} }),
}));

const daysUntil = vi.fn();
const isToday = vi.fn();
vi.mock('../../lib/dates', () => ({
  daysUntil: (d: string) => daysUntil(d),
  isToday: (d: string) => isToday(d),
  formatDayEs: (d: string) => `fecha(${d})`,
}));

vi.mock('./WeatherSection', () => ({ default: () => <div data-testid="weather" /> }));

import InicioModule from './InicioModule';

const cities = [
  { id: 'rio', name: 'Río', flag: '🇧🇷' },
  { id: 'foz', name: 'Foz', flag: '🇧🇷' },
] as unknown as CityConfig[];
const trip = {
  id: 'brasil-2026', name: 'Brasil', flag: '🇧🇷',
  startDate: '2026-06-25', endDate: '2026-07-03',
  theme: { primary: '#009C3B' },
  days: [
    { date: '2026-06-25', cityId: 'rio', note: 'Llegada' },
    { date: '2026-06-29', cityId: 'foz' },
  ],
  cities,
} as unknown as TripConfig;

describe('InicioModule', () => {
  beforeEach(() => {
    stores.itinerary_items = []; stores.tickets = [];
    daysUntil.mockReset(); isToday.mockReset();
    isToday.mockReturnValue(false);
  });

  it('pre-viaje (días > 0) → countdown + ruta + clima', () => {
    daysUntil.mockImplementation((d: string) => (d === trip.startDate ? 7 : 15));
    render(<InicioModule trip={trip} />);
    expect(screen.getByText('Faltan')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('Nuestra ruta')).toBeInTheDocument();
    expect(screen.getByText('Río')).toBeInTheDocument();
    expect(screen.getByTestId('weather')).toBeInTheDocument();
  });

  it('hoy es día del viaje → "Hoy" con plan mezclado (item + ticket)', () => {
    daysUntil.mockImplementation((d: string) => (d === trip.startDate ? 0 : 4));
    isToday.mockImplementation((d: string) => d === '2026-06-25');
    stores.itinerary_items = [{
      id: 'i1', trip_id: 'brasil-2026', date: '2026-06-25', time: '12:00', title: 'Almuerzo',
      place_id: null, note: null, created_by: 'andres', created_at: '',
    } as ItineraryItem];
    stores.tickets = [{
      id: 't1', trip_id: 'brasil-2026', title: 'Cristo', date: '2026-06-25', time: '09:00',
      file_path: null, note: null, created_by: 'andres', created_at: '',
    } as Ticket];
    render(<InicioModule trip={trip} />);
    expect(screen.getByText(/Hoy ·/)).toBeInTheDocument();
    expect(screen.getByText('Almuerzo')).toBeInTheDocument();
    expect(screen.getByText('Cristo')).toBeInTheDocument();
    expect(screen.getByText('Llegada')).toBeInTheDocument(); // nota del día
  });

  it('viaje terminado → mensaje de cierre, sin countdown ni clima', () => {
    daysUntil.mockReturnValue(-5); // start y end ya pasaron
    render(<InicioModule trip={trip} />);
    expect(screen.getByText(/Qué viaje tan lindo/)).toBeInTheDocument();
    expect(screen.queryByText('Faltan')).toBeNull();
    expect(screen.queryByTestId('weather')).toBeNull();
  });
});
