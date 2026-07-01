import { describe, it, expect } from 'vitest';
import { activeTrip, trips } from './index';

describe('activeTrip', () => {
  const brasil = trips.find((t) => t.id === 'brasil-2026')!;

  it('devuelve el viaje en curso durante sus fechas', () => {
    // Un día dentro del rango del viaje a Brasil
    const dentro = new Date(2026, 5, 27); // 27 jun 2026
    expect(activeTrip(dentro)?.id).toBe(brasil.id);
  });

  it('el primer y último día cuentan como en curso', () => {
    expect(activeTrip(new Date(2026, 5, 25))?.id).toBe(brasil.id); // startDate
    expect(activeTrip(new Date(2026, 6, 3))?.id).toBe(brasil.id);  // endDate
  });

  it('antes de empezar → null', () => {
    expect(activeTrip(new Date(2026, 5, 24))).toBeNull();
  });

  it('después de terminar → null', () => {
    expect(activeTrip(new Date(2026, 6, 4))).toBeNull();
  });

  it('viajes pasados (status past) no cuentan como en curso', () => {
    // Fechas de Bogotá (past) — no debe devolverse aunque el rango coincida
    expect(activeTrip(new Date(2026, 2, 30))).toBeNull();
  });
});
