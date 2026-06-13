import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { supabase } from '../../lib/supabase';
import { useTable } from '../../lib/realtime';
import { placeCoords } from '../../data/cities/coords';
import { formatDayEs } from '../../lib/dates';
import type {
  TripConfig, TravelerId, Photo, Hotel, ItineraryItem, TripPlaceSelection,
} from '../../types/trip';
import type { Place } from '../../types/city';

type LayerKey = 'fotos' | 'hoteles' | 'lugares' | 'itinerario';

const LAYERS: { key: LayerKey; emoji: string; label: string; color: string }[] = [
  { key: 'fotos', emoji: '📷', label: 'Fotos', color: '#E11D48' },
  { key: 'hoteles', emoji: '🏨', label: 'Hoteles', color: '#2563EB' },
  { key: 'lugares', emoji: '📍', label: 'Lugares', color: '#059669' },
  { key: 'itinerario', emoji: '🗓️', label: 'Itinerario', color: '#D97706' },
];
const COLOR = Object.fromEntries(LAYERS.map((l) => [l.key, l.color])) as Record<LayerKey, string>;
const EMOJI = Object.fromEntries(LAYERS.map((l) => [l.key, l.emoji])) as Record<LayerKey, string>;

const photoUrl = (path: string) =>
  supabase.storage.from('photos').getPublicUrl(path).data.publicUrl;
const travelerName = (t: TravelerId) => (t === 'andres' ? 'Andrés' : 'Melisa');
const esc = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));

function pinIcon(kind: LayerKey) {
  return L.divIcon({
    className: '',
    html: `<div style="width:26px;height:26px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${COLOR[kind]};box-shadow:0 1px 4px rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;border:2px solid #fff"><span style="transform:rotate(45deg);font-size:13px;line-height:1">${EMOJI[kind]}</span></div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 26],
    popupAnchor: [0, -24],
  });
}

interface Pin { lat: number; lng: number; kind: LayerKey; html: string }

/** Mapa por ciudad (Leaflet + OSM). Capas filtrables: fotos, hoteles, lugares marcados, itinerario. */
export default function MapaModule({ trip }: { trip: TripConfig; identity: TravelerId }) {
  const hasCities = trip.cities.length > 0;
  const [cityId, setCityId] = useState(trip.cities[0]?.id ?? '');
  const [on, setOn] = useState<Record<LayerKey, boolean>>({
    fotos: true, hoteles: true, lugares: true, itinerario: true,
  });

  const photos = useTable<Photo>('photos', trip.id).rows;
  const hotels = useTable<Hotel>('hotels', trip.id).rows;
  const items = useTable<ItineraryItem>('itinerary_items', trip.id).rows;
  const selections = useTable<TripPlaceSelection>('place_selections', trip.id).rows;

  const city = trip.cities.find((c) => c.id === cityId);
  const placesById = useMemo(
    () => new Map<string, Place>(trip.cities.flatMap((c) => c.places).map((p) => [p.id, p])),
    [trip],
  );

  const pins = useMemo<Pin[]>(() => {
    const out: Pin[] = [];

    if (on.fotos) {
      photos
        .filter((p) => p.lat != null && p.lon != null && (!hasCities || p.city_id === cityId))
        .forEach((p) => {
          const cap = [p.place, p.caption].filter(Boolean).map((s) => esc(s as string)).join(' · ');
          const date = p.taken_on ? esc(formatDayEs(p.taken_on)) : '';
          out.push({
            lat: p.lat!, lng: p.lon!, kind: 'fotos',
            html: `<img src="${photoUrl(p.file_path)}" alt="" style="width:160px;height:120px;object-fit:cover;border-radius:8px;display:block"/>`
              + `<div style="margin-top:4px;font-size:12px;max-width:160px">${cap}${cap && date ? '<br>' : ''}<span style="color:#888">${date}</span></div>`,
          });
        });
    }

    if (on.hoteles) {
      hotels
        .filter((h) => h.lat != null && h.lon != null && h.city_id === cityId)
        .forEach((h) => {
          const addr = h.address ? `<div style="font-size:12px;color:#555">${esc(h.address)}</div>` : '';
          const maps = `<a href="https://www.google.com/maps/search/?api=1&query=${h.lat},${h.lon}" target="_blank" rel="noopener" style="font-size:12px;color:#2563EB">Ver en Maps ↗</a>`;
          out.push({
            lat: h.lat!, lng: h.lon!, kind: 'hoteles',
            html: `<strong style="font-size:13px">🏨 ${esc(h.name)}</strong>${addr}${maps}`,
          });
        });
    }

    if (on.lugares) {
      const byPlace = new Map<string, Set<TravelerId>>();
      selections
        .filter((s) => s.city_id === cityId && placeCoords[s.place_id])
        .forEach((s) => {
          const set = byPlace.get(s.place_id) ?? new Set<TravelerId>();
          set.add(s.selected_by);
          byPlace.set(s.place_id, set);
        });
      byPlace.forEach((who, placeId) => {
        const [lat, lng] = placeCoords[placeId];
        const place = placesById.get(placeId);
        const name = place ? esc(place.name) : placeId;
        const hearts = [...who].map(travelerName).join(' y ');
        const maps = place?.mapsUrl
          ? `<a href="${esc(place.mapsUrl)}" target="_blank" rel="noopener" style="font-size:12px;color:#059669">Ver en Maps ↗</a>`
          : '';
        out.push({
          lat, lng, kind: 'lugares',
          html: `<strong style="font-size:13px">📍 ${name}</strong><div style="font-size:12px;color:#555">❤️ ${hearts}</div>${maps}`,
        });
      });
    }

    if (on.itinerario) {
      items
        .filter((i) => i.place_id && placeCoords[i.place_id] && city?.places.some((p) => p.id === i.place_id))
        .forEach((i) => {
          const [lat, lng] = placeCoords[i.place_id!];
          const when = [i.date && formatDayEs(i.date), i.time].filter(Boolean).join(' · ');
          out.push({
            lat, lng, kind: 'itinerario',
            html: `<strong style="font-size:13px">🗓️ ${esc(i.title)}</strong>${when ? `<div style="font-size:12px;color:#555">${esc(when)}</div>` : ''}`,
          });
        });
    }

    return out;
  }, [on, photos, hotels, selections, items, cityId, hasCities, city, placesById]);

  // ── Leaflet: init una vez ───────────────────────────────────────────────
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const groupRef = useRef<L.MarkerClusterGroup | null>(null);

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;
    const map = L.map(containerRef.current, { zoomControl: true, attributionControl: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap',
    }).addTo(map);
    groupRef.current = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      chunkedLoading: true,
    }).addTo(map);
    mapRef.current = map;
    map.setView(city?.center ?? [4.6, -74.08], city?.zoom ?? 11);
    return () => { map.remove(); mapRef.current = null; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Redibuja marcadores + encuadra cuando cambian pines/ciudad ──────────
  useEffect(() => {
    const map = mapRef.current, group = groupRef.current;
    if (!map || !group) return;
    map.invalidateSize();
    group.clearLayers();
    pins.forEach((p) => {
      L.marker([p.lat, p.lng], { icon: pinIcon(p.kind) })
        .bindPopup(p.html, { closeButton: true })
        .addTo(group);
    });
    if (pins.length) {
      map.fitBounds(L.latLngBounds(pins.map((p) => [p.lat, p.lng])).pad(0.25), { maxZoom: 15 });
    } else if (city?.center) {
      map.setView(city.center, city.zoom ?? 12);
    }
  }, [pins, city]);

  const counts = useMemo(() => {
    const c: Record<LayerKey, number> = { fotos: 0, hoteles: 0, lugares: 0, itinerario: 0 };
    pins.forEach((p) => { c[p.kind]++; });
    return c;
  }, [pins]);

  return (
    <div className="flex flex-col h-[calc(100svh-9rem)] px-4 pt-3 max-w-xl mx-auto">
      {hasCities && (
        <div className="flex gap-2 mb-2" role="tablist" aria-label="Ciudades">
          {trip.cities.map((c) => {
            const sel = c.id === cityId;
            return (
              <button
                key={c.id} role="tab" aria-selected={sel}
                onClick={() => setCityId(c.id)}
                className={`flex-1 min-h-10 rounded-2xl px-2 font-display font-bold text-sm cursor-pointer transition-colors duration-200 border-2
                  ${sel ? 'bg-brasil-blue border-brasil-blue text-white' : 'bg-white border-sand-dark text-gray-600'}`}
              >
                {({ rio: 'Río', foz: 'Foz', sp: 'São Paulo' } as Record<string, string>)[c.id] ?? c.name}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex gap-1.5 mb-2 overflow-x-auto pb-0.5">
        {LAYERS.map((l) => {
          const active = on[l.key];
          return (
            <button
              key={l.key}
              onClick={() => setOn((s) => ({ ...s, [l.key]: !s[l.key] }))}
              aria-pressed={active}
              className={`shrink-0 inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold border-2 cursor-pointer transition-all duration-200
                ${active ? 'text-white' : 'bg-white text-gray-400 border-sand-dark'}`}
              style={active ? { backgroundColor: l.color, borderColor: l.color } : undefined}
            >
              <span aria-hidden>{l.emoji}</span> {l.label}
              <span className={active ? 'opacity-80' : 'opacity-60'}>({counts[l.key]})</span>
            </button>
          );
        })}
      </div>

      <div className="relative flex-1 min-h-0 rounded-2xl overflow-hidden border-2 border-sand-dark">
        <div ref={containerRef} className="absolute inset-0" />
        {pins.length === 0 && (
          <div className="absolute inset-0 z-[500] pointer-events-none flex items-center justify-center">
            <p className="bg-white/90 rounded-xl px-4 py-2 text-sm text-gray-500 font-semibold shadow">
              Nada que mostrar acá todavía
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
