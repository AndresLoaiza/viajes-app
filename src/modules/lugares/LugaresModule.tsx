import { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart } from 'lucide-react';
import CategoryGrid from '../../components/CategoryGrid';
import PlaceCard from '../../components/PlaceCard';
import { supabase } from '../../lib/supabase';
import { useTable } from '../../lib/realtime';
import type { TripConfig, TravelerId, TripPlaceSelection } from '../../types/trip';
import type { PlaceSelection, SelectionsMap } from '../../types/city';

/**
 * Lugares: explorar y marcar por ciudad. Cada selección es una fila en
 * place_selections (por persona); se ve en vivo lo que marca el otro.
 */
export default function LugaresModule({ trip, identity }: {
  trip: TripConfig;
  identity: TravelerId;
}) {
  const [cityId, setCityId] = useState(trip.cities[0]?.id ?? '');
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const { rows, apply } = useTable<TripPlaceSelection>('place_selections', trip.id);

  // Overlay optimista: el toggle se siente inmediato mientras llega el eco realtime.
  const [pending, setPending] = useState<Record<string, boolean>>({});
  const [errMsg, setErrMsg] = useState('');
  // Notas en edición (estado local inmediato + update debounced a Supabase).
  const [draftNotes, setDraftNotes] = useState<Record<string, string>>({});
  const noteTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const city = trip.cities.find((c) => c.id === cityId);

  const mine = useMemo(
    () => rows.filter((r) => r.selected_by === identity && r.city_id === cityId),
    [rows, identity, cityId],
  );
  const otherName = identity === 'andres' ? 'Melisa' : 'Andrés';
  const otherSet = useMemo(
    () => new Set(rows.filter((r) => r.selected_by !== identity && r.city_id === cityId).map((r) => r.place_id)),
    [rows, identity, cityId],
  );

  const selections: SelectionsMap = useMemo(() => {
    const map: SelectionsMap = {};
    if (!city) return map;
    const mineByPlace = new Map(mine.map((r) => [r.place_id, r]));
    city.places.forEach((p) => {
      const row = mineByPlace.get(p.id);
      map[p.id] = {
        placeId: p.id,
        selected: pending[p.id] ?? !!row,
        preferredDates: [],
        notes: draftNotes[p.id] ?? row?.note ?? '',
      };
    });
    return map;
  }, [city, mine, pending, draftNotes]);

  async function handleChange(updated: PlaceSelection) {
    const row = mine.find((r) => r.place_id === updated.placeId);
    const wasSelected = pending[updated.placeId] ?? !!row;

    if (updated.selected !== wasSelected) {
      setPending((p) => ({ ...p, [updated.placeId]: updated.selected }));
      setErrMsg('');
      let error = null;
      if (updated.selected) {
        const res = await supabase.from('place_selections').insert({
          trip_id: trip.id,
          city_id: cityId,
          place_id: updated.placeId,
          selected_by: identity,
          note: updated.notes || null,
        }).select().single();
        error = res.error;
        if (res.data) apply({ eventType: 'INSERT', new: res.data, old: {} });
      } else if (row) {
        ({ error } = await supabase.from('place_selections').delete().eq('id', row.id));
        if (!error) apply({ eventType: 'DELETE', new: {}, old: { id: row.id } });
      }
      if (error) setErrMsg('No se pudo guardar. Revisa tu conexión e intenta de nuevo.');
      setPending((p) => {
        const { [updated.placeId]: _drop, ...rest } = p;
        return rest;
      });
      return;
    }

    // Cambio de nota: local inmediato + persistencia debounced
    if (row && (updated.notes ?? '') !== (draftNotes[updated.placeId] ?? row.note ?? '')) {
      setDraftNotes((d) => ({ ...d, [updated.placeId]: updated.notes ?? '' }));
      clearTimeout(noteTimers.current[updated.placeId]);
      noteTimers.current[updated.placeId] = setTimeout(async () => {
        await supabase.from('place_selections')
          .update({ note: updated.notes || null })
          .eq('id', row.id);
        setDraftNotes((d) => {
          const { [updated.placeId]: _drop, ...rest } = d;
          return rest;
        });
      }, 800);
    }
  }

  if (!city) return null;

  const catConfig = city.categories.find((c) => c.id === activeCat);
  const catPlaces = city.places.filter((p) => p.category === activeCat);

  return (
    <div className="max-w-xl mx-auto px-5 py-5">
      {/* Tabs de ciudad */}
      <div className="flex gap-2 mb-4" role="tablist" aria-label="Ciudades">
        {trip.cities.map((c) => {
          const sel = c.id === cityId;
          return (
            <button
              key={c.id}
              role="tab"
              aria-selected={sel}
              onClick={() => { setCityId(c.id); setActiveCat(null); }}
              className={`flex-1 min-h-11 rounded-2xl px-2 font-display font-bold text-sm cursor-pointer transition-colors duration-200 border-2
                ${sel ? 'bg-brasil-blue border-brasil-blue text-white' : 'bg-white border-sand-dark text-gray-600'}`}
            >
              {({ rio: 'Río', foz: 'Foz', sp: 'São Paulo' } as Record<string, string>)[c.id] ?? c.name}
            </button>
          );
        })}
      </div>

      {errMsg && (
        <div role="alert" className="mb-3 rounded-xl bg-red-50 text-red-700 text-sm font-semibold px-3 py-2">
          {errMsg}
        </div>
      )}

      {!catConfig ? (
        <>
          <p className="text-sm text-gray-500 mb-4">
            Marquen lo que les gustaría conocer — cada quien con su corazón, y se ve en vivo.
          </p>
          <CategoryGrid config={city} selections={selections} onPick={setActiveCat} />
        </>
      ) : (
        <div>
          <button
            onClick={() => setActiveCat(null)}
            className="mb-4 min-h-11 flex items-center gap-2 font-display font-bold text-gray-700 cursor-pointer transition-colors duration-200 hover:text-brasil-green"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden /> {catConfig.emoji} {catConfig.name}
          </button>
          <div className="space-y-5">
            {catPlaces.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.06, 0.3) }}
                className="relative"
              >
                {otherSet.has(p.id) && (
                  <span
                    className="absolute -top-2 right-3 z-10 inline-flex items-center gap-1 rounded-full bg-brasil-yellow px-2.5 py-1 text-[11px] font-bold text-brasil-blue shadow"
                    title={`A ${otherName} le gusta`}
                  >
                    <Heart className="w-3 h-3 fill-current" aria-hidden /> {otherName}
                  </span>
                )}
                <PlaceCard
                  place={p}
                  dates={city.dates}
                  selection={selections[p.id]}
                  categoryColor={catConfig.color}
                  onChange={handleChange}
                />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
