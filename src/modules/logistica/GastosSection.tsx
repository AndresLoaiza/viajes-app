import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, PiggyBank, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useTable } from '../../lib/realtime';
import { formatShortEs } from '../../lib/logistica';
import { CURRENCIES, fetchRates, formatMoney, type Currency, type Rates } from '../../lib/currency';
import { summarize } from '../../lib/expenses';
import type { Expense, TravelerId, TripConfig } from '../../types/trip';
import {
  Accordion, EditCard, EmptyHint, ErrorAlert, Field, FormActions, inputCls,
} from './shared';

const CATEGORIES = [
  { id: 'comida', label: 'Comida', emoji: '🍽️' },
  { id: 'transporte', label: 'Transporte', emoji: '🚕' },
  { id: 'alojamiento', label: 'Alojamiento', emoji: '🏨' },
  { id: 'actividades', label: 'Actividades', emoji: '🎢' },
  { id: 'compras', label: 'Compras', emoji: '🛍️' },
  { id: 'otros', label: 'Otros', emoji: '💸' },
];
const CAT = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));
const travelerName = (t: TravelerId) => (t === 'andres' ? 'Andrés' : 'Melisa');

const EMPTY_FORM = {
  description: '', amount: '', currency: 'BRL' as Currency,
  paid_by: 'andres' as TravelerId, category: 'comida', spent_on: '',
};

/** Gastos compartidos: agregar, convertir a COP, totales y settle-up 50/50. */
export default function GastosSection({ trip, identity }: {
  trip: TripConfig;
  identity: TravelerId;
}) {
  const { rows, loading, apply } = useTable<Expense>('expenses', trip.id);
  const [rates, setRates] = useState<Rates | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  useEffect(() => { fetchRates().then(setRates).catch(() => {}); }, []);

  const expenses = [...rows].sort((a, b) =>
    `${b.spent_on ?? ''}`.localeCompare(`${a.spent_on ?? ''}`) || b.created_at.localeCompare(a.created_at));
  const summary = useMemo(() => (rates ? summarize(expenses, rates) : null), [expenses, rates]);

  const valid = form.description.trim() && parseFloat(form.amount.replace(',', '.')) > 0;

  const set = (k: keyof typeof EMPTY_FORM) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  function openNew() {
    setForm(EMPTY_FORM); setEditingId(null); setShowForm(true); setOpen(true); setErrMsg('');
  }
  function openEdit(x: Expense) {
    setForm({
      description: x.description, amount: String(x.amount), currency: x.currency,
      paid_by: x.paid_by, category: x.category ?? 'otros', spent_on: x.spent_on ?? '',
    });
    setEditingId(x.id); setShowForm(true); setOpen(true); setErrMsg('');
  }
  function cancel() { setShowForm(false); setEditingId(null); setErrMsg(''); }

  async function save() {
    if (!valid || saving) return;
    setSaving(true); setErrMsg('');
    const payload = {
      description: form.description.trim(),
      amount: parseFloat(form.amount.replace(',', '.')),
      currency: form.currency,
      paid_by: form.paid_by,
      category: form.category,
      spent_on: form.spent_on || null,
    };
    const q = editingId
      ? supabase.from('expenses').update(payload).eq('id', editingId).select().single()
      : supabase.from('expenses').insert({ ...payload, trip_id: trip.id, created_by: identity }).select().single();
    const { data, error } = await q;
    setSaving(false);
    if (error) { setErrMsg('No se pudo guardar. Revisa tu conexión e intenta de nuevo.'); return; }
    if (data) apply({ eventType: editingId ? 'UPDATE' : 'INSERT', new: data, old: {} });
    setShowForm(false); setEditingId(null);
  }

  async function remove(id: string) {
    if (!confirm('¿Borrar este gasto?')) return;
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) { setErrMsg('No se pudo borrar. Revisa tu conexión e intenta de nuevo.'); return; }
    apply({ eventType: 'DELETE', new: {}, old: { id } });
  }

  function renderForm() {
    return (
      <EditCard>
        <Field id="gx-desc" label="Descripción *">
          <input id="gx-desc" type="text" value={form.description} onChange={set('description')} placeholder="Almuerzo, taxi, souvenirs…" className={inputCls} />
        </Field>
        <div className="flex gap-2">
          <Field id="gx-amount" label="Monto *">
            <input id="gx-amount" type="text" inputMode="decimal" value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value.replace(/[^\d.,]/g, '') }))}
              className={inputCls} />
          </Field>
          <Field id="gx-cur" label="Moneda">
            <select id="gx-cur" value={form.currency} onChange={set('currency')} className={inputCls}>
              {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
            </select>
          </Field>
        </div>
        <div className="flex gap-2">
          <Field id="gx-by" label="Pagó">
            <select id="gx-by" value={form.paid_by} onChange={set('paid_by')} className={inputCls}>
              <option value="andres">Andrés</option>
              <option value="melisa">Melisa</option>
            </select>
          </Field>
          <Field id="gx-cat" label="Categoría">
            <select id="gx-cat" value={form.category} onChange={set('category')} className={inputCls}>
              {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
            </select>
          </Field>
        </div>
        <Field id="gx-date" label="Fecha">
          <input id="gx-date" type="date" value={form.spent_on} onChange={set('spent_on')} className={inputCls} />
        </Field>
        <FormActions onCancel={cancel} onSave={save} saving={saving} valid={!!valid} isEdit={!!editingId} />
      </EditCard>
    );
  }

  return (
    <Accordion
      icon={<PiggyBank className="w-5 h-5 text-brasil-green" aria-hidden />}
      title="Gastos" count={expenses.length}
      open={open} onToggle={() => setOpen((o) => !o)} onAdd={openNew}
    >
      <ErrorAlert msg={errMsg} />

      {summary && expenses.length > 0 && (
        <div className="rounded-2xl bg-brasil-green/5 border border-brasil-green/30 p-4 mb-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total del viaje</p>
          <p className="font-display font-black text-2xl text-gray-800">{formatMoney(summary.totalCOP, 'COP')}</p>
          <div className="flex gap-4 mt-2 text-sm">
            <span className="text-gray-600">Andrés <b className="text-gray-800">{formatMoney(summary.byPerson.andres, 'COP')}</b></span>
            <span className="text-gray-600">Melisa <b className="text-gray-800">{formatMoney(summary.byPerson.melisa, 'COP')}</b></span>
          </div>
          {summary.settle ? (
            <p className="mt-2 rounded-xl bg-brasil-yellow/25 text-amber-800 text-sm font-bold px-3 py-2">
              {travelerName(summary.settle.from)} le debe a {travelerName(summary.settle.to)} {formatMoney(summary.settle.cop, 'COP')}
            </p>
          ) : (
            <p className="mt-2 text-sm font-semibold text-brasil-green">Están a mano ✅</p>
          )}
          {summary.byCategory.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {summary.byCategory.map((c) => (
                <span key={c.category} className="inline-flex items-center gap-1 rounded-full bg-white border border-sand-dark px-2 py-1 text-xs text-gray-600">
                  {CAT[c.category]?.emoji ?? '💸'} {CAT[c.category]?.label ?? c.category} · {formatMoney(c.cop, 'COP')}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {showForm && !editingId && renderForm()}
      {loading && <p className="text-sm text-gray-400">Cargando…</p>}
      {!loading && expenses.length === 0 && !showForm && (
        <EmptyHint>Sin gastos aún. Toca + para registrar el primero.</EmptyHint>
      )}

      <AnimatePresence initial={false}>
        {expenses.map((x) => {
          if (editingId === x.id) return <div key={x.id}>{renderForm()}</div>;
          const copStr = rates ? formatMoney((Number(x.amount) / rates.rates[x.currency]) * 1, 'COP') : null;
          return (
            <motion.div
              key={x.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="rounded-2xl bg-white border border-sand-dark p-4 flex items-start gap-3"
            >
              <span className="text-2xl flex-shrink-0" aria-hidden>{CAT[x.category ?? 'otros']?.emoji ?? '💸'}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800">{x.description}</p>
                <p className="text-sm text-gray-500">
                  {formatMoney(Number(x.amount), x.currency)}
                  {x.currency !== 'COP' && copStr ? ` · ${copStr}` : ''}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Pagó {travelerName(x.paid_by)}{x.spent_on ? ` · ${formatShortEs(x.spent_on)}` : ''}
                </p>
              </div>
              <div className="flex flex-col gap-0.5">
                <button onClick={() => openEdit(x)} aria-label={`Editar ${x.description}`}
                  className="min-w-9 min-h-9 flex items-center justify-center text-gray-300 hover:text-brasil-blue cursor-pointer transition-colors duration-200">
                  <Pencil className="w-4 h-4" aria-hidden />
                </button>
                <button onClick={() => remove(x.id)} aria-label={`Borrar ${x.description}`}
                  className="min-w-9 min-h-9 flex items-center justify-center text-gray-300 hover:text-red-400 cursor-pointer transition-colors duration-200">
                  <Trash2 className="w-4 h-4" aria-hidden />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </Accordion>
  );
}
