import { describe, it, expect } from 'vitest';
import { daysUntil, formatDayEs, isToday } from './dates';

describe('daysUntil', () => {
  it('cuenta días hasta fecha futura', () => {
    expect(daysUntil('2026-06-25', new Date('2026-06-12T10:00:00'))).toBe(13);
  });
  it('0 si es hoy', () => {
    expect(daysUntil('2026-06-25', new Date('2026-06-25T08:00:00'))).toBe(0);
  });
  it('negativo si pasó', () => {
    expect(daysUntil('2026-06-25', new Date('2026-06-30T08:00:00'))).toBe(-5);
  });
});

describe('formatDayEs', () => {
  it('formatea fecha ISO a español', () => {
    expect(formatDayEs('2026-06-25')).toMatch(/jueves/i);
    expect(formatDayEs('2026-06-25')).toMatch(/25/);
  });
});

describe('isToday', () => {
  it('true si coincide', () => {
    expect(isToday('2026-06-25', new Date('2026-06-25T23:00:00'))).toBe(true);
    expect(isToday('2026-06-25', new Date('2026-06-26T01:00:00'))).toBe(false);
  });
});
