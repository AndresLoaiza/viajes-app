// Conversión de moneda vía open.er-api.com (gratis, sin key). Base COP.
// Cache en sessionStorage (~6h). Usado por el conversor y por Gastos.

export type Currency = 'COP' | 'BRL' | 'ARS' | 'USD';

export const CURRENCIES: { code: Currency; label: string; flag: string; symbol: string }[] = [
  { code: 'COP', label: 'Peso colombiano', flag: '🇨🇴', symbol: '$' },
  { code: 'BRL', label: 'Real brasileño', flag: '🇧🇷', symbol: 'R$' },
  { code: 'ARS', label: 'Peso argentino', flag: '🇦🇷', symbol: '$' },
  { code: 'USD', label: 'Dólar', flag: '🇺🇸', symbol: 'US$' },
];

export interface Rates {
  base: 'COP';
  /** rates[X] = cuántos X equivale 1 COP (ej. rates.BRL ≈ 0.00146). */
  rates: Record<Currency, number>;
  updated: string; // ISO o texto de la API
  fetchedAt: number;
}

const KEY = 'fx-rates-cop';
const TTL = 6 * 60 * 60 * 1000;

/** Tasas hardcoded de respaldo (≈jun 2026) si la API falla y no hay cache. */
const FALLBACK: Rates = {
  base: 'COP',
  rates: { COP: 1, BRL: 0.00146, ARS: 0.40305, USD: 0.000282 },
  updated: 'aprox.',
  fetchedAt: 0,
};

export async function fetchRates(): Promise<Rates> {
  try {
    const hit = sessionStorage.getItem(KEY);
    if (hit) {
      const r = JSON.parse(hit) as Rates;
      if (Date.now() - r.fetchedAt < TTL) return r;
    }
  } catch { /* sin storage → seguir */ }

  try {
    const res = await fetch('https://open.er-api.com/v6/latest/COP');
    if (!res.ok) throw new Error(`er-api ${res.status}`);
    const j = await res.json();
    if (j.result !== 'success') throw new Error('er-api sin éxito');
    const data: Rates = {
      base: 'COP',
      rates: {
        COP: 1,
        BRL: j.rates.BRL,
        ARS: j.rates.ARS,
        USD: j.rates.USD,
      },
      updated: j.time_last_update_utc ?? '',
      fetchedAt: Date.now(),
    };
    try { sessionStorage.setItem(KEY, JSON.stringify(data)); } catch { /* ignore */ }
    return data;
  } catch {
    return FALLBACK;
  }
}

/** Convierte `amount` de `from` a `to` usando tasas base-COP. Devuelve null si falta tasa. */
export function convert(amount: number, from: Currency, to: Currency, rates: Rates): number | null {
  const rFrom = rates.rates[from];
  const rTo = rates.rates[to];
  if (!rFrom || !rTo) return null;
  // amount(from) → COP = amount / rFrom; COP → to = * rTo
  return (amount / rFrom) * rTo;
}

/** Convierte a COP (base). */
export function toCOP(amount: number, from: Currency, rates: Rates): number | null {
  return convert(amount, from, 'COP', rates);
}

/** Formatea un monto en su moneda, sin decimales para COP/ARS, 2 para BRL/USD. */
export function formatMoney(amount: number, currency: Currency): string {
  const decimals = currency === 'COP' || currency === 'ARS' ? 0 : 2;
  const sym = CURRENCIES.find((c) => c.code === currency)?.symbol ?? '';
  const n = amount.toLocaleString('es-CO', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${sym}${n}`;
}
