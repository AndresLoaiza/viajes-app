import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, ExternalLink, FileText, Pencil, Ticket as TicketIcon, Trash2, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useTable } from '../../lib/realtime';
import { formatShortEs, isUnpaid } from '../../lib/logistica';
import type { Ticket, TravelerId, TripConfig } from '../../types/trip';
import {
  EmptyHint, ErrorAlert, Field, inputCls, NoteText, SectionHeader, UnpaidBadge,
} from './shared';

const EMPTY_FORM = { title: '', date: '', time: '', note: '' };

const docUrl = (path: string) =>
  supabase.storage.from('docs').getPublicUrl(path).data.publicUrl;

export default function BoletasSection({ trip, identity }: {
  trip: TripConfig;
  identity: TravelerId;
}) {
  const { rows, loading, apply } = useTable<Ticket>('tickets', trip.id);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [viewer, setViewer] = useState<Ticket | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const tickets = [...rows].sort((a, b) =>
    `${a.date ?? '9999'}${a.time ?? '99'}`.localeCompare(`${b.date ?? '9999'}${b.time ?? '99'}`));
  const valid = form.title.trim();

  const set = (k: keyof typeof EMPTY_FORM) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  function openNew() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
    setErrMsg('');
    if (fileRef.current) fileRef.current.value = '';
  }

  function openEdit(t: Ticket) {
    setForm({ title: t.title, date: t.date ?? '', time: t.time ?? '', note: t.note ?? '' });
    setEditingId(t.id);
    setShowForm(true);
    setErrMsg('');
    if (fileRef.current) fileRef.current.value = '';
  }

  async function save() {
    if (!valid || saving) return;
    setSaving(true);
    setErrMsg('');

    // Adjunto opcional → bucket docs (PDF o imagen)
    let file_path: string | null | undefined;
    const file = fileRef.current?.files?.[0];
    if (file) {
      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'pdf';
      const slug = form.title.trim().toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'boleta';
      const path = `${trip.id}/${slug}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('docs')
        .upload(path, file, { contentType: file.type || 'application/pdf' });
      if (upErr) {
        setSaving(false);
        setErrMsg('No se pudo subir el archivo. Intenta de nuevo.');
        return;
      }
      file_path = path;
    }

    const payload = {
      title: form.title.trim(),
      date: form.date || null,
      time: form.time || null,
      note: form.note.trim() || null,
      // sin archivo nuevo en edición → conservar el existente
      ...(file_path !== undefined ? { file_path } : {}),
    };
    const q = editingId
      ? supabase.from('tickets').update(payload).eq('id', editingId).select().single()
      : supabase.from('tickets').insert({ ...payload, trip_id: trip.id, created_by: identity }).select().single();
    const { data, error } = await q;
    setSaving(false);
    if (error) {
      setErrMsg('No se pudo guardar. Revisa tu conexión e intenta de nuevo.');
      return;
    }
    if (data) apply({ eventType: editingId ? 'UPDATE' : 'INSERT', new: data, old: {} });
    setShowForm(false);
  }

  async function remove(t: Ticket) {
    if (!confirm(`¿Borrar "${t.title}"?`)) return;
    const { error } = await supabase.from('tickets').delete().eq('id', t.id);
    if (error) {
      setErrMsg('No se pudo borrar. Revisa tu conexión e intenta de nuevo.');
      return;
    }
    apply({ eventType: 'DELETE', new: {}, old: { id: t.id } });
    if (t.file_path) await supabase.storage.from('docs').remove([t.file_path]);
  }

  return (
    <section aria-label="Boletas">
      <SectionHeader icon={<TicketIcon className="w-5 h-5 text-brasil-yellow" aria-hidden style={{ filter: 'brightness(0.8)' }} />} title="Boletas" count={tickets.length} onAdd={openNew} />
      <ErrorAlert msg={errMsg} />

      <div className="mt-3 space-y-2">
        {loading && <p className="text-sm text-gray-400">Cargando…</p>}
        {!loading && tickets.length === 0 && (
          <EmptyHint>Sin boletas aún. Toca + para agregar la primera.</EmptyHint>
        )}
        <AnimatePresence initial={false}>
          {tickets.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="rounded-2xl bg-white border border-sand-dark p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-display font-bold text-gray-800">{t.title}</p>
                {isUnpaid(t.note) && <UnpaidBadge />}
              </div>
              {(t.date || t.time) && (
                <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 mt-1">
                  <CalendarDays className="w-4 h-4 text-gray-400" aria-hidden />
                  {t.date ? formatShortEs(t.date) : ''}{t.time ? ` · ${t.time}` : ''}
                </p>
              )}
              {t.note && <div className="mt-2"><NoteText text={t.note} /></div>}
              <div className="flex items-center justify-between mt-2">
                {t.file_path ? (
                  // PDF → pestaña nueva (visor nativo; iframe no es confiable en
                  // móvil). Imagen → modal integrado.
                  t.file_path.toLowerCase().endsWith('.pdf') ? (
                    <a href={docUrl(t.file_path)} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-brasil-green/10 text-brasil-green font-bold text-sm px-3 py-2 transition-colors duration-200 hover:bg-brasil-green/20">
                      <FileText className="w-4 h-4" aria-hidden /> Ver boleta
                    </a>
                  ) : (
                    <button onClick={() => setViewer(t)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-brasil-green/10 text-brasil-green font-bold text-sm px-3 py-2 cursor-pointer transition-colors duration-200 hover:bg-brasil-green/20">
                      <FileText className="w-4 h-4" aria-hidden /> Ver boleta
                    </button>
                  )
                ) : <span />}
                <div className="flex gap-1">
                  <button onClick={() => openEdit(t)} aria-label={`Editar ${t.title}`}
                    className="min-w-11 min-h-11 flex items-center justify-center text-gray-300 hover:text-brasil-blue cursor-pointer transition-colors duration-200">
                    <Pencil className="w-4 h-4" aria-hidden />
                  </button>
                  <button onClick={() => remove(t)} aria-label={`Borrar ${t.title}`}
                    className="min-w-11 min-h-11 flex items-center justify-center text-gray-300 hover:text-red-400 cursor-pointer transition-colors duration-200">
                    <Trash2 className="w-4 h-4" aria-hidden />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

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
                <p className="font-display font-bold text-gray-800">{editingId ? 'Editar boleta' : 'Nueva boleta'}</p>
                <button onClick={() => setShowForm(false)} aria-label="Cerrar formulario"
                  className="min-w-11 min-h-11 -m-2 flex items-center justify-center text-gray-400 cursor-pointer">
                  <X className="w-4 h-4" aria-hidden />
                </button>
              </div>
              <Field id="tk-title" label="Título *">
                <input id="tk-title" type="text" value={form.title} onChange={set('title')} placeholder="Entrada, tour, show…" className={inputCls} />
              </Field>
              <div className="flex gap-2">
                <Field id="tk-date" label="Fecha">
                  <input id="tk-date" type="date" value={form.date} onChange={set('date')} className={inputCls} />
                </Field>
                <Field id="tk-time" label="Hora">
                  <input id="tk-time" type="time" value={form.time} onChange={set('time')} className={inputCls} />
                </Field>
              </div>
              <Field id="tk-note" label="Nota">
                <input id="tk-note" type="text" value={form.note} onChange={set('note')} placeholder="Reserva, vouchers, pago…" className={inputCls} />
              </Field>
              <Field id="tk-file" label={editingId ? 'Reemplazar archivo (PDF/imagen)' : 'Archivo (PDF/imagen)'}>
                <input id="tk-file" ref={fileRef} type="file" accept="application/pdf,image/*"
                  className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-xl file:border-0 file:bg-brasil-green/10 file:text-brasil-green file:font-bold file:px-3 file:py-2 file:cursor-pointer" />
              </Field>
              <button onClick={save} disabled={!valid || saving}
                className="w-full min-h-11 rounded-xl font-display font-bold text-white bg-brasil-green disabled:opacity-50 cursor-pointer transition-opacity duration-200 hover:opacity-90">
                {saving ? 'Guardando…' : editingId ? 'Guardar cambios' : 'Agregar boleta'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Visor de boleta (solo imágenes; PDFs abren en pestaña nueva) */}
      <AnimatePresence>
        {viewer?.file_path && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label={`Boleta ${viewer.title}`}
          >
            <div className="flex items-center justify-between gap-2 bg-white px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
              <p className="font-display font-bold text-gray-800 truncate">{viewer.title}</p>
              <div className="flex items-center gap-1 flex-shrink-0">
                <a href={docUrl(viewer.file_path)} target="_blank" rel="noopener noreferrer"
                  aria-label="Abrir en pestaña nueva"
                  className="min-w-11 min-h-11 flex items-center justify-center text-gray-500 hover:text-brasil-blue transition-colors duration-200">
                  <ExternalLink className="w-5 h-5" aria-hidden />
                </a>
                <button onClick={() => setViewer(null)} aria-label="Cerrar visor"
                  className="min-w-11 min-h-11 flex items-center justify-center text-gray-500 hover:text-gray-800 cursor-pointer transition-colors duration-200">
                  <X className="w-5 h-5" aria-hidden />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto flex items-center justify-center p-4">
              <img src={docUrl(viewer.file_path)} alt={`Boleta ${viewer.title}`} className="max-w-full rounded-xl" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
