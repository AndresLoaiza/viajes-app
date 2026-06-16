import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CalendarDays, MapPin, Sparkles, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useTable } from '../../lib/realtime';
import { formatDayEs } from '../../lib/dates';
import { daysAscending, tripStats } from '../../lib/recuerdos';
import type { Photo, TripConfig } from '../../types/trip';

const photoUrl = (path: string) =>
  supabase.storage.from('photos').getPublicUrl(path).data.publicUrl;

/** Recuerdos: recap del viaje a partir de las fotos (fecha + lugar de los GPS). */
export default function RecuerdosModule({ trip }: { trip: TripConfig }) {
  const { rows, loading } = useTable<Photo>('photos', trip.id);
  const [viewer, setViewer] = useState<Photo | null>(null);

  const days = useMemo(() => daysAscending(rows), [rows]);
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

      {/* Día a día */}
      <section className="px-5 mt-7">
        <h2 className="font-display font-bold text-gray-700 mb-3">Día a día</h2>
        <div className="space-y-6">
          {days.map((d) => (
            <div key={d.date ?? 'sin-fecha'}>
              <p className="font-display font-bold text-gray-800 capitalize whitespace-nowrap mb-2">
                {d.date ? formatDayEs(d.date) : 'Sin fecha'}
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {d.photos.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setViewer(p)}
                    aria-label={p.place ? `Ver foto: ${p.place}` : 'Ver foto'}
                    className="h-32 w-24 flex-shrink-0 rounded-xl bg-sand/40 overflow-hidden cursor-pointer"
                  >
                    <img
                      src={photoUrl(p.file_path)}
                      alt={p.place ?? ''}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {viewer && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex flex-col"
            role="dialog" aria-modal="true" aria-label="Foto ampliada"
            onClick={() => setViewer(null)}
          >
            <div className="flex justify-end px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
              <button onClick={() => setViewer(null)} aria-label="Cerrar foto"
                className="min-w-11 min-h-11 flex items-center justify-center text-white/80 hover:text-white cursor-pointer">
                <X className="w-6 h-6" aria-hidden />
              </button>
            </div>
            <div className="flex-1 min-h-0 flex items-center justify-center px-2">
              <img src={photoUrl(viewer.file_path)} alt={viewer.place ?? ''}
                className="max-w-full max-h-full object-contain" onClick={(e) => e.stopPropagation()} />
            </div>
            {(viewer.place || viewer.taken_on) && (
              <p className="text-center text-white/85 text-sm pb-[max(1rem,env(safe-area-inset-bottom))] pt-2">
                {viewer.place}{viewer.place && viewer.taken_on ? ' · ' : ''}
                {viewer.taken_on ? formatDayEs(viewer.taken_on) : ''}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
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
