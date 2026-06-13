import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ListChecks, StickyNote, Plus, Trash2, Check, Pencil, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useTable } from '../../lib/realtime';
import { formatDayEs } from '../../lib/dates';
import type { TripConfig, TravelerId, ChecklistItem, Note } from '../../types/trip';

const SECTIONS = [
  { id: 'equipaje', label: 'Equipaje', emoji: '🧳' },
  { id: 'tramites', label: 'Trámites', emoji: '📄' },
  { id: 'compras', label: 'Compras', emoji: '🛒' },
  { id: 'otros', label: 'Otros', emoji: '✅' },
] as const;
const SECTION = Object.fromEntries(SECTIONS.map((s) => [s.id, s]));
const sectionOf = (cat: string | null) => (cat && SECTION[cat] ? cat : 'otros');

const travelerName = (t: TravelerId) => (t === 'andres' ? 'Andrés' : 'Melisa');
const dayOf = (iso: string) => formatDayEs(iso.slice(0, 10));

export default function PendientesModule({ trip, identity }: {
  trip: TripConfig;
  identity: TravelerId;
}) {
  const [tab, setTab] = useState<'checklist' | 'notas'>('checklist');
  const [errMsg, setErrMsg] = useState('');

  return (
    <div className="max-w-xl mx-auto px-5 py-5">
      <div className="flex gap-2 mb-4" role="tablist" aria-label="Pendientes">
        {([['checklist', 'Checklist', ListChecks], ['notas', 'Notas', StickyNote]] as const).map(
          ([key, label, Icon]) => {
            const sel = tab === key;
            return (
              <button
                key={key} role="tab" aria-selected={sel}
                onClick={() => { setTab(key); setErrMsg(''); }}
                className={`flex-1 min-h-11 rounded-2xl px-2 font-display font-bold text-sm inline-flex items-center justify-center gap-2 cursor-pointer transition-colors duration-200 border-2
                  ${sel ? 'bg-brasil-green border-brasil-green text-white' : 'bg-white border-sand-dark text-gray-600'}`}
              >
                <Icon className="w-4 h-4" aria-hidden /> {label}
              </button>
            );
          },
        )}
      </div>

      {errMsg && (
        <div role="alert" className="mb-3 rounded-xl bg-red-50 text-red-700 text-sm font-semibold px-3 py-2">
          {errMsg}
        </div>
      )}

      {tab === 'checklist'
        ? <Checklist trip={trip} identity={identity} onError={setErrMsg} />
        : <Notas trip={trip} identity={identity} onError={setErrMsg} />}
    </div>
  );
}

// ── Checklist ────────────────────────────────────────────────────────────────
function Checklist({ trip, identity, onError }: {
  trip: TripConfig; identity: TravelerId; onError: (m: string) => void;
}) {
  const { rows, apply } = useTable<ChecklistItem>('checklist_items', trip.id);
  const [text, setText] = useState('');
  const [cat, setCat] = useState<string>('equipaje');
  const [busy, setBusy] = useState(false);

  const bySection = useMemo(() => {
    const map: Record<string, ChecklistItem[]> = {};
    for (const it of rows) {
      const k = sectionOf(it.category);
      (map[k] ??= []).push(it);
    }
    // pendientes primero, hechos al fondo; dentro por created_at
    for (const k of Object.keys(map)) {
      map[k].sort((a, b) =>
        Number(a.done) - Number(b.done) || a.created_at.localeCompare(b.created_at));
    }
    return map;
  }, [rows]);

  async function add() {
    const t = text.trim();
    if (!t || busy) return;
    setBusy(true); onError('');
    const { data, error } = await supabase.from('checklist_items').insert({
      trip_id: trip.id, text: t, done: false, category: cat, created_by: identity,
    }).select().single();
    setBusy(false);
    if (error) { onError('No se pudo agregar. Revisa tu conexión.'); return; }
    if (data) { apply({ eventType: 'INSERT', new: data, old: {} }); setText(''); }
  }

  async function toggle(it: ChecklistItem) {
    const { data, error } = await supabase.from('checklist_items')
      .update({ done: !it.done }).eq('id', it.id).select().single();
    if (error) { onError('No se pudo actualizar.'); return; }
    if (data) apply({ eventType: 'UPDATE', new: data, old: {} });
  }

  async function remove(it: ChecklistItem) {
    const { error } = await supabase.from('checklist_items').delete().eq('id', it.id);
    if (error) { onError('No se pudo borrar.'); return; }
    apply({ eventType: 'DELETE', new: {}, old: { id: it.id } });
  }

  return (
    <>
      <div className="flex gap-2 mb-4">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          placeholder="Agregar algo a la lista…"
          aria-label="Nuevo pendiente"
          className="flex-1 min-w-0 rounded-xl border-2 border-sand-dark px-3 py-2.5 text-sm outline-none focus:border-brasil-green transition-colors duration-200"
        />
        <select
          value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Sección"
          className="rounded-xl border-2 border-sand-dark px-2 text-sm bg-white cursor-pointer"
        >
          {SECTIONS.map((s) => <option key={s.id} value={s.id}>{s.emoji} {s.label}</option>)}
        </select>
        <button
          onClick={add} disabled={busy || !text.trim()} aria-label="Agregar"
          className="shrink-0 rounded-xl bg-brasil-green text-white px-3 disabled:opacity-50 cursor-pointer transition-opacity duration-200"
        >
          <Plus className="w-5 h-5" aria-hidden />
        </button>
      </div>

      {rows.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-sand-dark p-8 text-center text-gray-400">
          <ListChecks className="w-7 h-7 mx-auto mb-2 opacity-50" aria-hidden />
          <p className="font-semibold text-sm">Aún no hay pendientes</p>
        </div>
      )}

      {SECTIONS.filter((s) => bySection[s.id]?.length).map((s) => {
        const items = bySection[s.id];
        const done = items.filter((i) => i.done).length;
        return (
          <section key={s.id} className="mb-5">
            <h3 className="font-display font-bold text-gray-700 flex items-center gap-2 mb-2">
              <span aria-hidden>{s.emoji}</span> {s.label}
              <span className="text-xs font-sans font-semibold text-gray-400">{done}/{items.length}</span>
            </h3>
            <ul className="space-y-1.5">
              <AnimatePresence initial={false}>
                {items.map((it) => (
                  <motion.li
                    key={it.id} layout
                    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-3 rounded-xl bg-white border border-sand-dark px-3 py-2.5"
                  >
                    <button
                      onClick={() => toggle(it)}
                      aria-label={it.done ? 'Marcar como pendiente' : 'Marcar como hecho'}
                      className={`shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center cursor-pointer transition-colors duration-200
                        ${it.done ? 'bg-brasil-green border-brasil-green text-white' : 'border-gray-300 text-transparent'}`}
                    >
                      <Check className="w-4 h-4" aria-hidden />
                    </button>
                    <span className={`flex-1 text-sm ${it.done ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                      {it.text}
                    </span>
                    <button
                      onClick={() => remove(it)} aria-label="Borrar"
                      className="shrink-0 text-gray-300 hover:text-red-500 cursor-pointer transition-colors duration-200"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden />
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </section>
        );
      })}
    </>
  );
}

// ── Notas ────────────────────────────────────────────────────────────────────
function Notas({ trip, identity, onError }: {
  trip: TripConfig; identity: TravelerId; onError: (m: string) => void;
}) {
  const { rows, apply } = useTable<Note>('notes', trip.id);
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  const notes = useMemo(
    () => [...rows].sort((a, b) => b.created_at.localeCompare(a.created_at)),
    [rows],
  );

  async function add() {
    const t = body.trim();
    if (!t || busy) return;
    setBusy(true); onError('');
    const { data, error } = await supabase.from('notes').insert({
      trip_id: trip.id, body: t, created_by: identity,
    }).select().single();
    setBusy(false);
    if (error) { onError('No se pudo guardar la nota.'); return; }
    if (data) { apply({ eventType: 'INSERT', new: data, old: {} }); setBody(''); }
  }

  async function saveEdit(n: Note) {
    const t = draft.trim();
    if (!t) return;
    const { data, error } = await supabase.from('notes')
      .update({ body: t }).eq('id', n.id).select().single();
    if (error) { onError('No se pudo guardar.'); return; }
    if (data) { apply({ eventType: 'UPDATE', new: data, old: {} }); setEditId(null); }
  }

  async function remove(n: Note) {
    const { error } = await supabase.from('notes').delete().eq('id', n.id);
    if (error) { onError('No se pudo borrar.'); return; }
    apply({ eventType: 'DELETE', new: {}, old: { id: n.id } });
    if (editId === n.id) setEditId(null);
  }

  return (
    <>
      <div className="mb-4">
        <textarea
          value={body} onChange={(e) => setBody(e.target.value)}
          placeholder="Escribe una nota para compartir…"
          aria-label="Nueva nota" rows={3}
          className="w-full rounded-xl border-2 border-sand-dark px-3 py-2.5 text-sm outline-none focus:border-brasil-green transition-colors duration-200 resize-y"
        />
        <button
          onClick={add} disabled={busy || !body.trim()}
          className="mt-2 inline-flex items-center gap-2 rounded-xl bg-brasil-green text-white font-display font-bold text-sm px-4 py-2 disabled:opacity-50 cursor-pointer transition-opacity duration-200"
        >
          <Plus className="w-4 h-4" aria-hidden /> Agregar nota
        </button>
      </div>

      {notes.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-sand-dark p-8 text-center text-gray-400">
          <StickyNote className="w-7 h-7 mx-auto mb-2 opacity-50" aria-hidden />
          <p className="font-semibold text-sm">Aún no hay notas</p>
        </div>
      )}

      <div className="space-y-2.5">
        <AnimatePresence initial={false}>
          {notes.map((n) => (
            <motion.div
              key={n.id} layout
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="rounded-2xl bg-white border border-sand-dark px-4 py-3"
            >
              {editId === n.id ? (
                <>
                  <textarea
                    value={draft} onChange={(e) => setDraft(e.target.value)} rows={3} aria-label="Editar nota"
                    className="w-full rounded-xl border-2 border-brasil-green px-3 py-2 text-sm outline-none resize-y"
                  />
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => saveEdit(n)} disabled={!draft.trim()}
                      className="rounded-lg bg-brasil-green text-white text-sm font-bold px-3 py-1.5 disabled:opacity-50 cursor-pointer">
                      Guardar
                    </button>
                    <button onClick={() => setEditId(null)}
                      className="rounded-lg text-gray-500 text-sm font-semibold px-3 py-1.5 cursor-pointer inline-flex items-center gap-1">
                      <X className="w-4 h-4" aria-hidden /> Cancelar
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">{n.body}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400 font-semibold">
                      {travelerName(n.created_by)} · {dayOf(n.created_at)}
                    </span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setEditId(n.id); setDraft(n.body); }} aria-label="Editar nota"
                        className="min-w-9 min-h-9 flex items-center justify-center text-gray-300 hover:text-brasil-green cursor-pointer transition-colors duration-200">
                        <Pencil className="w-4 h-4" aria-hidden />
                      </button>
                      <button onClick={() => remove(n)} aria-label="Borrar nota"
                        className="min-w-9 min-h-9 flex items-center justify-center text-gray-300 hover:text-red-500 cursor-pointer transition-colors duration-200">
                        <Trash2 className="w-4 h-4" aria-hidden />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
