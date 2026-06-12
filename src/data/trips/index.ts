import type { TripConfig } from '../../types/trip';
import { brasil } from './brasil';
import { bogota } from './bogota';

// Registry de viajes: agregar uno nuevo = crear su archivo y sumarlo aquí.
export const trips: TripConfig[] = [brasil, bogota];
