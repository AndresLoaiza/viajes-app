import { lazy, Suspense, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { MotionConfig } from 'framer-motion';
import './index.css';

import AccessGate from './components/gate/AccessGate';
import TripHub from './components/hub/TripHub';
import TripShell from './components/shell/TripShell';
import ErrorBoundary from './components/ErrorBoundary';
import InstallPrompt from './components/InstallPrompt';
import SyncIndicator from './components/SyncIndicator';
import { getStoredIdentity } from './lib/identity';
import type { TravelerId, TripConfig, ModuleId } from './types/trip';

// Lazy: cada módulo es su propio chunk → carga inicial liviana, Mapa (Leaflet)
// solo se descarga al abrirlo.
const InicioModule = lazy(() => import('./modules/inicio/InicioModule'));
const ItinerarioModule = lazy(() => import('./modules/itinerario/ItinerarioModule'));
const LugaresModule = lazy(() => import('./modules/lugares/LugaresModule'));
const LogisticaModule = lazy(() => import('./modules/logistica/LogisticaModule'));
const GaleriaModule = lazy(() => import('./modules/galeria/GaleriaModule'));
const MapaModule = lazy(() => import('./modules/mapa/MapaModule'));
const PendientesModule = lazy(() => import('./modules/pendientes/PendientesModule'));
const RecuerdosModule = lazy(() => import('./modules/recuerdos/RecuerdosModule'));

function ModuleLoading() {
  return (
    <div className="flex justify-center py-16 text-gray-300" role="status" aria-label="Cargando">
      <Loader2 className="w-6 h-6 animate-spin" aria-hidden />
    </div>
  );
}

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
      renderModule={(m: ModuleId) => (
        <ErrorBoundary key={m}>
          <Suspense fallback={<ModuleLoading />}>
            {(() => {
              switch (m) {
                case 'inicio':
                  return <InicioModule trip={trip} />;
                case 'itinerario':
                  return <ItinerarioModule trip={trip} identity={identity} />;
                case 'lugares':
                  return <LugaresModule trip={trip} identity={identity} />;
                case 'logistica':
                  return <LogisticaModule trip={trip} identity={identity} />;
                case 'galeria':
                  return <GaleriaModule trip={trip} identity={identity} />;
                case 'mapa':
                  return <MapaModule trip={trip} identity={identity} />;
                case 'pendientes':
                  return <PendientesModule trip={trip} identity={identity} />;
                case 'recuerdos':
                  return <RecuerdosModule trip={trip} />;
                default:
                  return (
                    <div className="max-w-xl mx-auto px-5 py-16 text-center text-gray-400">
                      <p className="font-display font-bold text-xl">Próximamente</p>
                      <p className="text-sm mt-1">Esta sección está en construcción</p>
                    </div>
                  );
              }
            })()}
          </Suspense>
        </ErrorBoundary>
      )}
    />
  );

  // reducedMotion="user" → framer-motion respeta prefers-reduced-motion
  return (
    <MotionConfig reducedMotion="user">
      {content}
      <SyncIndicator />
      <InstallPrompt />
    </MotionConfig>
  );
}
