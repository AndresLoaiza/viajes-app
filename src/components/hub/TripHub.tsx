import { motion } from 'framer-motion';
import { Camera, ChevronRight, Compass } from 'lucide-react';
import { trips } from '../../data/trips';
import { destinos } from '../../data/destinos';
import { daysUntil, formatDayEs } from '../../lib/dates';
import type { TripConfig } from '../../types/trip';

/** Hub: lista de viajes (próximos con countdown, pasados como recuerdo). */
export default function TripHub({ onOpen }: { onOpen: (trip: TripConfig) => void }) {
  return (
    <div className="min-h-svh bg-warm-white">
      <div aria-hidden className="h-1.5 bg-brasil-green" />
      <div aria-hidden className="h-1.5 bg-brasil-yellow" />

      <main className="max-w-xl mx-auto px-5 py-8">
        <motion.header
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="font-display font-bold text-3xl text-gray-800">Nuestros Viajes</h1>
          <p className="text-gray-500">Andrés &amp; Melisa</p>
        </motion.header>

        <div className="space-y-5">
          {trips.map((trip, i) => {
            const dias = trip.status === 'upcoming' ? daysUntil(trip.startDate) : null;
            const enCurso = dias !== null && dias <= 0 && daysUntil(trip.endDate) >= 0;
            return (
              <motion.button
                key={trip.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.12, duration: 0.35 }}
                onClick={() => onOpen(trip)}
                className="w-full rounded-3xl p-6 text-left shadow-md cursor-pointer transition-shadow duration-200 hover:shadow-xl relative overflow-hidden"
                style={{
                  background: trip.status === 'upcoming'
                    ? `linear-gradient(135deg, ${trip.theme.primary} 0%, #007A2E 100%)`
                    : `linear-gradient(135deg, #8A7B5C 0%, #6B5D43 100%)`,
                }}
              >
                <div aria-hidden className="absolute -right-6 -top-6 w-28 h-28 rounded-full opacity-15 bg-white" />
                <div className="flex items-start justify-between">
                  <span className="text-4xl" aria-hidden>{trip.flag}</span>
                  <ChevronRight className="w-6 h-6 text-white/70 mt-1" aria-hidden />
                </div>
                <h2 className="font-display font-bold text-2xl text-white mt-2">{trip.name}</h2>
                <p className="text-white/85 text-sm">{trip.tagline}</p>

                {enCurso && (
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 bg-brasil-yellow text-brasil-blue font-bold text-sm">
                    ¡Estamos de viaje!
                  </div>
                )}
                {!enCurso && dias !== null && dias > 0 && (
                  <div className="mt-3 inline-flex items-baseline gap-1.5 rounded-full px-3 py-1.5 bg-brasil-yellow">
                    <span className="font-display font-bold text-xl text-brasil-blue">{dias}</span>
                    <span className="text-brasil-blue font-semibold text-sm">
                      {dias === 1 ? 'día' : 'días'} · {formatDayEs(trip.startDate)}
                    </span>
                  </div>
                )}
                {trip.status === 'past' && (
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 bg-white/20 text-white text-sm font-semibold">
                    <Camera className="w-4 h-4" aria-hidden /> Recuerdos
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + trips.length * 0.12, duration: 0.35 }}
          className="mt-10"
        >
          <div className="flex items-center gap-2 mb-3">
            <Compass className="w-5 h-5 text-brasil-green" aria-hidden />
            <h2 className="font-display font-bold text-xl text-gray-800">Próximos destinos</h2>
          </div>
          <p className="text-gray-500 text-sm mb-4">Ideas para nuestro próximo viaje 💭</p>

          <ul className="space-y-2.5">
            {destinos.map((destino, i) => (
              <motion.li
                key={destino.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + trips.length * 0.12 + i * 0.06, duration: 0.3 }}
                className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm"
              >
                <span className="text-2xl shrink-0" aria-hidden>{destino.emoji}</span>
                <div className="min-w-0">
                  <p className="font-display font-semibold text-gray-800 leading-tight">
                    {destino.flag} {destino.name}
                  </p>
                  <p className="text-gray-500 text-sm truncate">{destino.note}</p>
                </div>
              </motion.li>
            ))}
          </ul>
        </motion.section>
      </main>
    </div>
  );
}
