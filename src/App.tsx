import { useState } from 'react';
import { MotionConfig } from 'framer-motion';
import './index.css';

import AccessGate from './components/gate/AccessGate';
import TripHub from './components/hub/TripHub';
import TripShell from './components/shell/TripShell';
import InicioModule from './modules/inicio/InicioModule';
import ItinerarioModule from './modules/itinerario/ItinerarioModule';
import LugaresModule from './modules/lugares/LugaresModule';
import LogisticaModule from './modules/logistica/LogisticaModule';
import { getStoredIdentity } from './lib/identity';
import type { TravelerId, TripConfig, ModuleId } from './types/trip';

// Flujo: gate (código + identidad, solo 1ª vez) → hub de viajes → shell del viaje.
// El flujo viejo de selección/Gist vive en src/legacy/SelectionApp.tsx como referencia.
export default function App() {
  const [identity, setIdentity] = useState<TravelerId | null>(getStoredIdentity());
  const [trip, setTrip] = useState<TripConfig | null>(null);

  const content = !identity ? (
    <AccessGate onUnlocked={setIdentity} />
  ) : !trip ? (
    <TripHub onOpen={setTrip} />
  ) : (
    <TripShell
      trip={trip}
      onBack={() => setTrip(null)}
      renderModule={(m: ModuleId) => {
        switch (m) {
          case 'inicio':
            return <InicioModule trip={trip} />;
          case 'itinerario':
            return <ItinerarioModule trip={trip} identity={identity} />;
          case 'lugares':
            return <LugaresModule trip={trip} identity={identity} />;
          case 'logistica':
            return <LogisticaModule trip={trip} identity={identity} />;
          // galeria / mapa / pendientes: Planes 2-3
          default:
            return (
              <div className="max-w-xl mx-auto px-5 py-16 text-center text-gray-400">
                <p className="font-display font-bold text-xl">Próximamente</p>
                <p className="text-sm mt-1">Esta sección está en construcción</p>
              </div>
            );
        }
      }}
    />
  );

  // reducedMotion="user" → framer-motion respeta prefers-reduced-motion
  return <MotionConfig reducedMotion="user">{content}</MotionConfig>;
}
