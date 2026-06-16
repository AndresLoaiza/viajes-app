import { describe, it, expect } from 'vitest';
import { convert, toCOP, formatMoney, type Rates } from './currency';

const rates: Rates = {
  base: 'COP',
  rates: { COP: 1, BRL: 0.002, ARS: 0.4, USD: 0.00025 },
  updated: '', fetchedAt: 0,
};
// 1 BRL = 500 COP · 1 ARS = 2.5 COP · 1 USD = 4000 COP

describe('convert', () => {
  it('COP → BRL', () => {
    expect(convert(1000, 'COP', 'BRL', rates)).toBeCloseTo(2);
  });
  it('BRL → COP', () => {
    expect(convert(2, 'BRL', 'COP', rates)).toBeCloseTo(1000);
  });
  it('USD → COP', () => {
    expect(convert(1, 'USD', 'COP', rates)).toBeCloseTo(4000);
  });
  it('ARS → BRL vía COP', () => {
    // 1000 ARS = 2500 COP = 5 BRL
    expect(convert(1000, 'ARS', 'BRL', rates)).toBeCloseTo(5);
  });
  it('misma moneda es identidad', () => {
    expect(convert(1234, 'BRL', 'BRL', rates)).toBeCloseTo(1234);
  });
  it('tasa faltante → null', () => {
    const broken: Rates = { ...rates, rates: { ...rates.rates, ARS: 0 } };
    expect(convert(100, 'ARS', 'COP', broken)).toBeNull();
  });
});

describe('toCOP', () => {
  it('convierte a COP base', () => {
    expect(toCOP(3, 'BRL', rates)).toBeCloseTo(1500);
  });
});

describe('formatMoney', () => {
  it('COP sin decimales', () => {
    expect(formatMoney(1234567, 'COP')).toBe('$1.234.567');
  });
  it('BRL con 2 decimales y símbolo', () => {
    expect(formatMoney(1234.5, 'BRL')).toBe('R$1.234,50');
  });
  it('USD con símbolo US$', () => {
    expect(formatMoney(10, 'USD')).toBe('US$10,00');
  });
  it('cero', () => {
    expect(formatMoney(0, 'COP')).toBe('$0');
    expect(convert(0, 'BRL', 'COP', rates)).toBe(0);
  });
});
