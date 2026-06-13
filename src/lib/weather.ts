// Clima vía Open-Meteo (gratis, sin API key). Cache en sessionStorage (~1h).
// El pronóstico cubre 16 días desde hoy: los días del viaje más lejanos (Foz/SP)
// recién aparecen al acercarse la fecha. El consumidor maneja fechas ausentes.

export interface DailyW { date: string; max: number; min: number; rain: number; code: number }
export interface HourlyW { time: string; temp: number; rain: number; code: number }
export interface Weather { tz: string; daily: DailyW[]; hourly: HourlyW[] }

const TTL = 60 * 60 * 1000; // 1h

/** Código WMO → emoji + etiqueta en español. */
export function wmo(code: number): { emoji: string; label: string } {
  if (code === 0) return { emoji: '☀️', label: 'Despejado' };
  if (code === 1) return { emoji: '🌤️', label: 'Casi despejado' };
  if (code === 2) return { emoji: '⛅', label: 'Parcial nublado' };
  if (code === 3) return { emoji: '☁️', label: 'Nublado' };
  if (code === 45 || code === 48) return { emoji: '🌫️', label: 'Niebla' };
  if (code >= 51 && code <= 57) return { emoji: '🌦️', label: 'Llovizna' };
  if (code >= 61 && code <= 67) return { emoji: '🌧️', label: 'Lluvia' };
  if (code >= 71 && code <= 77) return { emoji: '🌨️', label: 'Nieve' };
  if (code >= 80 && code <= 82) return { emoji: '🌦️', label: 'Chubascos' };
  if (code === 85 || code === 86) return { emoji: '🌨️', label: 'Nevadas' };
  if (code === 95) return { emoji: '⛈️', label: 'Tormenta' };
  if (code === 96 || code === 99) return { emoji: '⛈️', label: 'Tormenta granizo' };
  return { emoji: '🌡️', label: '—' };
}

export async function fetchWeather(lat: number, lng: number): Promise<Weather> {
  const la = Math.round(lat * 100) / 100;
  const lo = Math.round(lng * 100) / 100;
  const key = `wx:${la},${lo}`;
  try {
    const hit = sessionStorage.getItem(key);
    if (hit) {
      const { ts, data } = JSON.parse(hit) as { ts: number; data: Weather };
      if (Date.now() - ts < TTL) return data;
    }
  } catch { /* sessionStorage no disponible / corrupto → refetch */ }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${la}&longitude=${lo}`
    + `&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code`
    + `&hourly=temperature_2m,precipitation_probability,weather_code`
    + `&timezone=auto&forecast_days=16`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
  const j = await res.json();

  const daily: DailyW[] = (j.daily?.time ?? []).map((date: string, i: number) => ({
    date,
    max: Math.round(j.daily.temperature_2m_max[i]),
    min: Math.round(j.daily.temperature_2m_min[i]),
    rain: j.daily.precipitation_probability_max[i] ?? 0,
    code: j.daily.weather_code[i],
  }));
  const hourly: HourlyW[] = (j.hourly?.time ?? []).map((time: string, i: number) => ({
    time,
    temp: Math.round(j.hourly.temperature_2m[i]),
    rain: j.hourly.precipitation_probability[i] ?? 0,
    code: j.hourly.weather_code[i],
  }));
  const data: Weather = { tz: j.timezone, daily, hourly };

  try { sessionStorage.setItem(key, JSON.stringify({ ts: Date.now(), data })); } catch { /* cuota llena → ignorar */ }
  return data;
}
