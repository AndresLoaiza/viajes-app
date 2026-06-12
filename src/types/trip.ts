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

export interface Flight {
  id: string;
  trip_id: string;
  airline: string;
  flight_number: string | null;
  confirmation: string | null;
  from_city: string;
  to_city: string;
  // Hora LOCAL del aeropuerto guardada como UTC ficticio ('...T17:10:00Z').
  // Mostrar con tsDate/tsTime (slice del string) — nunca convertir con Date.
  departs_at: string;
  arrives_at: string | null;
  note: string | null;
  created_by: TravelerId;
  created_at: string;
}

export interface Hotel {
  id: string;
  trip_id: string;
  name: string;
  city_id: string;
  address: string | null;
  check_in: string;   // 'YYYY-MM-DD'
  check_out: string;  // 'YYYY-MM-DD'
  confirmation: string | null;
  note: string | null;
  created_by: TravelerId;
  created_at: string;
}

export interface Ticket {
  id: string;
  trip_id: string;
  title: string;
  date: string | null;      // 'YYYY-MM-DD'
  time: string | null;      // 'HH:MM'
  file_path: string | null; // ruta en bucket docs
  note: string | null;
  created_by: TravelerId;
  created_at: string;
}

export interface Photo {
  id: string;
  trip_id: string;
  file_path: string;        // ruta en bucket photos
  taken_on: string | null;  // 'YYYY-MM-DD' (aprox: lastModified del archivo)
  city_id: string | null;
  caption: string | null;
  uploaded_by: TravelerId;
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
