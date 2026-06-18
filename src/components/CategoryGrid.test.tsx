import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CategoryGrid from './CategoryGrid';
import type { CityConfig, SelectionsMap } from '../types/city';

const config = {
  id: 'rio', name: 'Río',
  categories: [
    { id: 'playas', name: 'Playas', emoji: '🏖️', color: '#1B6CA8' },
    { id: 'museos', name: 'Museos', emoji: '🏛️', color: '#C0392B' },
    { id: 'vacia', name: 'Vacía', emoji: '🚫', color: '#000' },
  ],
  places: [
    { id: 'p1', name: 'Copacabana', category: 'playas', description: '', images: [] },
    { id: 'p2', name: 'Ipanema', category: 'playas', description: '', images: [] },
    { id: 'p3', name: 'MASP', category: 'museos', description: '', images: [] },
  ],
} as unknown as CityConfig;

const sel = (ids: string[]): SelectionsMap =>
  Object.fromEntries(ids.map((id) => [id, { placeId: id, selected: true, preferredDates: [], notes: '' }]));

describe('CategoryGrid', () => {
  it('lista categorías con conteo y omite las vacías', () => {
    render(<CategoryGrid config={config} selections={{}} onPick={() => {}} />);
    expect(screen.getByText('Playas')).toBeInTheDocument();
    expect(screen.getByText('2 lugares')).toBeInTheDocument(); // playas
    expect(screen.getByText('1 lugares')).toBeInTheDocument(); // museos
    expect(screen.queryByText('Vacía')).toBeNull();            // sin lugares → no se muestra
  });

  it('refleja seleccionados: "N de M elegidos" + badge', () => {
    render(<CategoryGrid config={config} selections={sel(['p1'])} onPick={() => {}} />);
    expect(screen.getByText('1 de 2 elegidos')).toBeInTheDocument();
  });

  it('click → onPick con el id de la categoría', () => {
    const onPick = vi.fn();
    render(<CategoryGrid config={config} selections={{}} onPick={onPick} />);
    fireEvent.click(screen.getByText('Museos'));
    expect(onPick).toHaveBeenCalledWith('museos');
  });
});
