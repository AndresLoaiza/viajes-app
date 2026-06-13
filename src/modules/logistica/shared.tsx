import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, Copy, Plus } from 'lucide-react';
import { splitUrls } from '../../lib/logistica';

export const inputCls =
  'block w-full rounded-xl border-2 border-sand-dark px-3 py-2 text-sm outline-none focus:border-brasil-green transition-colors duration-200';

export function Field({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div className="flex-1 min-w-0">
      <label htmlFor={id} className="text-xs font-semibold text-gray-500">{label}</label>
      {children}
    </div>
  );
}

/** Categoría plegable. El header alterna abrir/cerrar; el + agrega (y abre). */
export function Accordion({ icon, title, count, open, onToggle, onAdd, children }: {
  icon: ReactNode; title: string; count: number;
  open: boolean; onToggle: () => void; onAdd: () => void; children: ReactNode;
}) {
  return (
    <section className="mt-3 first:mt-0" aria-label={title}>
      <div className="flex items-center gap-1">
        <button
          onClick={onToggle}
          aria-expanded={open}
          className="flex-1 min-h-12 flex items-center gap-2 cursor-pointer text-left"
        >
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            aria-hidden
          />
          {icon}
          <span className="font-display font-bold text-lg text-gray-800">{title}</span>
          {count > 0 && <span className="text-sm font-semibold text-gray-400">({count})</span>}
        </button>
        <button
          onClick={onAdd}
          aria-label={`Agregar a ${title}`}
          className="min-w-11 min-h-11 flex items-center justify-center rounded-xl text-brasil-green cursor-pointer transition-colors duration-200 hover:bg-brasil-green/10"
        >
          <Plus className="w-5 h-5" aria-hidden />
        </button>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-1 pb-2 space-y-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/** Contenedor del formulario inline (mismo lugar de la card, sin generar otra abajo). */
export function EditCard({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="rounded-2xl bg-white border-2 border-brasil-green p-4 space-y-3"
    >
      {children}
    </motion.div>
  );
}

/** Botones Guardar / Cancelar del formulario inline. */
export function FormActions({ onCancel, onSave, saving, valid, isEdit }: {
  onCancel: () => void; onSave: () => void; saving: boolean; valid: boolean; isEdit: boolean;
}) {
  return (
    <div className="flex gap-2 pt-1">
      <button
        onClick={onCancel}
        className="min-h-11 px-4 rounded-xl font-display font-bold text-gray-500 cursor-pointer transition-colors duration-200 hover:bg-sand/60"
      >
        Cancelar
      </button>
      <button
        onClick={onSave}
        disabled={!valid || saving}
        className="flex-1 min-h-11 rounded-xl font-display font-bold text-white bg-brasil-green disabled:opacity-50 cursor-pointer transition-opacity duration-200 hover:opacity-90"
      >
        {saving ? 'Guardando…' : isEdit ? 'Guardar' : 'Agregar'}
      </button>
    </div>
  );
}

export function UnpaidBadge() {
  return (
    <span className="inline-flex items-center rounded-full bg-red-100 text-red-700 text-[11px] font-bold px-2 py-0.5 uppercase tracking-wide">
      Sin pagar
    </span>
  );
}

/** Nota con URLs clicables. */
export function NoteText({ text }: { text: string }) {
  return (
    <p className="text-sm text-gray-500 break-words">
      {splitUrls(text).map((p, i) =>
        p.type === 'url' ? (
          <a key={i} href={p.value} target="_blank" rel="noopener noreferrer"
            className="text-brasil-blue underline underline-offset-2">
            {p.value.replace(/^https?:\/\//, '')}
          </a>
        ) : (
          <span key={i}>{p.value}</span>
        ),
      )}
    </p>
  );
}

/** Chip de confirmación copiable al portapapeles. */
export function ConfirmChip({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard?.writeText(value).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        });
      }}
      aria-label={`Copiar confirmación ${value}`}
      className="inline-flex items-center gap-1.5 rounded-lg bg-sand/60 border border-sand-dark px-2 py-1 font-mono text-xs text-gray-700 cursor-pointer transition-colors duration-200 hover:bg-sand"
    >
      {value}
      {copied
        ? <Check className="w-3.5 h-3.5 text-brasil-green" aria-hidden />
        : <Copy className="w-3.5 h-3.5 text-gray-400" aria-hidden />}
    </button>
  );
}

export function EmptyHint({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-sand-dark p-5 text-center text-gray-400 text-sm mt-3">
      {children}
    </div>
  );
}

export function ErrorAlert({ msg }: { msg: string }) {
  if (!msg) return null;
  return (
    <div role="alert" className="mt-3 rounded-xl bg-red-50 text-red-700 text-sm font-semibold px-3 py-2">
      {msg}
    </div>
  );
}
