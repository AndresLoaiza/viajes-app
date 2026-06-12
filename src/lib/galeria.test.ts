import { describe, expect, it } from 'vitest';
import { dateFromMs, groupByDate } from './galeria';
import type { Photo } from '../types/trip';

const ph = (over: Partial<Photo>): Photo => ({
  id: Math.random().toString(36).slice(2),
  trip_id: 'brasil-2026',
  file_path: 'x.jpg',
  taken_on: null,
  city_id: null,
  caption: null,
  uploaded_by: 'andres',
  created_at: '2026-06-25T10:00:00+00:00',
  ...over,
});

describe('dateFromMs', () => {
  it('convierte epoch ms a fecha local YYYY-MM-DD', () => {
    // mediodía local: misma fecha en cualquier huso razonable
    const ms = new Date(2026, 5, 25, 12, 0, 0).getTime();
    expect(dateFromMs(ms)).toBe('2026-06-25');
  });
});

describe('groupByDate', () => {
  it('agrupa por día, recientes primero, sin-fecha al final', () => {
    const photos = [
      ph({ id: 'a', taken_on: '2026-06-25' }),
      ph({ id: 'b', taken_on: null }),
      ph({ id: 'c', taken_on: '2026-06-27' }),
      ph({ id: 'd', taken_on: '2026-06-25' }),
    ];
    const groups = groupByDate(photos);
    expect(groups.map((g) => g.date)).toEqual(['2026-06-27', '2026-06-25', null]);
    expect(groups[1].photos.map((p) => p.id)).toEqual(['a', 'd']);
  });

  it('dentro del día ordena por created_at ascendente', () => {
    const photos = [
      ph({ id: 'tarde', taken_on: '2026-06-25', created_at: '2026-06-25T18:00:00+00:00' }),
      ph({ id: 'manana', taken_on: '2026-06-25', created_at: '2026-06-25T08:00:00+00:00' }),
    ];
    expect(groupByDate(photos)[0].photos.map((p) => p.id)).toEqual(['manana', 'tarde']);
  });

  it('lista vacía → sin grupos', () => {
    expect(groupByDate([])).toEqual([]);
  });
});
