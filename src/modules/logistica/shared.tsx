import { useState, type ReactNode } from 'react';
import { Check, Copy, Plus } from 'lucide-react';
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

export function SectionHeader({ icon, title, count, onAdd }: {
  icon: ReactNode; title: string; count: number; onAdd: () => void;
}) {
  return (
    <div className="flex items-center justify-between mt-8 first:mt-0">
      <h2 className="font-display font-bold text-xl text-gray-800 flex items-center gap-2">
        {icon} {title}
        {count > 0 && <span className="text-sm font-sans font-semibold text-gray-400">({count})</span>}
      </h2>
      <button
        onClick={onAdd}
        aria-label={`Agregar a ${title}`}
        className="min-w-11 min-h-11 flex items-center justify-center rounded-xl text-brasil-green cursor-pointer transition-colors duration-200 hover:bg-brasil-green/10"
      >
        <Plus className="w-5 h-5" aria-hidden />
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
