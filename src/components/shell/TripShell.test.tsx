import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TripShell from './TripShell';
import type { TripConfig, ModuleId } from '../../types/trip';

const trip = (modules: ModuleId[]): TripConfig => ({
  id: 'brasil-2026', name: 'Brasil', flag: '🇧🇷', tagline: '25 jun – 3 jul',
  theme: { primary: '#009C3B' }, modules,
} as unknown as TripConfig);

describe('TripShell', () => {
  it('header con nombre/tagline y renderiza el primer módulo', () => {
    const renderModule = vi.fn((m: ModuleId) => <div>módulo:{m}</div>);
    render(<TripShell trip={trip(['inicio', 'lugares'])} onBack={() => {}} renderModule={renderModule} />);
    expect(screen.getByRole('heading', { name: 'Brasil' })).toBeInTheDocument();
    expect(screen.getByText('25 jun – 3 jul')).toBeInTheDocument();
    expect(screen.getByText('módulo:inicio')).toBeInTheDocument();
  });

  it('nav inferior con >1 módulo; cambiar de pestaña re-renderiza', () => {
    const renderModule = vi.fn((m: ModuleId) => <div>módulo:{m}</div>);
    render(<TripShell trip={trip(['inicio', 'lugares'])} onBack={() => {}} renderModule={renderModule} />);
    fireEvent.click(screen.getByRole('button', { name: /Lugares/ }));
    expect(screen.getByText('módulo:lugares')).toBeInTheDocument();
  });

  it('un solo módulo → sin nav', () => {
    render(<TripShell trip={trip(['galeria'])} onBack={() => {}} renderModule={(m) => <div>{m}</div>} />);
    expect(screen.queryByRole('navigation')).toBeNull();
  });

  it('botón volver → onBack', () => {
    const onBack = vi.fn();
    render(<TripShell trip={trip(['inicio', 'lugares'])} onBack={onBack} renderModule={(m) => <div>{m}</div>} />);
    fireEvent.click(screen.getByRole('button', { name: 'Volver a mis viajes' }));
    expect(onBack).toHaveBeenCalled();
  });
});
