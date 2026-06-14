import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { wmo, fetchWeather } from './weather';

describe('wmo', () => {
  it('despejado / nubes / lluvia / tormenta', () => {
    expect(wmo(0).label).toBe('Despejado');
    expect(wmo(2).emoji).toBe('⛅');
    expect(wmo(3).label).toBe('Nublado');
    expect(wmo(63).label).toBe('Lluvia');     // rango 61-67
    expect(wmo(95).emoji).toBe('⛈️');
  });
  it('rangos: llovizna 51-57, chubascos 80-82', () => {
    expect(wmo(55).label).toBe('Llovizna');
    expect(wmo(81).label).toBe('Chubascos');
  });
  it('código desconocido → fallback', () => {
    expect(wmo(999).label).toBe('—');
  });
});

describe('fetchWeather', () => {
  const sample = {
    timezone: 'America/Sao_Paulo',
    daily: {
      time: ['2026-06-25', '2026-06-26'],
      temperature_2m_max: [24.4, 19.1],
      temperature_2m_min: [18.0, 18.6],
      precipitation_probability_max: [29, 31],
      weather_code: [53, 3],
    },
    hourly: {
      time: ['2026-06-25T00:00', '2026-06-25T01:00'],
      temperature_2m: [21.2, 20.8],
      precipitation_probability: [10, 12],
      weather_code: [2, 3],
    },
  };

  beforeEach(() => {
    sessionStorage.clear();
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => sample } as Response)));
  });
  afterEach(() => vi.unstubAllGlobals());

  it('parsea daily y hourly con redondeo', async () => {
    const w = await fetchWeather(-22.97, -43.18);
    expect(w.tz).toBe('America/Sao_Paulo');
    expect(w.daily[0]).toEqual({ date: '2026-06-25', max: 24, min: 18, rain: 29, code: 53 });
    expect(w.hourly[0]).toEqual({ time: '2026-06-25T00:00', temp: 21, rain: 10, code: 2 });
  });

  it('cachea: segunda llamada no vuelve a hacer fetch', async () => {
    const f = fetch as unknown as ReturnType<typeof vi.fn>;
    await fetchWeather(-22.97, -43.18);
    await fetchWeather(-22.97, -43.18);
    expect(f).toHaveBeenCalledTimes(1);
  });
});
