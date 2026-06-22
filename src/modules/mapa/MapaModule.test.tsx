import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { Photo, Hotel, ItineraryItem, TripPlaceSelection, TripConfig } from '../../types/trip';
import type { CityConfig } from '../../types/city';

// Leaflet → stubs encadenables (no probamos el render del mapa, sí la lógica React)
vi.mock('leaflet', () => {
  const chain = () => {
    const o: Record<string, unknown> = {};
    ['addTo', 'bindPopup', 'setView', 'fitBounds', 'invalidateSize', 'clearLayers',
      'remove', 'pad', 'on'].forEach((m) => { o[m] = () => o; });
    return o;
  };
  const L = {
    map: () => chain(),
    tileLayer: () => chain(),
    markerClusterGroup: () => chain(),
    marker: () => chain(),
    divIcon: () => ({}),
    latLngBounds: () => chain(),
  };
  return { default: L };
});
vi.mock('leaflet.markercluster', () => ({}));
vi.mock('leaflet/dist/leaflet.css', () => ({}));
vi.mock('leaflet.markercluster/dist/MarkerCluster.css', () => ({}));
vi.mock('leaflet.markercluster/dist/MarkerCluster.Default.css', () => ({}));

vi.mock('../../data/cities/coords', () => ({
  placeCoords: { p1: [-22.9, -43.2] },
}));

vi.mock('../../lib/supabase', () => ({
  supabase: { storage: { from: () => ({ getPublicUrl: (p: string) => ({ data: { publicUrl: `https://cdn/${p}` } }) }) } },
}));

const stores: Record<string, unknown[]> = {
  photos: [], hotels: [], itinerary_items: [], place_selections: [],
};
vi.mock('../../lib/realtime', () => ({
  useTable: (table: string) => ({ rows: stores[table] ?? [], loading: false, apply: () => {} }),
}));

import MapaModule from './MapaModule';

const city = {
  id: 'rio', name: 'Río', flag: '🇧🇷', center: [-22.9, -43.2], zoom: 11,
  places: [{ id: 'p1', name: 'Copacabana', category: 'playas', mapsUrl: 'https://maps/p1' }],
} as unknown as CityConfig;
const trip = { id: 'brasil-2026', cities: [city] } as unknown as TripConfig;

const photo = (o: Partial<Photo> = {}): Photo => ({
  id: 'ph1', trip_id: 'brasil-2026', file_path: 'x.jpg', taken_on: '2026-06-25', city_id: 'rio',
  caption: null, lat: -22.9, lon: -43.2, place: 'Copacabana', uploaded_by: 'andres',
  created_at: '', ...o,
});
const hotel = (o: Partial<Hotel> = {}): Hotel => ({
  id: 'h1', trip_id: 'brasil-2026', name: 'Hotel', city_id: 'rio', address: null,
  check_in: '2026-06-25', check_out: '2026-06-28', confirmation: null, note: null,
  lat: -22.9, lon: -43.2, created_by: 'andres', created_at: '', ...o,
});
const selection = (o: Partial<TripPlaceSelection> = {}): TripPlaceSelection => ({
  id: 's1', trip_id: 'brasil-2026', city_id: 'rio', place_id: 'p1', selected_by: 'andres',
  note: null, preferred_dates: [], position: null, visited: false, created_at: '', ...o,
});
const itinItem = (o: Partial<ItineraryItem> = {}): ItineraryItem => ({
  id: 'i1', trip_id: 'brasil-2026', date: '2026-06-25', time: '10:00', title: 'Tour',
  place_id: 'p1', note: null, done: false, position: null, created_by: 'andres', created_at: '', ...o,
});

function chip(label: string) {
  return screen.getByRole('button', { name: new RegExp(label) });
}

describe('MapaModule', () => {
  beforeEach(() => {
    stores.photos = []; stores.hotels = []; stores.itinerary_items = []; stores.place_selections = [];
  });

  it('lugares: muestra todos los del catálogo con coords aunque no estén marcados', () => {
    // sin selecciones, el lugar del catálogo (p1) igual aparece
    render(<MapaModule trip={trip} identity="andres" />);
    expect(chip('Lugares')).toHaveTextContent('(1)');
  });

  it('sin pines (capas apagadas) → overlay "Nada que mostrar"', () => {
    render(<MapaModule trip={trip} identity="andres" />);
    // apagar las 4 capas (lugares siempre tiene el catálogo)
    ['Fotos', 'Hoteles', 'Lugares', 'Itinerario'].forEach((l) => fireEvent.click(chip(l)));
    expect(screen.getByText(/Nada que mostrar acá todavía/)).toBeInTheDocument();
  });

  it('cuenta pines por capa en los chips', () => {
    stores.photos = [photo()];
    stores.hotels = [hotel()];
    stores.place_selections = [selection()];
    stores.itinerary_items = [itinItem()];
    render(<MapaModule trip={trip} identity="andres" />);
    expect(chip('Fotos')).toHaveTextContent('(1)');
    expect(chip('Hoteles')).toHaveTextContent('(1)');
    expect(chip('Lugares')).toHaveTextContent('(1)');
    expect(chip('Itinerario')).toHaveTextContent('(1)');
  });

  it('apagar una capa → su conteo baja a 0 y aria-pressed false', () => {
    stores.photos = [photo()];
    render(<MapaModule trip={trip} identity="andres" />);
    expect(chip('Fotos')).toHaveTextContent('(1)');

    fireEvent.click(chip('Fotos'));
    expect(chip('Fotos')).toHaveTextContent('(0)');
    expect(chip('Fotos')).toHaveAttribute('aria-pressed', 'false');
  });

  it('foto sin GPS no genera pin', () => {
    stores.photos = [photo({ lat: null, lon: null })];
    render(<MapaModule trip={trip} identity="andres" />);
    expect(chip('Fotos')).toHaveTextContent('(0)');
  });

  it('tab de ciudad presente', () => {
    render(<MapaModule trip={trip} identity="andres" />);
    expect(screen.getByRole('tab', { name: 'Río' })).toBeInTheDocument();
  });
});
