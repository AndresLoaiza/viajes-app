import { describe, it, expect } from 'vitest';
import { tripStats, placesSummary, daysAscending } from './recuerdos';
import type { Photo } from '../types/trip';

const ph = (over: Partial<Photo>): Photo => ({
  id: Math.random().toString(36).slice(2),
  trip_id: 'bogota-2026',
  file_path: 'x.jpg',
  taken_on: null,
  city_id: null,
  caption: null,
  lat: null, lon: null, place: null,
  uploaded_by: 'andres',
  created_at: '2026-03-28T10:00:00Z',
  ...over,
});

describe('tripStats', () => {
  it('cuenta fotos, días y lugares distintos', () => {
    const s = tripStats([
      ph({ taken_on: '2026-03-28', place: 'Chapinero' }),
      ph({ taken_on: '2026-03-28', place: 'Chapinero' }),
      ph({ taken_on: '2026-03-29', place: 'La Candelaria' }),
      ph({ taken_on: null, place: null }),
    ]);
    expect(s).toEqual({ photos: 4, days: 2, places: 2 });
  });
});

describe('placesSummary', () => {
  it('agrupa por lugar, desc por conteo', () => {
    const r = placesSummary([
      ph({ place: 'Chapinero' }), ph({ place: 'Chapinero' }), ph({ place: 'La Candelaria' }), ph({ place: null }),
    ]);
    expect(r).toEqual([{ place: 'Chapinero', count: 2 }, { place: 'La Candelaria', count: 1 }]);
  });
});

describe('daysAscending', () => {
  it('orden cronológico ascendente, sin fecha al final, lugares por día', () => {
    const r = daysAscending([
      ph({ taken_on: '2026-03-29', place: 'Centro' }),
      ph({ taken_on: '2026-03-28', place: 'Usaquén' }),
      ph({ taken_on: '2026-03-28', place: 'Chapinero' }),
      ph({ taken_on: null }),
    ]);
    expect(r.map((d) => d.date)).toEqual(['2026-03-28', '2026-03-29', null]);
    expect(r[0].places.sort()).toEqual(['Chapinero', 'Usaquén']);
  });
});
