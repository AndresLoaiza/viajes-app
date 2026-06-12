import type { TripConfig } from '../../types/trip';

export const bogota: TripConfig = {
  id: 'bogota-2026',
  name: 'Bogotá',
  flag: '🇨🇴',
  tagline: 'Nuestro primer viaje',
  status: 'past',
  startDate: '2026-01-01', // fechas reales pendientes de Andrés; solo decorativo
  endDate: '2026-01-01',
  days: [],
  cities: [],
  modules: ['galeria'],
  theme: { primary: '#FCD116', accent: '#003893', bg: '#FFFDF5' },
};
