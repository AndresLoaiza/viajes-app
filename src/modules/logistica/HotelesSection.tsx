import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BedDouble, MapPin, MoveRight, Pencil, Trash2, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useTable } from '../../lib/realtime';
import { formatShortEs, isUnpaid, mapsUrl } from '../../lib/logistica';
import type { Hotel, TravelerId, TripConfig } from '../../types/trip';
import {
  ConfirmChip, EmptyHint, ErrorAlert, Field, inputCls, NoteText, SectionHeader, UnpaidBadge,
} from './shared';

const EMPTY_FORM = {
  name: '', city_id: '', address: '', check_in: '', check_out: '',
  confirmation: '', note: '',
};

export default function HotelesSection({ trip, identity }: {
  trip: TripConfig;
  identity: TravelerId;
}) {
  const { rows, loading, apply } = useTable<Hotel>('hotels', trip.id);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  const hotels = [...rows].sort((a, b) => a.check_in.localeCompare(b.check_in));
  const valid = form.name.trim() && form.city_id && form.check_in && form.check_out;

  const set = (k: keyof typeof EMPTY_FORM) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  function openNew() {
    setForm({ ...EMPTY_FORM, city_id: trip.cities[0]?.id ?? '' });
    setEditingId(null);
    setShowForm(true);
    setErrMsg('');
  }

  function openEdit(h: Hotel) {
    setForm({
      name: h.name, city_id: h.city_id, address: h.address ?? '',
      check_in: h.check_in, check_out: h.check_out,
      confirmation: h.confirmation ?? '', note: h.note ?? '',
    });
    setEditingId(h.id);
    setShowForm(true);
    setErrMsg('');
  }

  async function save() {
    if (!valid || saving) return;
    setSaving(true);
    setErrMsg('');
    const payload = {
      name: form.name.trim(),
      city_id: form.city_id,
      address: form.address.trim() || null,
      check_in: form.check_in,
      check_out: form.check_out,
      confirmation: form.confirmation.trim() || null,
      note: form.note.trim() || null,
    };
    const q = editingId
      ? supabase.from('hotels').update(payload).eq('id', editingId).select().single()
      : supabase.from('hotels').insert({ ...payload, trip_id: trip.id, created_by: identity }).select().single();
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
    if (!confirm('¿Borrar este hotel?')) return;
    const { error } = await supabase.from('hotels').delete().eq('id', id);
    if (error) {
      setErrMsg('No se pudo borrar. Revisa tu conexión e intenta de nuevo.');
      return;
    }
    apply({ eventType: 'DELETE', new: {}, old: { id } });
  }

  return (
    <section aria-label="Hoteles">
      <SectionHeader icon={<BedDouble className="w-5 h-5 text-brasil-green" aria-hidden />} title="Hoteles" count={hotels.length} onAdd={openNew} />
      <ErrorAlert msg={errMsg} />

      <div className="mt-3 space-y-2">
        {loading && <p className="text-sm text-gray-400">Cargando…</p>}
        {!loading && hotels.length === 0 && (
          <EmptyHint>Sin hoteles aún. Toca + para agregar el primero.</EmptyHint>
        )}
        <AnimatePresence initial={false}>
          {hotels.map((h) => {
            const city = trip.cities.find((c) => c.id === h.city_id);
            return (
              <motion.div
                key={h.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="rounded-2xl bg-white border border-sand-dark p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-display font-bold text-gray-800">{h.name}</p>
                    {city && <p className="text-xs text-gray-500">{city.flag} {city.name}</p>}
                  </div>
                  {isUnpaid(h.note) && <UnpaidBadge />}
                </div>
                <div className="flex items-center gap-2 mt-2 text-sm font-semibold text-gray-600">
                  <span>{formatShortEs(h.check_in)}</span>
                  <MoveRight className="w-4 h-4 text-gray-300" aria-hidden />
                  <span>{formatShortEs(h.check_out)}</span>
                </div>
                {h.address && (
                  <a href={mapsUrl(h.address)} target="_blank" rel="noopener noreferrer"
                    className="flex items-start gap-1.5 mt-2 text-sm text-brasil-blue">
                    <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden />
                    <span className="underline underline-offset-2">{h.address}</span>
                  </a>
                )}
                {h.confirmation && <div className="mt-2"><ConfirmChip value={h.confirmation} /></div>}
                {h.note && <div className="mt-2"><NoteText text={h.note} /></div>}
                <div className="flex justify-end gap-1 mt-1">
                  <button onClick={() => openEdit(h)} aria-label={`Editar ${h.name}`}
                    className="min-w-11 min-h-11 flex items-center justify-center text-gray-300 hover:text-brasil-blue cursor-pointer transition-colors duration-200">
                    <Pencil className="w-4 h-4" aria-hidden />
                  </button>
                  <button onClick={() => remove(h.id)} aria-label={`Borrar ${h.name}`}
                    className="min-w-11 min-h-11 flex items-center justify-center text-gray-300 hover:text-red-400 cursor-pointer transition-colors duration-200">
                    <Trash2 className="w-4 h-4" aria-hidden />
                  </button>
                </div>
              </motion.div>
            );
          })}
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
                <p className="font-display font-bold text-gray-800">{editingId ? 'Editar hotel' : 'Nuevo hotel'}</p>
                <button onClick={() => setShowForm(false)} aria-label="Cerrar formulario"
                  className="min-w-11 min-h-11 -m-2 flex items-center justify-center text-gray-400 cursor-pointer">
                  <X className="w-4 h-4" aria-hidden />
                </button>
              </div>
              <div className="flex gap-2">
                <Field id="ho-name" label="Nombre *">
                  <input id="ho-name" type="text" value={form.name} onChange={set('name')} className={inputCls} />
                </Field>
                <Field id="ho-city" label="Ciudad *">
                  <select id="ho-city" value={form.city_id} onChange={set('city_id')} className={inputCls}>
                    {trip.cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </Field>
              </div>
              <div className="flex gap-2">
                <Field id="ho-in" label="Check-in *">
                  <input id="ho-in" type="date" value={form.check_in} onChange={set('check_in')} className={inputCls} />
                </Field>
                <Field id="ho-out" label="Check-out *">
                  <input id="ho-out" type="date" value={form.check_out} onChange={set('check_out')} className={inputCls} />
                </Field>
              </div>
              <Field id="ho-addr" label="Dirección">
                <input id="ho-addr" type="text" value={form.address} onChange={set('address')} className={inputCls} />
              </Field>
              <div className="flex gap-2">
                <Field id="ho-conf" label="Confirmación / PIN">
                  <input id="ho-conf" type="text" value={form.confirmation} onChange={set('confirmation')} className={inputCls} />
                </Field>
                <Field id="ho-note" label="Nota">
                  <input id="ho-note" type="text" value={form.note} onChange={set('note')} placeholder="Precio, plataforma, pago…" className={inputCls} />
                </Field>
              </div>
              <button onClick={save} disabled={!valid || saving}
                className="w-full min-h-11 rounded-xl font-display font-bold text-white bg-brasil-green disabled:opacity-50 cursor-pointer transition-opacity duration-200 hover:opacity-90">
                {saving ? 'Guardando…' : editingId ? 'Guardar cambios' : 'Agregar hotel'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
