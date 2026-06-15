// Lógica pura para el recap "Recuerdos": stats y agrupaciones (sin React).
import type { Photo } from '../types/trip';

export interface PhotoDay { date: string | null; photos: Photo[]; places: string[] }

/** Días en orden cronológico ascendente (la historia del viaje); sin fecha al final. */
export function daysAscending(photos: Photo[]): PhotoDay[] {
  const byDate = new Map<string, Photo[]>();
  for (const p of photos) {
    const key = p.taken_on ?? '';
    byDate.set(key, [...(byDate.get(key) ?? []), p]);
  }
  return [...byDate.entries()]
    .sort(([a], [b]) => {
      if (a === '') return 1;
      if (b === '') return -1;
      return a.localeCompare(b);
    })
    .map(([date, group]) => {
      const photos = [...group].sort((x, y) => x.created_at.localeCompare(y.created_at));
      const places = [...new Set(photos.map((p) => p.place).filter(Boolean) as string[])];
      return { date: date || null, photos, places };
    });
}

/** Lugares distintos (de los GPS de las fotos) con cuántas fotos cada uno, desc. */
export function placesSummary(photos: Photo[]): { place: string; count: number }[] {
  const m = new Map<string, number>();
  for (const p of photos) {
    if (!p.place) continue;
    m.set(p.place, (m.get(p.place) ?? 0) + 1);
  }
  return [...m.entries()].map(([place, count]) => ({ place, count })).sort((a, b) => b.count - a.count);
}

export interface TripStats { photos: number; days: number; places: number }

export function tripStats(photos: Photo[]): TripStats {
  const days = new Set(photos.map((p) => p.taken_on).filter(Boolean));
  const places = new Set(photos.map((p) => p.place).filter(Boolean));
  return { photos: photos.length, days: days.size, places: places.size };
}
