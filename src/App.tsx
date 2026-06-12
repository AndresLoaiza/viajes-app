import { useState } from 'react';
import './index.css';

import AccessGate from './components/gate/AccessGate';
import TripHub from './components/hub/TripHub';
import TripShell from './components/shell/TripShell';
import InicioModule from './modules/inicio/InicioModule';
import ItinerarioModule from './modules/itinerario/ItinerarioModule';
import { getStoredIdentity } from './lib/identity';
import type { TravelerId, TripConfig, ModuleId } from './types/trip';

// Flujo: gate (código + identidad, solo 1ª vez) → hub de viajes → shell del viaje.
// El flujo viejo de selección/Gist vive en src/legacy/SelectionApp.tsx como referencia.
export default function App() {
  const [identity, setIdentity] = useState<TravelerId | null>(getStoredIdentity());
  const [trip, setTrip] = useState<TripConfig | null>(null);

  if (!identity) return <AccessGate onUnlocked={setIdentity} />;
  if (!trip) return <TripHub onOpen={setTrip} />;

  const renderModule = (m: ModuleId) => {
    switch (m) {
      case 'inicio':
        return <InicioModule trip={trip} />;
      case 'itinerario':
        return <ItinerarioModule trip={trip} identity={identity} />;
      // lugares: Task 11 · logistica / galeria / mapa / pendientes: Planes 2-3
      default:
        return (
          <div className="max-w-xl mx-auto px-5 py-16 text-center text-gray-400">
            <p className="font-display font-bold text-xl">Próximamente</p>
            <p className="text-sm mt-1">Esta sección está en construcción</p>
          </div>
        );
    }
  };

  return <TripShell trip={trip} onBack={() => setTrip(null)} renderModule={renderModule} />;
}
