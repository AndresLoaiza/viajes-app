import type { CityConfig } from './city';

export type TravelerId = 'andres' | 'melisa';
export type ModuleId =
  | 'inicio' | 'itinerario' | 'logistica' | 'lugares'
  | 'galeria' | 'mapa' | 'pendientes';

export interface TripDay {
  date: string;        // 'YYYY-MM-DD'
  cityId: string;      // ref a city registry
  note?: string;       // p.ej. 'Tarde → vuelo a Iguazú'
}

export interface TripTheme {
  primary: string;
  accent: string;
  bg: string;
}

export interface TripConfig {
  id: string;
  name: string;
  flag: string;
  tagline: string;
  status: 'past' | 'upcoming';
  startDate: string;
  endDate: string;
  days: TripDay[];     // [] para viajes pasados
  cities: CityConfig[];
  modules: ModuleId[];
  theme: TripTheme;
}

// Filas de Supabase — snake_case intencional (coincide con columnas).
export interface ItineraryItem {
  id: string;
  trip_id: string;
  date: string;
  time: string | null;
  title: string;
  place_id: string | null;
  note: string | null;
  created_by: TravelerId;
  created_at: string;
}

export interface TripPlaceSelection {
  id: string;
  trip_id: string;
  city_id: string;
  place_id: string;
  selected_by: TravelerId;
  note: string | null;
  created_at: string;
}
