import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Images, Loader2, Trash2, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useTable } from '../../lib/realtime';
import { formatDayEs } from '../../lib/dates';
import { compressImage, dateFromMs, groupByDate } from '../../lib/galeria';
import type { Photo, TravelerId, TripConfig } from '../../types/trip';

const photoUrl = (path: string) =>
  supabase.storage.from('photos').getPublicUrl(path).data.publicUrl;

const travelerName = (t: TravelerId) => (t === 'andres' ? 'Andrés' : 'Melisa');

/** Galería compartida: subir fotos (comprimidas), grid por día, lightbox. */
export default function GaleriaModule({ trip, identity }: {
  trip: TripConfig;
  identity: TravelerId;
}) {
  const { rows, loading, apply } = useTable<Photo>('photos', trip.id);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [errMsg, setErrMsg] = useState('');
  const [lightbox, setLightbox] = useState<Photo | null>(null);
  const [caption, setCaption] = useState('');
  const [savingCaption, setSavingCaption] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const groups = groupByDate(rows);

  async function uploadFiles(files: FileList) {
    setErrMsg('');
    setProgress({ done: 0, total: files.length });
    let failed = 0;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const blob = await compressImage(file);
        const takenOn = dateFromMs(file.lastModified);
        const path = `${trip.id}/${Date.now()}-${i}.jpg`;
        const { error: upErr } = await supabase.storage.from('photos')
          .upload(path, blob, { contentType: 'image/jpeg' });
        if (upErr) throw upErr;
        const { data, error } = await supabase.from('photos').insert({
          trip_id: trip.id,
          file_path: path,
          taken_on: takenOn,
          city_id: trip.days.find((d) => d.date === takenOn)?.cityId ?? null,
          uploaded_by: identity,
        }).select().single();
        if (error) throw error;
        if (data) apply({ eventType: 'INSERT', new: data, old: {} });
      } catch {
        failed++;
      }
      setProgress({ done: i + 1, total: files.length });
    }
    setProgress(null);
    if (failed > 0) setErrMsg(`${failed} foto${failed > 1 ? 's' : ''} no se pudo subir. Intenta de nuevo.`);
    if (fileRef.current) fileRef.current.value = '';
  }

  async function removePhoto(p: Photo) {
    if (!confirm('¿Borrar esta foto para ambos?')) return;
    const { error } = await supabase.from('photos').delete().eq('id', p.id);
    if (error) {
      setErrMsg('No se pudo borrar. Revisa tu conexión e intenta de nuevo.');
      return;
    }
    apply({ eventType: 'DELETE', new: {}, old: { id: p.id } });
    setLightbox(null);
    await supabase.storage.from('photos').remove([p.file_path]);
  }

  async function saveCaption() {
    if (!lightbox || savingCaption) return;
    setSavingCaption(true);
    const { data, error } = await supabase.from('photos')
      .update({ caption: caption.trim() || null })
      .eq('id', lightbox.id).select().single();
    setSavingCaption(false);
    if (error) {
      setErrMsg('No se pudo guardar la nota.');
      return;
    }
    if (data) {
      apply({ eventType: 'UPDATE', new: data, old: {} });
      setLightbox(data as Photo);
    }
  }

  function openLightbox(p: Photo) {
    setLightbox(p);
    setCaption(p.caption ?? '');
  }

  return (
    <div className="max-w-xl mx-auto px-5 py-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-xl text-gray-800 flex items-center gap-2">
          <Images className="w-5 h-5 text-brasil-green" aria-hidden /> Galería
          {rows.length > 0 && <span className="text-sm font-sans font-semibold text-gray-400">({rows.length})</span>}
        </h2>
        <input
          ref={fileRef} type="file" accept="image/*" multiple className="hidden"
          onChange={(e) => e.target.files?.length && uploadFiles(e.target.files)}
        />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={!!progress}
          className="inline-flex items-center gap-2 rounded-xl bg-brasil-green text-white font-display font-bold text-sm px-4 py-2.5 disabled:opacity-60 cursor-pointer transition-opacity duration-200 hover:opacity-90"
        >
          {progress
            ? <><Loader2 className="w-4 h-4 animate-spin" aria-hidden /> {progress.done}/{progress.total}</>
            : <><Camera className="w-4 h-4" aria-hidden /> Subir fotos</>}
        </button>
      </div>

      {errMsg && (
        <div role="alert" className="mt-3 rounded-xl bg-red-50 text-red-700 text-sm font-semibold px-3 py-2">
          {errMsg}
        </div>
      )}

      {loading && <p className="text-sm text-gray-400 mt-4">Cargando…</p>}
      {!loading && rows.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-sand-dark p-10 text-center text-gray-400 mt-4">
          <Camera className="w-8 h-8 mx-auto mb-2 opacity-50" aria-hidden />
          <p className="font-semibold">Aún no hay fotos</p>
          <p className="text-sm mt-0.5">Suban las primeras para empezar el álbum</p>
        </div>
      )}

      {groups.map(({ date, photos }) => {
        const day = date ? trip.days.find((d) => d.date === date) : undefined;
        const city = day ? trip.cities.find((c) => c.id === day.cityId) : undefined;
        return (
          <section key={date ?? 'sin-fecha'} className="mt-6">
            <h3 className="font-display font-bold text-gray-700">
              {date ? formatDayEs(date) : 'Sin fecha'}
              {city && <span className="font-sans text-sm font-semibold text-gray-400 ml-2">{city.flag} {city.name}</span>}
            </h3>
            <div className="grid grid-cols-3 gap-1 mt-2 rounded-2xl overflow-hidden">
              {photos.map((p) => (
                <button
                  key={p.id}
                  onClick={() => openLightbox(p)}
                  aria-label={p.caption ? `Ver foto: ${p.caption}` : 'Ver foto'}
                  className="relative aspect-square bg-sand/50 cursor-pointer"
                >
                  <img
                    src={photoUrl(p.file_path)}
                    alt={p.caption ?? ''}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </section>
        );
      })}

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Foto ampliada"
          >
            <div className="flex items-center justify-between px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
              <p className="text-white/80 text-sm font-semibold">
                {travelerName(lightbox.uploaded_by)}
                {lightbox.taken_on && <span className="text-white/50"> · {formatDayEs(lightbox.taken_on)}</span>}
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => removePhoto(lightbox)} aria-label="Borrar foto"
                  className="min-w-11 min-h-11 flex items-center justify-center text-white/60 hover:text-red-400 cursor-pointer transition-colors duration-200">
                  <Trash2 className="w-5 h-5" aria-hidden />
                </button>
                <button onClick={() => setLightbox(null)} aria-label="Cerrar foto"
                  className="min-w-11 min-h-11 flex items-center justify-center text-white/80 hover:text-white cursor-pointer transition-colors duration-200">
                  <X className="w-6 h-6" aria-hidden />
                </button>
              </div>
            </div>
            <div className="flex-1 min-h-0 flex items-center justify-center px-2" onClick={() => setLightbox(null)}>
              <img
                src={photoUrl(lightbox.file_path)}
                alt={lightbox.caption ?? ''}
                className="max-w-full max-h-full object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex gap-2">
              <input
                type="text" value={caption}
                onChange={(e) => setCaption(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveCaption()}
                placeholder="Agregar una nota a esta foto…"
                aria-label="Nota de la foto"
                className="flex-1 rounded-xl bg-white/10 text-white placeholder-white/40 px-3 py-2.5 text-sm outline-none border-2 border-transparent focus:border-brasil-yellow transition-colors duration-200"
              />
              {caption.trim() !== (lightbox.caption ?? '') && (
                <button onClick={saveCaption} disabled={savingCaption}
                  className="rounded-xl bg-brasil-yellow text-gray-900 font-bold text-sm px-4 disabled:opacity-60 cursor-pointer">
                  {savingCaption ? '…' : 'Guardar'}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
