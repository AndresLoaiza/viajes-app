import type { TravelerId, TripConfig } from '../../types/trip';
import VuelosSection from './VuelosSection';
import HotelesSection from './HotelesSection';
import BoletasSection from './BoletasSection';

/** Logística del viaje: vuelos, hoteles y boletas con visor de documentos. */
export default function LogisticaModule({ trip, identity }: {
  trip: TripConfig;
  identity: TravelerId;
}) {
  return (
    <div className="max-w-xl mx-auto px-5 py-5">
      <VuelosSection trip={trip} identity={identity} />
      <HotelesSection trip={trip} identity={identity} />
      <BoletasSection trip={trip} identity={identity} />
    </div>
  );
}
