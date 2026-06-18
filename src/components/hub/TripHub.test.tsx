import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

const daysUntil = vi.fn();
vi.mock('../../lib/dates', () => ({
  daysUntil: (d: string) => daysUntil(d),
  formatDayEs: () => '25 de junio',
}));

import TripHub from './TripHub';
import { trips } from '../../data/trips';

describe('TripHub', () => {
  beforeEach(() => daysUntil.mockReset());

  it('lista los viajes con su nombre', () => {
    daysUntil.mockReturnValue(7);
    render(<TripHub onOpen={() => {}} />);
    trips.forEach((t) => expect(screen.getByText(t.name)).toBeInTheDocument());
  });

  it('viaje próximo (días > 0) → countdown', () => {
    daysUntil.mockReturnValue(7);
    render(<TripHub onOpen={() => {}} />);
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getAllByText(/días · 25 de junio/).length).toBeGreaterThan(0);
  });

  it('viaje pasado → chip Recuerdos', () => {
    daysUntil.mockReturnValue(7);
    render(<TripHub onOpen={() => {}} />);
    // hay al menos un viaje con status past en los datos reales
    if (trips.some((t) => t.status === 'past')) {
      expect(screen.getByText('Recuerdos')).toBeInTheDocument();
    }
  });

  it('en curso (inicio <= 0, fin >= 0) → "¡Estamos de viaje!"', () => {
    // primer upcoming: daysUntil(start) -1, daysUntil(end) 3
    daysUntil.mockReturnValueOnce(-1).mockReturnValueOnce(3).mockReturnValue(5);
    render(<TripHub onOpen={() => {}} />);
    expect(screen.getByText('¡Estamos de viaje!')).toBeInTheDocument();
  });

  it('click en un viaje → onOpen con ese viaje', () => {
    daysUntil.mockReturnValue(7);
    const onOpen = vi.fn();
    render(<TripHub onOpen={onOpen} />);
    fireEvent.click(screen.getByText(trips[0].name).closest('button')!);
    expect(onOpen).toHaveBeenCalledWith(trips[0]);
  });
});
