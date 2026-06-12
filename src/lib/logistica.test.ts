import { describe, expect, it } from 'vitest';
import { formatShortEs, isUnpaid, mapsUrl, splitUrls, tsDate, tsTime } from './logistica';

describe('tsDate / tsTime', () => {
  // timestamptz guardado como UTC ficticio: PostgREST lo devuelve con +00:00
  it('extraen fecha y hora sin pasar por Date local', () => {
    expect(tsDate('2026-06-28T17:10:00+00:00')).toBe('2026-06-28');
    expect(tsTime('2026-06-28T17:10:00+00:00')).toBe('17:10');
  });
});

describe('isUnpaid', () => {
  it('detecta "Sin pagar" y "Sin comprar" sin importar mayúsculas', () => {
    expect(isUnpaid('Booking · COP $1.023.600 · ⚠️ Sin pagar')).toBe(true);
    expect(isUnpaid('⚠️ SIN COMPRAR')).toBe(true);
    expect(isUnpaid('Booking · COP $254.340 · Pagado')).toBe(false);
    expect(isUnpaid(null)).toBe(false);
  });
});

describe('formatShortEs', () => {
  it('formatea sin off-by-one UTC', () => {
    expect(formatShortEs('2026-06-24')).toMatch(/^24 jun/);
    expect(formatShortEs('2026-07-03')).toMatch(/^3 jul/);
  });
});

describe('mapsUrl', () => {
  it('codifica la dirección', () => {
    expect(mapsUrl('Rua Toneleros, 338')).toBe(
      'https://www.google.com/maps/search/?api=1&query=Rua%20Toneleros%2C%20338',
    );
  });
});

describe('splitUrls', () => {
  it('separa texto y URLs (sin tragarse el separador ·)', () => {
    const parts = splitUrls('Comprar en https://ventaweb.apn.gob.ar/reserva/IGR · Sin comprar');
    expect(parts).toEqual([
      { type: 'text', value: 'Comprar en ' },
      { type: 'url', value: 'https://ventaweb.apn.gob.ar/reserva/IGR' },
      { type: 'text', value: ' · Sin comprar' },
    ]);
  });

  it('texto sin URLs queda intacto', () => {
    expect(splitUrls('Reserva #00096542 · Pagado')).toEqual([
      { type: 'text', value: 'Reserva #00096542 · Pagado' },
    ]);
  });
});
