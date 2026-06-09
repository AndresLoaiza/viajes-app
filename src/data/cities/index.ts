import type { CityConfig } from '../../types/city';
import rio from './rio';
import sp from './sp';

// Registro de ciudades. Para agregar otra: crea su archivo y añádelo aquí.
export const cities: CityConfig[] = [rio, sp];

// Ciudad por defecto cuando solo hay una (si hay varias, App muestra el selector).
export const defaultCityId = cities[0].id;
