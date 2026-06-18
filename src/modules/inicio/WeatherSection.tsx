import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CloudSun, Loader2 } from 'lucide-react';
import { isToday } from '../../lib/dates';
import { fetchWeather, wmo, type Weather } from '../../lib/weather';
import type { TripConfig } from '../../types/trip';

const dowShort = (date: string) => {
  const [y, m, d] = date.split('-').map(Number);
  return ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'][new Date(y, m - 1, d).getDay()];
};

/** Sección de clima (Open-Meteo) para Inicio: chips por ciudad, horas de hoy y días del viaje. */
export default function WeatherSection({ trip }: { trip: TripConfig }) {
  const cities = useMemo(() => trip.cities.filter((c) => c.center), [trip]);
  const todayCity = trip.days.find((d) => isToday(d.date))?.cityId;
  const [cityId, setCityId] = useState(todayCity ?? cities[0]?.id ?? '');
  const [data, setData] = useState<Weather | null>(null);
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading');

  const city = cities.find((c) => c.id === cityId);

  useEffect(() => {
    if (!city?.center) return;
    let alive = true;
    // Reset intencional al cambiar de ciudad: volvemos a "cargando" antes del fetch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState('loading');
    fetchWeather(city.center[0], city.center[1])
      .then((w) => { if (alive) { setData(w); setState('ok'); } })
      .catch(() => { if (alive) setState('error'); });
    return () => { alive = false; };
  }, [city]);

  // Horas de hoy desde la hora actual (≈; tz del destino vs dispositivo puede variar 1-2h).
  const todayStr = data?.daily[0]?.date;
  const nowHour = new Date().getHours();
  const hourStrip = useMemo(() => {
    if (!data || !todayStr) return [];
    const fromToday = data.hourly.filter((h) => h.time.slice(0, 10) >= todayStr);
    const start = fromToday.findIndex(
      (h) => h.time.slice(0, 10) > todayStr || Number(h.time.slice(11, 13)) >= nowHour,
    );
    return fromToday.slice(Math.max(0, start), Math.max(0, start) + 12);
  }, [data, todayStr, nowHour]);

  const cityDays = useMemo(() => {
    const dates = trip.days.filter((d) => d.cityId === cityId).map((d) => d.date);
    return dates.map((date) => ({ date, w: data?.daily.find((x) => x.date === date) ?? null }));
  }, [trip, cityId, data]);

  if (cities.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="rounded-3xl bg-white border border-sand-dark p-5"
    >
      <div className="flex items-center gap-2 mb-3">
        <CloudSun className="w-5 h-5 text-brasil-blue" aria-hidden />
        <h2 className="font-display font-bold text-lg text-gray-800">Clima</h2>
      </div>

      {cities.length > 1 && (
        <div className="flex gap-1.5 mb-4 overflow-x-auto pb-0.5">
          {cities.map((c) => {
            const sel = c.id === cityId;
            return (
              <button
                key={c.id} onClick={() => setCityId(c.id)} aria-pressed={sel}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold border-2 cursor-pointer transition-colors duration-200
                  ${sel ? 'bg-brasil-blue border-brasil-blue text-white' : 'bg-white border-sand-dark text-gray-500'}`}
              >
                {c.flag} {c.name}
              </button>
            );
          })}
        </div>
      )}

      {state === 'loading' && (
        <div className="flex items-center gap-2 text-gray-400 text-sm py-4">
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> Cargando clima…
        </div>
      )}
      {state === 'error' && (
        <p className="text-sm text-gray-400 py-2">No se pudo cargar el clima. Intenta más tarde.</p>
      )}

      {state === 'ok' && data && (
        <>
          {hourStrip.length > 0 && (
            <>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Por horas (hoy)</p>
              <div className="flex gap-2 overflow-x-auto pb-1 mb-4">
                {hourStrip.map((h) => (
                  <div key={h.time} className="shrink-0 w-14 rounded-xl bg-sand/40 py-2 flex flex-col items-center gap-0.5">
                    <span className="text-[11px] text-gray-500">{h.time.slice(11, 16)}</span>
                    <span className="text-lg leading-none" aria-hidden>{wmo(h.code).emoji}</span>
                    <span className="text-sm font-bold text-gray-800">{h.temp}°</span>
                    <span className="text-[10px] text-brasil-blue">{h.rain}%</span>
                  </div>
                ))}
              </div>
            </>
          )}

          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            {city ? `Tus días en ${city.name}` : 'Tus días'}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {cityDays.map(({ date, w }) => (
              <div key={date} className="rounded-xl border border-sand-dark px-3 py-2.5 flex items-center gap-3">
                <span className="text-2xl" aria-hidden>{w ? wmo(w.code).emoji : '🗓️'}</span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-700 capitalize">{dowShort(date)} {Number(date.slice(8))}</p>
                  {w ? (
                    <>
                      <p className="text-sm font-semibold text-gray-800">{w.max}° / {w.min}°</p>
                      <p className="text-[11px] text-brasil-blue">💧 {w.rain}%</p>
                    </>
                  ) : (
                    <p className="text-[11px] text-gray-400 leading-tight">Disponible más cerca</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </motion.section>
  );
}
