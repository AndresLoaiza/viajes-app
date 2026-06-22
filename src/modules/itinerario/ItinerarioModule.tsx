import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, BedDouble, Check, ChevronDown, ChevronUp, FileText, MoveRight, Plane, Plus, Ticket as TicketIcon, Trash2, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useTable } from '../../lib/realtime';
import { mutate, uuid } from '../../lib/mutate';
import { formatDayEs, isToday } from '../../lib/dates';
import { tsDate, tsTime } from '../../lib/logistica';
import { fetchWeather, wmo, type Weather } from '../../lib/weather';
import {
  useMundial, partidosDeFecha, horaLocalPartido, etiquetaFase, porDefinir, marcador,
  type Partido,
} from '../../lib/mundial';
import type { TripConfig, ItineraryItem, Ticket, Flight, Hotel, TravelerId, TripPlaceSelection } from '../../types/trip';

const docUrl = (path: string) =>
  supabase.storage.from('docs').getPublicUrl(path).data.publicUrl;

const WEEKDAY_SHORT = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];

function chipLabel(date: string): { dia: string; num: string } {
  const [y, m, d] = date.split('-').map(Number);
  return { dia: WEEKDAY_SHORT[new Date(y, m - 1, d).getDay()], num: String(d) };
}

/** Itinerario día-por-día: tabs de días, items con hora, agregar/borrar, realtime. */
export default function ItinerarioModule({ trip, identity }: {
  trip: TripConfig;
  identity: TravelerId;
}) {
  const [activeDate, setActiveDate] = useState(
    () => trip.days.find((d) => isToday(d.date))?.date ?? trip.days[0]?.date,
  );
  const { rows, loading, apply } = useTable<ItineraryItem>('itinerary_items', trip.id);
  const { rows: ticketRows } = useTable<Ticket>('tickets', trip.id);
  const { rows: flightRows } = useTable<Flight>('flights', trip.id);
  const { rows: hotelRows } = useTable<Hotel>('hotels', trip.id);
  const { rows: placeSels } = useTable<TripPlaceSelection>('place_selections', trip.id);
  const { partidos } = useMundial();
  const [showForm, setShowForm] = useState(false);
  const [fTime, setFTime] = useState('');
  const [fTitle, setFTitle] = useState('');
  const [fNote, setFNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  const day = trip.days.find((d) => d.date === activeDate);
  const ciudad = day ? trip.cities.find((c) => c.id === day.cityId) : null;
  const items = rows.filter((i) => i.date === activeDate);
  // 'HH:MM' → minutos. Sin hora → al final del día (pero ordenables a mano).
  const toMin = (t: string | null | undefined) =>
    t ? Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5)) : 9000;
  // Orden de un plan: posición manual si existe; si no, por hora.
  const itemSortNum = (i: ItineraryItem) => (i.position ?? toMin(i.time));

  // Experiencias (tickets) del día — se gestionan en "Plan"; aquí van read-only,
  // mezcladas con los planes manuales y ordenadas por hora.
  const dayTickets = ticketRows.filter((t) => t.date === activeDate);
  // Partidos del Mundial del día (read-only, desde la Polla). Se actualizan
  // solos cuando se sabe quién juega (la Polla sincroniza la tabla).
  const dayMatches = partidosDeFecha(partidos, activeDate);
  // Vuelos del día (por fecha de salida) y hoteles (check-in/check-out del día).
  const dayFlights = flightRows.filter((f) => tsDate(f.departs_at) === activeDate);
  const dayHotels = hotelRows.filter((h) => h.check_in === activeDate || h.check_out === activeDate);
  // Lugares marcados con un día preferido = hoy (read-only, desde Lugares). El id
  // de TravelDate ('sat-27') codifica el día del mes; se cruza con el nº del día
  // activo y la ciudad. Se actualiza solo cuando marcan el día en Lugares.
  const activeDayNum = activeDate ? Number(activeDate.slice(8)) : NaN;
  type PlaceSelDay = {
    place_id: string; name: string; who: TravelerId[];
    ids: string[]; visited: boolean; position: number | null;
  };
  const dayPlaceSel = (() => {
    if (!day) return [] as PlaceSelDay[];
    // Lugares cuyo día preferido (de cualquiera) cae hoy.
    const placesHoy = new Set<string>();
    placeSels.forEach((s) => {
      if (s.city_id === day.cityId && s.preferred_dates?.some((id) => Number(id.split('-').pop()) === activeDayNum)) {
        placesHoy.add(s.place_id);
      }
    });
    const placeName = (pid: string) =>
      trip.cities.find((c) => c.id === day.cityId)?.places.find((p) => p.id === pid)?.name ?? pid;
    return [...placesHoy].map((place_id): PlaceSelDay => {
      const rows = placeSels.filter((s) => s.city_id === day.cityId && s.place_id === place_id);
      const positions = rows.map((r) => r.position).filter((p): p is number => p != null);
      return {
        place_id,
        name: placeName(place_id),
        who: [...new Set(rows.map((r) => r.selected_by))],   // todos los que lo eligieron
        ids: rows.map((r) => r.id),
        visited: rows.some((r) => r.visited),
        position: positions.length ? Math.min(...positions) : null,
      };
    });
  })();
  type Entry =
    | { kind: 'item'; key: string; sortNum: number; item: ItineraryItem }
    | { kind: 'ticket'; key: string; sortNum: number; ticket: Ticket }
    | { kind: 'match'; key: string; sortNum: number; match: Partido }
    | { kind: 'flight'; key: string; sortNum: number; flight: Flight }
    | { kind: 'hotel'; key: string; sortNum: number; hotel: Hotel; tipo: 'in' | 'out' }
    | { kind: 'placesel'; key: string; sortNum: number; name: string; who: TravelerId[]; ids: string[]; visited: boolean };
  const entries: Entry[] = [
    ...items.map((i): Entry => ({ kind: 'item', key: i.id, sortNum: itemSortNum(i), item: i })),
    ...dayTickets.map((t): Entry => ({ kind: 'ticket', key: `tk-${t.id}`, sortNum: toMin(t.time), ticket: t })),
    ...dayMatches.map((m): Entry => ({ kind: 'match', key: `wc-${m.id}`, sortNum: toMin(horaLocalPartido(m.fecha_hora)), match: m })),
    ...dayFlights.map((f): Entry => ({ kind: 'flight', key: `fl-${f.id}`, sortNum: toMin(tsTime(f.departs_at)), flight: f })),
    ...dayPlaceSel.map((ps): Entry => ({
      kind: 'placesel', key: `ps-${ps.place_id}`, sortNum: ps.position ?? 9100,
      name: ps.name, who: ps.who, ids: ps.ids, visited: ps.visited,
    })),
    // Check-out al inicio del día (te vas en la mañana); check-in al final (llegas).
    ...dayHotels.flatMap((h): Entry[] => [
      ...(h.check_out === activeDate ? [{ kind: 'hotel', key: `ho-out-${h.id}`, sortNum: -10, hotel: h, tipo: 'out' } as Entry] : []),
      ...(h.check_in === activeDate ? [{ kind: 'hotel', key: `ho-in-${h.id}`, sortNum: 1500, hotel: h, tipo: 'in' } as Entry] : []),
    ]),
  ].sort((a, b) => a.sortNum - b.sortNum);

  async function addItem() {
    if (!fTitle.trim() || saving) return;
    setSaving(true);
    setErrMsg('');
    const row = {
      id: uuid(),
      trip_id: trip.id,
      date: activeDate,
      time: fTime || null,
      title: fTitle.trim(),
      place_id: null,
      note: fNote.trim() || null,
      done: false,
      position: null,
      created_by: identity,
      created_at: new Date().toISOString(),
    };
    const { data, error } = await mutate({ table: 'itinerary_items', type: 'insert', row });
    setSaving(false);
    if (error) {
      setErrMsg('No se pudo guardar. Revisa tu conexión e intenta de nuevo.');
      return;
    }
    apply({ eventType: 'INSERT', new: data ?? row, old: {} });
    setFTime(''); setFTitle(''); setFNote('');
    setShowForm(false);
  }

  async function removeItem(id: string) {
    if (!confirm('¿Borrar este plan?')) return;
    const { error } = await mutate({ table: 'itinerary_items', type: 'delete', id });
    if (error) {
      setErrMsg('No se pudo borrar. Revisa tu conexión e intenta de nuevo.');
      return;
    }
    apply({ eventType: 'DELETE', new: {}, old: { id } });
  }

  async function toggleDone(it: ItineraryItem) {
    const optimistic = { ...it, done: !it.done };
    const { data, error } = await mutate({
      table: 'itinerary_items', type: 'update', id: it.id, patch: { done: !it.done },
    });
    if (error) { setErrMsg('No se pudo actualizar. Revisa tu conexión.'); return; }
    apply({ eventType: 'UPDATE', new: data ?? optimistic, old: {} });
  }

  // Sube/baja un plan: le asigna una posición numérica que lo deja entre sus
  // vecinos en la lista visible (default por hora; tras mover, manda la posición).
  async function moveItem(itemKey: string, dir: -1 | 1) {
    const idx = entries.findIndex((e) => e.key === itemKey);
    const target = entries[idx];
    if (idx < 0 || target.kind !== 'item') return;
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= entries.length) return;
    // Vecino al otro lado para calcular el punto medio.
    const farIdx = idx + dir * 2;
    const here = entries[swapIdx].sortNum;
    const far = farIdx >= 0 && farIdx < entries.length ? entries[farIdx].sortNum : here + dir * 2;
    const newPos = (here + far) / 2;
    const optimistic = { ...target.item, position: newPos };
    const { data, error } = await mutate({
      table: 'itinerary_items', type: 'update', id: target.item.id, patch: { position: newPos },
    });
    if (error) { setErrMsg('No se pudo reordenar. Revisa tu conexión.'); return; }
    apply({ eventType: 'UPDATE', new: data ?? optimistic, old: {} });
  }

  // ── Lugares (place_selections) dentro del día: visitado / mover / quitar ──
  /** Aplica un patch a varias filas de place_selections (las del lugar). */
  async function patchSelections(ids: string[], patch: Record<string, unknown>) {
    setErrMsg('');
    for (const id of ids) {
      const orig = placeSels.find((s) => s.id === id);
      const { data, error } = await mutate({ table: 'place_selections', type: 'update', id, patch });
      if (error) { setErrMsg('No se pudo guardar. Revisa tu conexión.'); return false; }
      apply({ eventType: 'UPDATE', new: data ?? { ...orig, ...patch }, old: {} });
    }
    return true;
  }

  function toggleVisitedPlace(ids: string[], current: boolean) {
    return patchSelections(ids, { visited: !current });
  }

  async function movePlaceSel(key: string, ids: string[], dir: -1 | 1) {
    const idx = entries.findIndex((e) => e.key === key);
    const swapIdx = idx + dir;
    if (idx < 0 || swapIdx < 0 || swapIdx >= entries.length) return;
    const farIdx = idx + dir * 2;
    const here = entries[swapIdx].sortNum;
    const far = farIdx >= 0 && farIdx < entries.length ? entries[farIdx].sortNum : here + dir * 2;
    await patchSelections(ids, { position: (here + far) / 2 });
  }

  /** Quita este día de los lugares (borra el date-id de hoy de preferred_dates). */
  async function removePlaceSelDay(ids: string[]) {
    if (!confirm('¿Quitar este lugar del día? (sigue marcado en Lugares)')) return;
    setErrMsg('');
    for (const id of ids) {
      const orig = placeSels.find((s) => s.id === id);
      const nuevas = (orig?.preferred_dates ?? []).filter((d) => Number(d.split('-').pop()) !== activeDayNum);
      const { data, error } = await mutate({ table: 'place_selections', type: 'update', id, patch: { preferred_dates: nuevas } });
      if (error) { setErrMsg('No se pudo quitar. Revisa tu conexión.'); return; }
      apply({ eventType: 'UPDATE', new: data ?? { ...orig, preferred_dates: nuevas }, old: {} });
    }
  }

  if (!trip.days.length) return null;

  return (
    <div className="max-w-xl mx-auto py-5">
      {/* Tabs de días */}
      <div className="px-5 overflow-x-auto pb-2" role="tablist" aria-label="Días del viaje">
        <div className="flex gap-2 w-max">
          {trip.days.map((d) => {
            const sel = d.date === activeDate;
            const { dia, num } = chipLabel(d.date);
            const c = trip.cities.find((x) => x.id === d.cityId);
            const esHoy = isToday(d.date);
            return (
              <button
                key={d.date}
                role="tab"
                aria-selected={sel}
                onClick={() => { setActiveDate(d.date); setErrMsg(''); }}
                className={`min-w-14 min-h-11 rounded-2xl px-3 py-1.5 flex flex-col items-center cursor-pointer transition-colors duration-200 border-2
                  ${sel ? 'bg-brasil-green border-brasil-green text-white' : 'bg-white border-sand-dark text-gray-600'}
                  ${esHoy && !sel ? 'border-brasil-yellow' : ''}`}
              >
                <span className="text-[10px] font-semibold uppercase">{dia}</span>
                <span className="font-display font-bold text-lg leading-none">{num}</span>
                <span className="text-[9px] opacity-75">{c?.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-5 mt-3">
        <h2 className="font-display font-bold text-xl text-gray-800">{formatDayEs(activeDate)}</h2>
        {ciudad && <p className="text-sm text-gray-500">{ciudad.flag} {ciudad.name}</p>}

        {ciudad?.center && <DayWeatherStrip center={ciudad.center} date={activeDate} />}

        {day?.note && (
          <div className="flex items-center gap-2 rounded-xl bg-brasil-yellow/25 text-amber-800 text-sm font-semibold px-3 py-2 mt-3">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" aria-hidden />
            {day.note}
          </div>
        )}

        {errMsg && (
          <div role="alert" className="mt-3 rounded-xl bg-red-50 text-red-700 text-sm font-semibold px-3 py-2">
            {errMsg}
          </div>
        )}

        {/* Lista de planes del día */}
        <div className="mt-4 space-y-2">
          {loading && <p className="text-sm text-gray-400">Cargando…</p>}
          {!loading && entries.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-sand-dark p-6 text-center text-gray-400">
              <p className="font-semibold">Nada planeado aún</p>
              <p className="text-sm mt-0.5">Toca + para agregar el primer plan</p>
            </div>
          )}
          <AnimatePresence initial={false}>
            {entries.map((e) =>
              e.kind === 'item' ? (
                <motion.div
                  key={e.key}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  className={`rounded-2xl border p-4 flex items-start gap-2 ${e.item.done ? 'bg-gray-50 border-sand-dark' : 'bg-white border-sand-dark'}`}
                >
                  {/* Marcar visitado */}
                  <button
                    onClick={() => toggleDone(e.item)}
                    aria-label={e.item.done ? `Desmarcar ${e.item.title}` : `Marcar ${e.item.title} como visitado`}
                    className={`mt-0.5 shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center cursor-pointer transition-colors duration-200
                      ${e.item.done ? 'bg-brasil-green border-brasil-green text-white' : 'border-gray-300 text-transparent'}`}
                  >
                    <Check className="w-4 h-4" aria-hidden />
                  </button>
                  <span className={`font-mono text-sm font-bold w-11 flex-shrink-0 pt-0.5 ${e.item.done ? 'text-gray-300' : 'text-brasil-green'}`}>
                    {e.item.time ? e.item.time.slice(0, 5) : '—'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold ${e.item.done ? 'line-through text-gray-400' : 'text-gray-800'}`}>{e.item.title}</p>
                    {e.item.note && <p className="text-sm text-gray-500">{e.item.note}</p>}
                    <p className="text-[10px] text-gray-400 mt-1">
                      {e.item.created_by === 'andres' ? 'Andrés' : 'Melisa'}
                    </p>
                  </div>
                  {/* Reordenar */}
                  <div className="flex flex-col -my-1">
                    <button
                      onClick={() => moveItem(e.key, -1)}
                      aria-label={`Subir ${e.item.title}`}
                      className="min-w-9 h-7 flex items-center justify-center text-gray-300 hover:text-brasil-blue cursor-pointer transition-colors duration-200"
                    >
                      <ChevronUp className="w-4 h-4" aria-hidden />
                    </button>
                    <button
                      onClick={() => moveItem(e.key, 1)}
                      aria-label={`Bajar ${e.item.title}`}
                      className="min-w-9 h-7 flex items-center justify-center text-gray-300 hover:text-brasil-blue cursor-pointer transition-colors duration-200"
                    >
                      <ChevronDown className="w-4 h-4" aria-hidden />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(e.item.id)}
                    aria-label={`Borrar ${e.item.title}`}
                    className="min-w-9 min-h-9 -my-1 flex items-center justify-center text-gray-300 hover:text-red-400 cursor-pointer transition-colors duration-200"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden />
                  </button>
                </motion.div>
              ) : e.kind === 'ticket' ? (
                <motion.div
                  key={e.key}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  className="rounded-2xl bg-brasil-yellow/10 border border-brasil-yellow/50 p-4 flex items-start gap-3"
                >
                  <span className="font-mono text-sm text-amber-700 font-bold w-12 flex-shrink-0 pt-0.5">
                    {e.ticket.time ? e.ticket.time.slice(0, 5) : '—'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <TicketIcon className="w-4 h-4 text-amber-600 flex-shrink-0" aria-hidden style={{ filter: 'brightness(0.85)' }} />
                      <p className="font-semibold text-gray-800">{e.ticket.title}</p>
                    </div>
                    {e.ticket.note && <p className="text-sm text-gray-500 mt-0.5">{e.ticket.note}</p>}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wide text-amber-700/80">Experiencia</span>
                      {e.ticket.file_path && (
                        <a
                          href={docUrl(e.ticket.file_path)} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-brasil-green"
                        >
                          <FileText className="w-3.5 h-3.5" aria-hidden /> Ver boleta
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : e.kind === 'match' ? (
                <MatchRow key={e.key} match={e.match} />
              ) : e.kind === 'flight' ? (
                <FlightRow key={e.key} flight={e.flight} />
              ) : e.kind === 'hotel' ? (
                <HotelRow key={e.key} hotel={e.hotel} tipo={e.tipo} />
              ) : (
                <PlaceSelRow
                  key={e.key} name={e.name} who={e.who} visited={e.visited}
                  onToggle={() => toggleVisitedPlace(e.ids, e.visited)}
                  onUp={() => movePlaceSel(e.key, e.ids, -1)}
                  onDown={() => movePlaceSel(e.key, e.ids, 1)}
                  onRemove={() => removePlaceSelDay(e.ids)}
                />
              ),
            )}
          </AnimatePresence>
        </div>

        {/* Form agregar */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-3 rounded-2xl bg-white border-2 border-brasil-green p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-display font-bold text-gray-800">Nuevo plan</p>
                  <button
                    onClick={() => setShowForm(false)}
                    aria-label="Cerrar formulario"
                    className="min-w-11 min-h-11 -m-2 flex items-center justify-center text-gray-400 cursor-pointer"
                  >
                    <X className="w-4 h-4" aria-hidden />
                  </button>
                </div>
                <div className="flex gap-2">
                  <div>
                    <label htmlFor="it-time" className="text-xs font-semibold text-gray-500">Hora</label>
                    <input
                      id="it-time" type="time" value={fTime}
                      onChange={(e) => setFTime(e.target.value)}
                      className="block w-28 rounded-xl border-2 border-sand-dark px-2 py-2 text-sm outline-none focus:border-brasil-green transition-colors duration-200"
                    />
                  </div>
                  <div className="flex-1">
                    <label htmlFor="it-title" className="text-xs font-semibold text-gray-500">Plan *</label>
                    <input
                      id="it-title" type="text" value={fTitle}
                      onChange={(e) => setFTitle(e.target.value)}
                      placeholder="¿Qué vamos a hacer?"
                      className="block w-full rounded-xl border-2 border-sand-dark px-3 py-2 text-sm outline-none focus:border-brasil-green transition-colors duration-200"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="it-note" className="text-xs font-semibold text-gray-500">Nota</label>
                  <input
                    id="it-note" type="text" value={fNote}
                    onChange={(e) => setFNote(e.target.value)}
                    placeholder="Detalles, dirección, reserva…"
                    className="block w-full rounded-xl border-2 border-sand-dark px-3 py-2 text-sm outline-none focus:border-brasil-green transition-colors duration-200"
                  />
                </div>
                <button
                  onClick={addItem}
                  disabled={!fTitle.trim() || saving}
                  className="w-full min-h-11 rounded-xl font-display font-bold text-white bg-brasil-green disabled:opacity-50 cursor-pointer transition-opacity duration-200 hover:opacity-90"
                >
                  {saving ? 'Guardando…' : 'Agregar al día'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 w-full min-h-12 rounded-2xl border-2 border-dashed border-brasil-green text-brasil-green font-display font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors duration-200 hover:bg-brasil-green/5"
          >
            <Plus className="w-5 h-5" aria-hidden /> Agregar plan
          </button>
        )}
      </div>
    </div>
  );
}

/** Tira de clima por hora del día activo (Open-Meteo, cache 1h). */
function DayWeatherStrip({ center, date }: { center: [number, number]; date: string }) {
  const [data, setData] = useState<Weather | null>(null);
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading');

  useEffect(() => {
    let alive = true;
    // Reset intencional a "cargando" al cambiar de día/ciudad.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState('loading');
    fetchWeather(center[0], center[1])
      .then((w) => { if (alive) { setData(w); setState('ok'); } })
      .catch(() => { if (alive) setState('error'); });
    return () => { alive = false; };
  }, [center]);

  if (state === 'error') return null;
  const horas = data?.hourly.filter((h) => h.time.slice(0, 10) === date) ?? [];
  // Fuera de la ventana de pronóstico (≈16 días) no hay horas para ese día.
  if (state === 'ok' && horas.length === 0) return null;

  return (
    <div className="mt-3">
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Clima por hora</p>
      {state === 'loading' ? (
        <p className="text-xs text-gray-400">Cargando clima…</p>
      ) : (
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {horas.map((h) => (
            <div key={h.time} className="shrink-0 w-12 rounded-xl bg-sand/40 py-1.5 flex flex-col items-center gap-0.5">
              <span className="text-[10px] text-gray-500">{h.time.slice(11, 16)}</span>
              <span className="text-base leading-none" aria-hidden>{wmo(h.code).emoji}</span>
              <span className="text-xs font-bold text-gray-800">{h.temp}°</span>
              <span className="text-[9px] text-brasil-blue">{h.rain}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Vuelo del día (read-only, gestionado en Plan). */
function FlightRow({ flight: f }: { flight: Flight }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="rounded-2xl bg-brasil-blue/5 border border-brasil-blue/40 p-4 flex items-start gap-3"
    >
      <span className="font-mono text-sm text-brasil-blue font-bold w-12 flex-shrink-0 pt-0.5">
        {tsTime(f.departs_at)}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-800 flex items-center gap-1.5 flex-wrap">
          <Plane className="w-4 h-4 text-brasil-blue flex-shrink-0" aria-hidden />
          {f.from_city}
          <MoveRight className="w-3.5 h-3.5 text-gray-400" aria-hidden />
          {f.to_city}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] font-bold uppercase tracking-wide text-brasil-blue/80">
            Vuelo · {f.airline}{f.flight_number ? ` ${f.flight_number}` : ''}
          </span>
          {f.arrives_at && <span className="text-[11px] text-gray-500">llega {tsTime(f.arrives_at)}</span>}
        </div>
      </div>
    </motion.div>
  );
}

/** Check-in / check-out de hotel en el día. */
function HotelRow({ hotel: h, tipo }: { hotel: Hotel; tipo: 'in' | 'out' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="rounded-2xl bg-sand/40 border border-sand-dark p-4 flex items-start gap-3"
    >
      <span className="font-mono text-sm text-gray-500 font-bold w-12 flex-shrink-0 pt-0.5" aria-hidden>🏨</span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-800 flex items-center gap-1.5">
          <BedDouble className="w-4 h-4 text-gray-500 flex-shrink-0" aria-hidden />
          {h.name}
        </p>
        <span className="text-[10px] font-bold uppercase tracking-wide text-gray-500">
          {tipo === 'in' ? 'Check-in' : 'Check-out'}
        </span>
      </div>
    </motion.div>
  );
}

/** Lugar marcado en Lugares con este día como preferido. Se puede marcar como
 *  visitado, reordenar y quitar del día (sin desmarcarlo en Lugares). */
function PlaceSelRow({ name, who, visited, onToggle, onUp, onDown, onRemove }: {
  name: string; who: TravelerId[]; visited: boolean;
  onToggle: () => void; onUp: () => void; onDown: () => void; onRemove: () => void;
}) {
  const quienes = who.map((t) => (t === 'andres' ? 'Andrés' : 'Melisa')).join(' y ');
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className={`rounded-2xl border p-4 flex items-start gap-2 ${visited ? 'bg-gray-50 border-sand-dark' : 'bg-rose-50 border-rose-200'}`}
    >
      <button
        onClick={onToggle}
        aria-label={visited ? `Desmarcar ${name}` : `Marcar ${name} como visitado`}
        className={`mt-0.5 shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center cursor-pointer transition-colors duration-200
          ${visited ? 'bg-brasil-green border-brasil-green text-white' : 'border-rose-300 text-transparent'}`}
      >
        <Check className="w-4 h-4" aria-hidden />
      </button>
      <span className="text-sm w-7 flex-shrink-0 pt-0.5 text-center" aria-hidden>📍</span>
      <div className="flex-1 min-w-0">
        <p className={`font-semibold ${visited ? 'line-through text-gray-400' : 'text-gray-800'}`}>{name}</p>
        <span className="text-[10px] font-bold uppercase tracking-wide text-rose-500/80">
          ❤️ Quieren ir · {quienes}
        </span>
      </div>
      <div className="flex flex-col -my-1">
        <button onClick={onUp} aria-label={`Subir ${name}`}
          className="min-w-9 h-7 flex items-center justify-center text-gray-300 hover:text-brasil-blue cursor-pointer transition-colors duration-200">
          <ChevronUp className="w-4 h-4" aria-hidden />
        </button>
        <button onClick={onDown} aria-label={`Bajar ${name}`}
          className="min-w-9 h-7 flex items-center justify-center text-gray-300 hover:text-brasil-blue cursor-pointer transition-colors duration-200">
          <ChevronDown className="w-4 h-4" aria-hidden />
        </button>
      </div>
      <button onClick={onRemove} aria-label={`Quitar ${name} del día`}
        className="min-w-9 min-h-9 -my-1 flex items-center justify-center text-gray-300 hover:text-red-400 cursor-pointer transition-colors duration-200">
        <Trash2 className="w-4 h-4" aria-hidden />
      </button>
    </motion.div>
  );
}

/** Un equipo: banderita (si hay) + nombre. */
function Equipo({ nombre, bandera }: { nombre: string; bandera: string | null }) {
  return (
    <span className="inline-flex items-center gap-1">
      {bandera && <img src={bandera} alt="" className="w-4 h-4 rounded-sm object-cover" loading="lazy" />}
      {nombre}
    </span>
  );
}

/** Partido del Mundial (read-only, desde la Polla). "Por definir" mientras no se sepa. */
function MatchRow({ match: m }: { match: Partido }) {
  const tbd = porDefinir(m);
  const score = marcador(m);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="rounded-2xl bg-brasil-green/5 border border-brasil-green/40 p-4 flex items-start gap-3"
    >
      <span className="font-mono text-sm text-brasil-green font-bold w-12 flex-shrink-0 pt-0.5">
        {horaLocalPartido(m.fecha_hora)}
      </span>
      <div className="flex-1 min-w-0">
        {tbd ? (
          <p className="font-semibold text-gray-500 italic">⚽ Por definir</p>
        ) : (
          <p className="font-semibold text-gray-800 flex items-center gap-1.5 flex-wrap">
            <span aria-hidden>⚽</span>
            <Equipo nombre={m.equipo_local} bandera={m.bandera_local} />
            <span className="text-gray-400 text-xs">vs</span>
            <Equipo nombre={m.equipo_visitante} bandera={m.bandera_visitante} />
            {score && <span className="ml-1 text-sm font-bold text-gray-700">{score}</span>}
          </p>
        )}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] font-bold uppercase tracking-wide text-brasil-green/80">
            Mundial · {etiquetaFase(m)}
          </span>
          {m.estado === 'en_juego' && (
            <span className="text-[10px] font-bold text-red-600 animate-pulse">● EN VIVO</span>
          )}
          {m.estado === 'finalizado' && (
            <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400">Final</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
