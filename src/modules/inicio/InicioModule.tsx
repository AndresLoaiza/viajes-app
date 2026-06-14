import { motion } from 'framer-motion';
import { AlertTriangle, CalendarDays, Sparkles, Ticket as TicketIcon } from 'lucide-react';
import { useTable } from '../../lib/realtime';
import { daysUntil, formatDayEs, isToday } from '../../lib/dates';
import WeatherSection from './WeatherSection';
import type { TripConfig, ItineraryItem, Ticket } from '../../types/trip';

/** Inicio: countdown hero + plan de hoy (durante el viaje). */
export default function InicioModule({ trip }: { trip: TripConfig }) {
  const dias = daysUntil(trip.startDate);
  const hoy = trip.days.find((d) => isToday(d.date));
  const { rows: items } = useTable<ItineraryItem>('itinerary_items', trip.id);
  const { rows: tickets } = useTable<Ticket>('tickets', trip.id);
  // Planes manuales + experiencias del día, mezclados y ordenados por hora.
  type PlanHoy =
    | { kind: 'item'; key: string; sort: string; time: string | null; title: string; note: string | null }
    | { kind: 'ticket'; key: string; sort: string; time: string | null; title: string; note: string | null };
  const itemsHoy: PlanHoy[] = hoy
    ? [
        ...items.filter((i) => i.date === hoy.date).map((i): PlanHoy => ({
          kind: 'item', key: i.id, sort: i.time ?? '99', time: i.time, title: i.title, note: i.note,
        })),
        ...tickets.filter((t) => t.date === hoy.date).map((t): PlanHoy => ({
          kind: 'ticket', key: `tk-${t.id}`, sort: t.time ?? '99', time: t.time, title: t.title, note: t.note,
        })),
      ].sort((a, b) => a.sort.localeCompare(b.sort))
    : [];
  const ciudadHoy = hoy ? trip.cities.find((c) => c.id === hoy.cityId) : null;
  const terminado = daysUntil(trip.endDate) < 0;

  return (
    <div className="max-w-xl mx-auto px-5 py-6 space-y-6">
      {dias > 0 && (
        <motion.section
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35 }}
          className="rounded-3xl p-8 text-center text-white relative overflow-hidden"
          style={{ background: `linear-gradient(160deg, ${trip.theme.primary} 0%, #006928 100%)` }}
        >
          <div aria-hidden className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full bg-brasil-yellow opacity-20" />
          <p className="font-semibold text-white/85">Faltan</p>
          <p className="font-display font-black text-7xl leading-none my-1">{dias}</p>
          <p className="font-semibold text-white/85">{dias === 1 ? 'día' : 'días'} para {trip.name} {trip.flag}</p>
          <p className="text-sm text-white/70 mt-2">{formatDayEs(trip.startDate)}</p>
        </motion.section>
      )}

      {hoy && (
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-white border border-sand-dark p-5"
        >
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-brasil-green" aria-hidden />
            <h2 className="font-display font-bold text-lg text-gray-800">
              Hoy · {formatDayEs(hoy.date)}
            </h2>
          </div>
          {ciudadHoy && (
            <p className="text-sm text-gray-500 mb-3">{ciudadHoy.flag} {ciudadHoy.name}</p>
          )}
          {hoy.note && (
            <div className="flex items-center gap-2 rounded-xl bg-brasil-yellow/25 text-amber-800 text-sm font-semibold px-3 py-2 mb-3">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" aria-hidden />
              {hoy.note}
            </div>
          )}
          {itemsHoy.length === 0 ? (
            <p className="text-sm text-gray-400">Sin plan aún — agrégalo en la pestaña Días</p>
          ) : (
            <ul className="divide-y divide-sand">
              {itemsHoy.map((i) => (
                <li key={i.key} className="py-2.5 flex items-baseline gap-3">
                  <span className={`font-mono text-sm font-bold w-12 flex-shrink-0 ${i.kind === 'ticket' ? 'text-amber-700' : 'text-brasil-green'}`}>
                    {i.time ? i.time.slice(0, 5) : '—'}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800 flex items-center gap-1.5">
                      {i.kind === 'ticket' && <TicketIcon className="w-4 h-4 text-amber-600 flex-shrink-0" aria-hidden style={{ filter: 'brightness(0.85)' }} />}
                      {i.title}
                    </p>
                    {i.note && <p className="text-sm text-gray-500">{i.note}</p>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </motion.section>
      )}

      {!terminado && <WeatherSection trip={trip} />}

      {terminado && (
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-white border border-sand-dark p-6 text-center"
        >
          <p className="font-display font-bold text-xl text-gray-800">Qué viaje tan lindo {trip.flag}</p>
          <p className="text-gray-500 text-sm mt-1">Revive los momentos en la pestaña Fotos</p>
        </motion.section>
      )}

      {dias > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl bg-white border border-sand-dark p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays className="w-5 h-5 text-brasil-blue" aria-hidden />
            <h2 className="font-display font-bold text-lg text-gray-800">Nuestra ruta</h2>
          </div>
          <ol className="space-y-2">
            {trip.cities.map((c) => {
              const diasCiudad = trip.days.filter((d) => d.cityId === c.id);
              if (!diasCiudad.length) return null;
              const first = diasCiudad[0].date.slice(8);
              const last = diasCiudad[diasCiudad.length - 1].date.slice(8);
              return (
                <li key={c.id} className="flex items-center gap-3">
                  <span className="text-xl" aria-hidden>{c.flag}</span>
                  <span className="font-semibold text-gray-800 flex-1">{c.name}</span>
                  <span className="text-sm text-gray-500">
                    {first === last ? `día ${Number(first)}` : `${Number(first)}–${Number(last)}`}
                  </span>
                </li>
              );
            })}
          </ol>
        </motion.section>
      )}
    </div>
  );
}
