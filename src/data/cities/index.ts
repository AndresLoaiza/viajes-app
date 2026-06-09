import type { CityConfig } from '../../types/city';
import rio from './rio';
import sp from './sp';

// Registro de ciudades. Para agregar otra: crea su archivo y añádelo aquí.
export const cities: CityConfig[] = [rio, sp];

// Ciudad por defecto (preseleccionada). Con varias ciudades App muestra el selector,
// pero São Paulo queda como ciudad inicial/por defecto.
export const defaultCityId = 'sp';
