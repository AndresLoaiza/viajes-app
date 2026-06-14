import { useEffect, useMemo, useState } from 'react';
import { ArrowLeftRight, RefreshCw } from 'lucide-react';
import {
  CURRENCIES, convert, fetchRates, formatMoney, type Currency, type Rates,
} from '../../lib/currency';

/** Conversor de moneda en vivo (COP/BRL/ARS/USD) para preparar el viaje. */
export default function ConversorCard() {
  const [rates, setRates] = useState<Rates | null>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('100');
  const [from, setFrom] = useState<Currency>('BRL');
  const [to, setTo] = useState<Currency>('COP');

  useEffect(() => {
    let alive = true;
    fetchRates()
      .then((r) => { if (alive) { setRates(r); setLoading(false); } })
      .catch(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const result = useMemo(() => {
    const n = parseFloat(amount.replace(',', '.'));
    if (!rates || !Number.isFinite(n)) return null;
    return convert(n, from, to, rates);
  }, [amount, from, to, rates]);

  function swap() { setFrom(to); setTo(from); }

  const sel = 'rounded-xl border-2 border-sand-dark bg-white px-2 py-2 text-sm font-semibold cursor-pointer';

  return (
    <div className="rounded-2xl bg-white border border-sand-dark p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <ArrowLeftRight className="w-5 h-5 text-brasil-blue" aria-hidden />
        <h2 className="font-display font-bold text-lg text-gray-800">Conversor</h2>
      </div>

      <div className="flex items-end gap-2">
        <div className="flex-1 min-w-0">
          <label htmlFor="cv-amount" className="text-xs font-semibold text-gray-500">Monto</label>
          <input
            id="cv-amount" type="text" inputMode="decimal" value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d.,]/g, ''))}
            className="block w-full rounded-xl border-2 border-sand-dark px-3 py-2 text-sm outline-none focus:border-brasil-green transition-colors duration-200"
          />
        </div>
        <select aria-label="De" value={from} onChange={(e) => setFrom(e.target.value as Currency)} className={sel}>
          {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
        </select>
      </div>

      <div className="flex justify-center my-1">
        <button onClick={swap} aria-label="Invertir monedas"
          className="min-w-9 min-h-9 flex items-center justify-center rounded-full text-brasil-blue hover:bg-brasil-blue/10 cursor-pointer transition-colors duration-200">
          <ArrowLeftRight className="w-4 h-4 rotate-90" aria-hidden />
        </button>
      </div>

      <div className="flex items-end gap-2">
        <div className="flex-1 min-w-0">
          <span className="text-xs font-semibold text-gray-500">Resultado</span>
          <div className="rounded-xl bg-sand/40 px-3 py-2 text-lg font-display font-bold text-gray-800 truncate">
            {loading ? '…' : result != null ? formatMoney(result, to) : '—'}
          </div>
        </div>
        <select aria-label="A" value={to} onChange={(e) => setTo(e.target.value as Currency)} className={sel}>
          {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
        </select>
      </div>

      {rates && (
        <p className="flex items-center gap-1 text-[11px] text-gray-400 mt-2">
          <RefreshCw className="w-3 h-3" aria-hidden />
          {rates.fetchedAt === 0 ? 'Tasa aproximada (sin conexión)' : `Tasas: ${rates.updated || 'hoy'}`}
        </p>
      )}
    </div>
  );
}
