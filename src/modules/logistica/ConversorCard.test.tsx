import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { Rates } from '../../lib/currency';

const RATES: Rates = {
  base: 'COP',
  rates: { COP: 1, BRL: 0.5, ARS: 2, USD: 0.25 },
  updated: '2026-06-17',
  fetchedAt: 1,
};
let ratesToReturn: Rates = RATES;

vi.mock('../../lib/currency', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../lib/currency')>();
  return { ...actual, fetchRates: () => Promise.resolve(ratesToReturn) };
});

import ConversorCard from './ConversorCard';

describe('ConversorCard', () => {
  beforeEach(() => { ratesToReturn = RATES; });

  it('convierte 100 BRL→COP usando las tasas cargadas', async () => {
    render(<ConversorCard />);
    // 100 BRL → COP = (100/0.5)*1 = 200
    expect(await screen.findByText('$200')).toBeInTheDocument();
  });

  it('input descarta caracteres no numéricos', () => {
    render(<ConversorCard />);
    const input = screen.getByLabelText('Monto') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '12a3' } });
    expect(input.value).toBe('123');
  });

  it('invertir monedas recalcula en sentido opuesto', async () => {
    render(<ConversorCard />);
    await screen.findByText('$200'); // BRL→COP listo
    fireEvent.click(screen.getByRole('button', { name: 'Invertir monedas' }));
    // ahora COP→BRL: (100/1)*0.5 = 50 → "R$50,00"
    expect(await screen.findByText('R$50,00')).toBeInTheDocument();
  });

  it('tasas sin conexión (fetchedAt 0) → etiqueta aproximada', async () => {
    ratesToReturn = { ...RATES, fetchedAt: 0 };
    render(<ConversorCard />);
    expect(await screen.findByText(/Tasa aproximada \(sin conexión\)/)).toBeInTheDocument();
  });
});
