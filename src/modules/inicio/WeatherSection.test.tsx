import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { Weather } from '../../lib/weather';
import type { TripConfig } from '../../types/trip';
import type { CityConfig } from '../../types/city';

let weather: Weather | Promise<never> = {
  tz: 'America/Sao_Paulo',
  daily: [{ date: '2026-06-20', max: 30, min: 20, rain: 10, code: 0 }],
  hourly: [],
};
let shouldReject = false;
vi.mock('../../lib/weather', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../lib/weather')>();
  return {
    ...actual,
    fetchWeather: () => (shouldReject ? Promise.reject(new Error('net')) : Promise.resolve(weather)),
  };
});

import WeatherSection from './WeatherSection';

const city = (id: string, name: string, flag: string): CityConfig =>
  ({ id, name, flag, center: [-22.9, -43.2] } as unknown as CityConfig);

const baseTrip = (cities: CityConfig[]): TripConfig =>
  ({
    id: 'brasil-2026',
    days: [{ date: '2026-06-20', cityId: 'rio' }],
    cities,
  } as unknown as TripConfig);

describe('WeatherSection', () => {
  beforeEach(() => {
    shouldReject = false;
    weather = {
      tz: 'America/Sao_Paulo',
      daily: [{ date: '2026-06-20', max: 30, min: 20, rain: 10, code: 0 }],
      hourly: [],
    };
  });

  it('sin ciudades con coordenadas → no renderiza nada', () => {
    const { container } = render(<WeatherSection trip={baseTrip([])} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('carga ok → muestra los días con max/min', async () => {
    render(<WeatherSection trip={baseTrip([city('rio', 'Río', '🇧🇷')])} />);
    expect(await screen.findByText('Tus días en Río')).toBeInTheDocument();
    expect(screen.getByText('30° / 20°')).toBeInTheDocument();
  });

  it('error de red → mensaje de fallo', async () => {
    shouldReject = true;
    render(<WeatherSection trip={baseTrip([city('rio', 'Río', '🇧🇷')])} />);
    expect(await screen.findByText(/No se pudo cargar el clima/)).toBeInTheDocument();
  });

  it('varias ciudades → chips cambian la ciudad activa', async () => {
    render(<WeatherSection trip={baseTrip([city('rio', 'Río', '🇧🇷'), city('sp', 'SP', '🇧🇷')])} />);
    await screen.findByText('Tus días en Río');

    fireEvent.click(screen.getByRole('button', { name: /SP/ }));
    expect(await screen.findByText('Tus días en SP')).toBeInTheDocument();
  });
});
