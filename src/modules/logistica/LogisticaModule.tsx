import type { TravelerId, TripConfig } from '../../types/trip';
import ConversorCard from './ConversorCard';
import VuelosSection from './VuelosSection';
import HotelesSection from './HotelesSection';
import BoletasSection from './BoletasSection';
// 「Gastos」— activar tras correr scripts/migrations/2026-06-14-expenses.sql:
// import GastosSection from './GastosSection';

/** Plan del viaje: conversor + vuelos, hoteles y experiencias con visor de documentos. */
export default function LogisticaModule({ trip, identity }: {
  trip: TripConfig;
  identity: TravelerId;
}) {
  return (
    <div className="max-w-xl mx-auto px-5 py-5">
      <ConversorCard />
      <VuelosSection trip={trip} identity={identity} />
      <HotelesSection trip={trip} identity={identity} />
      <BoletasSection trip={trip} identity={identity} />
      {/* 「Gastos」— activar tras correr la migración:
      <GastosSection trip={trip} identity={identity} /> */}
    </div>
  );
}
