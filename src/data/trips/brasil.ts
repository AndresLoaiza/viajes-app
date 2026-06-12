import type { TripConfig } from '../../types/trip';
import rio from '../cities/rio';
import foz from '../cities/foz';
import sp from '../cities/sp';

export const brasil: TripConfig = {
  id: 'brasil-2026',
  name: 'Brasil',
  flag: '🇧🇷',
  tagline: 'Rio · Iguazú · São Paulo',
  status: 'upcoming',
  startDate: '2026-06-25',
  endDate: '2026-07-03',
  days: [
    { date: '2026-06-25', cityId: 'rio' },
    { date: '2026-06-26', cityId: 'rio' },
    { date: '2026-06-27', cityId: 'rio' },
    { date: '2026-06-28', cityId: 'rio', note: 'Tarde → vuelo a Iguazú' },
    { date: '2026-06-29', cityId: 'foz' },
    { date: '2026-06-30', cityId: 'foz', note: 'Noche → vuelo a São Paulo' },
    { date: '2026-07-01', cityId: 'sp' },
    { date: '2026-07-02', cityId: 'sp' },
    { date: '2026-07-03', cityId: 'sp', note: 'Noche → vuelo a Medellín' },
  ],
  cities: [rio, foz, sp],
  modules: ['inicio', 'itinerario', 'logistica', 'lugares', 'galeria', 'mapa', 'pendientes'],
  theme: { primary: '#009C3B', accent: '#FFDF00', bg: '#FFFDF5' },
};
