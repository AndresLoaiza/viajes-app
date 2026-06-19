import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { TripConfig } from '../../types/trip';

vi.mock('./VuelosSection', () => ({ default: (p: { identity: string }) => <div data-testid="vuelos">{p.identity}</div> }));
vi.mock('./HotelesSection', () => ({ default: () => <div data-testid="hoteles" /> }));
vi.mock('./BoletasSection', () => ({ default: () => <div data-testid="boletas" /> }));
vi.mock('./GastosSection', () => ({ default: () => <div data-testid="gastos" /> }));

import LogisticaModule from './LogisticaModule';

describe('LogisticaModule', () => {
  it('compone las 4 secciones, pasando identity', () => {
    render(<LogisticaModule trip={{ id: 'brasil-2026' } as TripConfig} identity="melisa" />);
    ['vuelos', 'hoteles', 'boletas', 'gastos'].forEach((id) =>
      expect(screen.getByTestId(id)).toBeInTheDocument());
    expect(screen.getByTestId('vuelos')).toHaveTextContent('melisa');
  });
});
