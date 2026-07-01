import type { TripConfig } from '../../types/trip';
import { daysUntil } from '../../lib/dates';
import { brasil } from './brasil';
import { bogota } from './bogota';

// Registry de viajes: agregar uno nuevo = crear su archivo y sumarlo aquí.
export const trips: TripConfig[] = [brasil, bogota];

/** Viaje en curso hoy (ya empezó y no ha terminado), o null. */
export function activeTrip(now: Date = new Date()): TripConfig | null {
  return (
    trips.find(
      (t) =>
        t.status === 'upcoming' &&
        daysUntil(t.startDate, now) <= 0 &&
        daysUntil(t.endDate, now) >= 0,
    ) ?? null
  );
}
