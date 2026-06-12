import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoveRight, Pencil, Plane, Trash2, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useTable } from '../../lib/realtime';
import { tsDate, tsTime, formatShortEs } from '../../lib/logistica';
import type { Flight, TravelerId, TripConfig } from '../../types/trip';
import {
  ConfirmChip, EmptyHint, ErrorAlert, Field, inputCls, NoteText, SectionHeader,
} from './shared';

const EMPTY_FORM = {
  airline: '', from_city: '', to_city: '', date: '', dep: '', arr: '',
  confirmation: '', note: '',
};

export default function VuelosSection({ trip, identity }: {
  trip: TripConfig;
  identity: TravelerId;
}) {
  const { rows, loading, apply } = useTable<Flight>('flights', trip.id);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  const flights = [...rows].sort((a, b) => a.departs_at.localeCompare(b.departs_at));
  const valid = form.airline.trim() && form.from_city.trim() && form.to_city.trim()
    && form.date && form.dep;

  const set = (k: keyof typeof EMPTY_FORM) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  function openNew() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
    setErrMsg('');
  }

  function openEdit(f: Flight) {
    setForm({
      airline: f.airline, from_city: f.from_city, to_city: f.to_city,
      date: tsDate(f.departs_at), dep: tsTime(f.departs_at),
      arr: f.arrives_at ? tsTime(f.arrives_at) : '',
      confirmation: f.confirmation ?? '', note: f.note ?? '',
    });
    setEditingId(f.id);
    setShowForm(true);
    setErrMsg('');
  }

  async function save() {
    if (!valid || saving) return;
    setSaving(true);
    setErrMsg('');
    // Hora local del aeropuerto como UTC ficticio (ver types/trip.ts)
    const payload = {
      airline: form.airline.trim(),
      from_city: form.from_city.trim(),
      to_city: form.to_city.trim(),
      departs_at: `${form.date}T${form.dep}:00Z`,
      arrives_at: form.arr ? `${form.date}T${form.arr}:00Z` : null,
      confirmation: form.confirmation.trim() || null,
      note: form.note.trim() || null,
    };
    const q = editingId
      ? supabase.from('flights').update(payload).eq('id', editingId).select().single()
      : supabase.from('flights').insert({ ...payload, trip_id: trip.id, created_by: identity }).select().single();
    const { data, error } = await q;
    setSaving(false);
    if (error) {
      setErrMsg('No se pudo guardar. Revisa tu conexión e intenta de nuevo.');
      return;
    }
    if (data) apply({ eventType: editingId ? 'UPDATE' : 'INSERT', new: data, old: {} });
    setShowForm(false);
  }

  async function remove(id: string) {
    if (!confirm('¿Borrar este vuelo?')) return;
    const { error } = await supabase.from('flights').delete().eq('id', id);
    if (error) {
      setErrMsg('No se pudo borrar. Revisa tu conexión e intenta de nuevo.');
      return;
    }
    apply({ eventType: 'DELETE', new: {}, old: { id } });
  }

  return (
    <section aria-label="Vuelos">
      <SectionHeader icon={<Plane className="w-5 h-5 text-brasil-blue" aria-hidden />} title="Vuelos" count={flights.length} onAdd={openNew} />
      <ErrorAlert msg={errMsg} />

      <div className="mt-3 space-y-2">
        {loading && <p className="text-sm text-gray-400">Cargando…</p>}
        {!loading && flights.length === 0 && (
          <EmptyHint>Sin vuelos aún. Toca + para agregar el primero.</EmptyHint>
        )}
        <AnimatePresence initial={false}>
          {flights.map((f) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="rounded-2xl bg-white border border-sand-dark p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-lg bg-brasil-blue text-white text-xs font-bold px-2 py-1">
                  {f.airline}{f.flight_number ? ` ${f.flight_number}` : ''}
                </span>
                <span className="text-sm font-semibold text-gray-500">{formatShortEs(tsDate(f.departs_at))}</span>
              </div>
              <div className="flex items-center gap-3 mt-3">
                <div className="min-w-0">
                  <p className="font-display font-bold text-2xl text-gray-800 leading-none">{tsTime(f.departs_at)}</p>
                  <p className="text-xs text-gray-500 mt-1 truncate">{f.from_city}</p>
                </div>
                <MoveRight className="w-5 h-5 text-gray-300 flex-shrink-0" aria-hidden />
                <div className="min-w-0">
                  <p className="font-display font-bold text-2xl text-gray-800 leading-none">
                    {f.arrives_at ? tsTime(f.arrives_at) : '—'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 truncate">{f.to_city}</p>
                </div>
              </div>
              {f.confirmation && <div className="mt-3"><ConfirmChip value={f.confirmation} /></div>}
              {f.note && <div className="mt-2"><NoteText text={f.note} /></div>}
              <div className="flex justify-end gap-1 mt-1">
                <button onClick={() => openEdit(f)} aria-label={`Editar vuelo ${f.from_city} a ${f.to_city}`}
                  className="min-w-11 min-h-11 flex items-center justify-center text-gray-300 hover:text-brasil-blue cursor-pointer transition-colors duration-200">
                  <Pencil className="w-4 h-4" aria-hidden />
                </button>
                <button onClick={() => remove(f.id)} aria-label={`Borrar vuelo ${f.from_city} a ${f.to_city}`}
                  className="min-w-11 min-h-11 flex items-center justify-center text-gray-300 hover:text-red-400 cursor-pointer transition-colors duration-200">
                  <Trash2 className="w-4 h-4" aria-hidden />
                </button>
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
                <p className="font-display font-bold text-gray-800">{editingId ? 'Editar vuelo' : 'Nuevo vuelo'}</p>
                <button onClick={() => setShowForm(false)} aria-label="Cerrar formulario"
                  className="min-w-11 min-h-11 -m-2 flex items-center justify-center text-gray-400 cursor-pointer">
                  <X className="w-4 h-4" aria-hidden />
                </button>
              </div>
              <div className="flex gap-2">
                <Field id="fl-from" label="Origen *">
                  <input id="fl-from" type="text" value={form.from_city} onChange={set('from_city')} className={inputCls} />
                </Field>
                <Field id="fl-to" label="Destino *">
                  <input id="fl-to" type="text" value={form.to_city} onChange={set('to_city')} className={inputCls} />
                </Field>
              </div>
              <div className="flex gap-2">
                <Field id="fl-date" label="Fecha *">
                  <input id="fl-date" type="date" value={form.date} onChange={set('date')} className={inputCls} />
                </Field>
                <Field id="fl-dep" label="Sale *">
                  <input id="fl-dep" type="time" value={form.dep} onChange={set('dep')} className={inputCls} />
                </Field>
                <Field id="fl-arr" label="Llega">
                  <input id="fl-arr" type="time" value={form.arr} onChange={set('arr')} className={inputCls} />
                </Field>
              </div>
              <div className="flex gap-2">
                <Field id="fl-air" label="Aerolínea *">
                  <input id="fl-air" type="text" value={form.airline} onChange={set('airline')} placeholder="GOL, LATAM…" className={inputCls} />
                </Field>
                <Field id="fl-conf" label="Confirmación">
                  <input id="fl-conf" type="text" value={form.confirmation} onChange={set('confirmation')} className={inputCls} />
                </Field>
              </div>
              <Field id="fl-note" label="Nota">
                <input id="fl-note" type="text" value={form.note} onChange={set('note')} placeholder="Precio, equipaje, plataforma…" className={inputCls} />
              </Field>
              <button onClick={save} disabled={!valid || saving}
                className="w-full min-h-11 rounded-xl font-display font-bold text-white bg-brasil-green disabled:opacity-50 cursor-pointer transition-opacity duration-200 hover:opacity-90">
                {saving ? 'Guardando…' : editingId ? 'Guardar cambios' : 'Agregar vuelo'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
