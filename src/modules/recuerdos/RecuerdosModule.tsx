import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Camera, CalendarDays, MapPin, Sparkles } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useTable } from '../../lib/realtime';
import { formatDayEs } from '../../lib/dates';
import { daysAscending, placesSummary, tripStats } from '../../lib/recuerdos';
import type { Photo, TripConfig } from '../../types/trip';

const photoUrl = (path: string) =>
  supabase.storage.from('photos').getPublicUrl(path).data.publicUrl;

/** Recuerdos: recap del viaje a partir de las fotos (fecha + lugar de los GPS). */
export default function RecuerdosModule({ trip }: { trip: TripConfig }) {
  const { rows, loading } = useTable<Photo>('photos', trip.id);

  const days = useMemo(() => daysAscending(rows), [rows]);
  const places = useMemo(() => placesSummary(rows), [rows]);
  const stats = useMemo(() => tripStats(rows), [rows]);
  const dated = useMemo(() => rows.filter((p) => p.taken_on).sort((a, b) => a.taken_on!.localeCompare(b.taken_on!)), [rows]);
  const cover = dated[0] ?? rows[0];
  const range = dated.length
    ? `${formatDayEs(dated[0].taken_on!)} – ${formatDayEs(dated[dated.length - 1].taken_on!)}`
    : '';

  if (loading) {
    return <div className="max-w-xl mx-auto px-5 py-16 text-center text-gray-300">Cargando recuerdos…</div>;
  }
  if (rows.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-5 py-16 text-center text-gray-400">
        <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" aria-hidden />
        <p className="font-display font-bold text-lg text-gray-700">Aún no hay recuerdos</p>
        <p className="text-sm mt-1">Cuando suban fotos, aquí se arma la historia del viaje.</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto pb-6">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="relative h-60 overflow-hidden"
      >
        {cover && (
          <img src={photoUrl(cover.file_path)} alt="" className="absolute inset-0 w-full h-full object-cover" />
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,.75), rgba(0,0,0,.15) 55%, rgba(0,0,0,.25))' }} />
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
          <p className="text-white/80 text-sm font-semibold">{trip.flag} Recuerdos</p>
          <h1 className="font-display font-black text-3xl leading-tight">{trip.name}</h1>
          {range && <p className="text-white/85 text-sm mt-0.5">{range}</p>}
        </div>
      </motion.div>

      {/* Stats */}
      <div className="px-5 -mt-5 relative">
        <div className="rounded-2xl bg-white border border-sand-dark shadow-sm grid grid-cols-3 divide-x divide-sand">
          <Stat icon={<Camera className="w-4 h-4" aria-hidden />} n={stats.photos} label="fotos" />
          <Stat icon={<CalendarDays className="w-4 h-4" aria-hidden />} n={stats.days} label={stats.days === 1 ? 'día' : 'días'} />
          <Stat icon={<MapPin className="w-4 h-4" aria-hidden />} n={stats.places} label={stats.places === 1 ? 'lugar' : 'lugares'} />
        </div>
      </div>

      {/* Lugares que visitamos */}
      {places.length > 0 && (
        <section className="px-5 mt-6">
          <h2 className="font-display font-bold text-gray-700 mb-2">Lugares que visitamos</h2>
          <div className="flex flex-wrap gap-1.5">
            {places.map((p) => (
              <span key={p.place} className="inline-flex items-center gap-1 rounded-full bg-white border border-sand-dark px-2.5 py-1 text-xs text-gray-600">
                <MapPin className="w-3 h-3 text-brasil-blue" aria-hidden /> {p.place}
                {p.count > 1 && <span className="text-gray-400">· {p.count}</span>}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Día a día */}
      <section className="px-5 mt-7">
        <h2 className="font-display font-bold text-gray-700 mb-3">Día a día</h2>
        <div className="space-y-6">
          {days.map((d) => (
            <div key={d.date ?? 'sin-fecha'}>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="font-display font-bold text-gray-800 capitalize">
                  {d.date ? formatDayEs(d.date) : 'Sin fecha'}
                </span>
                {d.places.length > 0 && (
                  <span className="text-xs text-gray-400 truncate">{d.places.join(' · ')}</span>
                )}
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {d.photos.map((p) => (
                  <img
                    key={p.id}
                    src={photoUrl(p.file_path)}
                    alt={p.place ?? ''}
                    loading="lazy"
                    className="h-32 w-24 flex-shrink-0 object-cover rounded-xl bg-sand/40"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ icon, n, label }: { icon: React.ReactNode; n: number; label: string }) {
  return (
    <div className="py-3 text-center">
      <p className="flex items-center justify-center gap-1 font-display font-black text-2xl text-gray-800 leading-none">
        {n}
      </p>
      <p className="flex items-center justify-center gap-1 text-xs text-gray-500 mt-1">{icon} {label}</p>
    </div>
  );
}
