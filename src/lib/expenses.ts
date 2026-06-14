// Lógica pura de gastos compartidos (split 50/50, settle-up, totales).
// Sin React ni Supabase → fácil de testear.
import type { Expense, TravelerId } from '../types/trip';
import { toCOP, type Rates } from './currency';

export interface ExpenseSummary {
  totalCOP: number;
  byPerson: Record<TravelerId, number>;   // pagado por cada uno, en COP
  byCategory: { category: string; cop: number }[]; // desc por monto
  /** Quién le debe a quién para quedar 50/50. null si ya están iguales. */
  settle: { from: TravelerId; to: TravelerId; cop: number } | null;
  /** Gastos cuyo monto no se pudo convertir (moneda sin tasa). */
  skipped: number;
}

const OTHER = (t: TravelerId): TravelerId => (t === 'andres' ? 'melisa' : 'andres');

export function summarize(expenses: Expense[], rates: Rates): ExpenseSummary {
  const byPerson: Record<TravelerId, number> = { andres: 0, melisa: 0 };
  const cat = new Map<string, number>();
  let totalCOP = 0;
  let skipped = 0;

  for (const e of expenses) {
    const cop = toCOP(Number(e.amount), e.currency, rates);
    if (cop == null || !Number.isFinite(cop)) { skipped++; continue; }
    totalCOP += cop;
    byPerson[e.paid_by] = (byPerson[e.paid_by] ?? 0) + cop;
    const k = e.category || 'otros';
    cat.set(k, (cat.get(k) ?? 0) + cop);
  }

  const byCategory = [...cat.entries()]
    .map(([category, cop]) => ({ category, cop }))
    .sort((a, b) => b.cop - a.cop);

  // Split 50/50: cada uno debería poner la mitad del total.
  const share = totalCOP / 2;
  const balAndres = byPerson.andres - share; // >0 puso de más → le deben
  let settle: ExpenseSummary['settle'] = null;
  if (Math.round(balAndres) !== 0) {
    const creditor: TravelerId = balAndres > 0 ? 'andres' : 'melisa';
    settle = { from: OTHER(creditor), to: creditor, cop: Math.abs(balAndres) };
  }

  return { totalCOP, byPerson, byCategory, settle, skipped };
}
