import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Home, CalendarDays, Plane, MapPin, Images, Map, ListChecks,
  type LucideIcon,
} from 'lucide-react';
import type { TripConfig, ModuleId } from '../../types/trip';

const MODULE_META: Record<ModuleId, { label: string; Icon: LucideIcon }> = {
  inicio: { label: 'Inicio', Icon: Home },
  itinerario: { label: 'Días', Icon: CalendarDays },
  logistica: { label: 'Vuelos', Icon: Plane },
  lugares: { label: 'Lugares', Icon: MapPin },
  galeria: { label: 'Fotos', Icon: Images },
  mapa: { label: 'Mapa', Icon: Map },
  pendientes: { label: 'Listas', Icon: ListChecks },
};

/** Shell de un viaje: header con volver al hub + nav inferior por módulos. */
export default function TripShell({ trip, onBack, renderModule }: {
  trip: TripConfig;
  onBack: () => void;
  renderModule: (m: ModuleId) => React.ReactNode;
}) {
  const [active, setActive] = useState<ModuleId>(trip.modules[0]);
  const showNav = trip.modules.length > 1;

  return (
    <div className="min-h-svh bg-warm-white" style={{ paddingBottom: showNav ? '5.5rem' : 0 }}>
      <header
        className="sticky top-0 z-40 px-4 py-3 flex items-center gap-3 shadow-sm"
        style={{ backgroundColor: '#002776' }}
      >
        <button
          onClick={onBack}
          aria-label="Volver a mis viajes"
          className="min-w-11 min-h-11 -ml-2 flex items-center justify-center text-white/80 hover:text-white cursor-pointer transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5" aria-hidden />
        </button>
        <span className="text-2xl" aria-hidden>{trip.flag}</span>
        <div className="flex-1">
          <h1 className="font-display font-bold text-white text-base leading-tight">{trip.name}</h1>
          <p className="text-white/60 text-xs">{trip.tagline}</p>
        </div>
      </header>

      <main>{renderModule(active)}</main>

      {showNav && (
        <nav
          aria-label="Secciones del viaje"
          className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-sand-dark"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <div className="max-w-xl mx-auto flex">
            {trip.modules.map((m) => {
              const { label, Icon } = MODULE_META[m];
              const isActive = active === m;
              return (
                <button
                  key={m}
                  onClick={() => setActive(m)}
                  aria-current={isActive ? 'page' : undefined}
                  className="flex-1 min-h-14 pt-2 pb-1.5 flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-colors duration-200 relative"
                  style={{ color: isActive ? trip.theme.primary : '#9CA3AF' }}
                >
                  <Icon className="w-5 h-5" aria-hidden strokeWidth={isActive ? 2.4 : 2} />
                  <span className={`text-[10px] leading-none ${isActive ? 'font-bold' : 'font-medium'}`}>
                    {label}
                  </span>
                  {isActive && (
                    <motion.span
                      layoutId="nav-active"
                      aria-hidden
                      className="absolute top-0 w-8 h-0.5 rounded-full"
                      style={{ backgroundColor: trip.theme.primary }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
