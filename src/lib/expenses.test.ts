import { describe, it, expect } from 'vitest';
import { summarize } from './expenses';
import type { Rates } from './currency';
import type { Expense } from '../types/trip';

const rates: Rates = {
  base: 'COP',
  rates: { COP: 1, BRL: 0.002, ARS: 0.4, USD: 0.00025 },
  updated: '', fetchedAt: 0,
};

const exp = (over: Partial<Expense>): Expense => ({
  id: Math.random().toString(36).slice(2),
  trip_id: 'brasil-2026',
  description: 'x',
  amount: 0,
  currency: 'COP',
  paid_by: 'andres',
  category: null,
  spent_on: null,
  created_by: 'andres',
  created_at: '2026-06-25T10:00:00Z',
  ...over,
});

describe('summarize', () => {
  it('total y pagado por persona en COP (multi-moneda)', () => {
    const s = summarize([
      exp({ amount: 100000, currency: 'COP', paid_by: 'andres' }),
      exp({ amount: 200, currency: 'BRL', paid_by: 'melisa' }), // 100000 COP
    ], rates);
    expect(s.totalCOP).toBeCloseTo(200000);
    expect(s.byPerson.andres).toBeCloseTo(100000);
    expect(s.byPerson.melisa).toBeCloseTo(100000);
  });

  it('iguales → sin deuda', () => {
    const s = summarize([
      exp({ amount: 100000, paid_by: 'andres' }),
      exp({ amount: 100000, paid_by: 'melisa' }),
    ], rates);
    expect(s.settle).toBeNull();
  });

  it('settle-up: el que puso menos le debe al otro la diferencia', () => {
    const s = summarize([
      exp({ amount: 150000, paid_by: 'andres' }),
      exp({ amount: 50000, paid_by: 'melisa' }),
    ], rates);
    // total 200k, share 100k, andres puso 50k de más
    expect(s.settle).toEqual({ from: 'melisa', to: 'andres', cop: 50000 });
  });

  it('settle-up al revés', () => {
    const s = summarize([
      exp({ amount: 20000, paid_by: 'andres' }),
      exp({ amount: 120000, paid_by: 'melisa' }),
    ], rates);
    // total 140k, share 70k, melisa puso 50k de más
    expect(s.settle).toEqual({ from: 'andres', to: 'melisa', cop: 50000 });
  });

  it('agrupa por categoría ordenado desc', () => {
    const s = summarize([
      exp({ amount: 30000, category: 'comida' }),
      exp({ amount: 50000, category: 'transporte' }),
      exp({ amount: 10000, category: 'comida' }),
    ], rates);
    expect(s.byCategory[0]).toEqual({ category: 'transporte', cop: 50000 });
    expect(s.byCategory[1]).toEqual({ category: 'comida', cop: 40000 });
  });

  it('categoría nula cae en "otros"', () => {
    const s = summarize([exp({ amount: 5000, category: null })], rates);
    expect(s.byCategory[0].category).toBe('otros');
  });

  it('lista vacía → ceros, sin deuda, sin categorías', () => {
    const s = summarize([], rates);
    expect(s.totalCOP).toBe(0);
    expect(s.byPerson).toEqual({ andres: 0, melisa: 0 });
    expect(s.byCategory).toEqual([]);
    expect(s.settle).toBeNull();
    expect(s.skipped).toBe(0);
  });

  it('cuenta los no convertibles (moneda sin tasa)', () => {
    const broken: Rates = { ...rates, rates: { ...rates.rates, ARS: 0 } };
    const s = summarize([
      exp({ amount: 1000, currency: 'ARS' }),
      exp({ amount: 5000, currency: 'COP' }),
    ], broken);
    expect(s.skipped).toBe(1);
    expect(s.totalCOP).toBeCloseTo(5000);
  });
});
