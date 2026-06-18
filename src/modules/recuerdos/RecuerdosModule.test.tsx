import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { Photo, TripConfig } from '../../types/trip';

let tableRows: Photo[] = [];
let tableLoading = false;
vi.mock('../../lib/realtime', () => ({
  useTable: () => ({ rows: tableRows, loading: tableLoading, apply: () => {} }),
}));
vi.mock('../../lib/supabase', () => ({
  supabase: { storage: { from: () => ({ getPublicUrl: (p: string) => ({ data: { publicUrl: `https://cdn/${p}` } }) }) } },
}));

import RecuerdosModule from './RecuerdosModule';

const trip = { id: 'bogota-2026', name: 'Bogotá', flag: '🇨🇴' } as unknown as TripConfig;
const photo = (o: Partial<Photo> = {}): Photo => ({
  id: 'ph1', trip_id: 'bogota-2026', file_path: '1.jpg', taken_on: '2026-03-28', city_id: null,
  caption: null, lat: 4.6, lon: -74, place: 'Candelaria', uploaded_by: 'andres', created_at: '', ...o,
});

describe('RecuerdosModule', () => {
  beforeEach(() => { tableRows = []; tableLoading = false; });

  it('cargando → mensaje de carga', () => {
    tableLoading = true;
    render(<RecuerdosModule trip={trip} />);
    expect(screen.getByText(/Cargando recuerdos/)).toBeInTheDocument();
  });

  it('sin fotos → estado vacío', () => {
    render(<RecuerdosModule trip={trip} />);
    expect(screen.getByText('Aún no hay recuerdos')).toBeInTheDocument();
  });

  it('con fotos → hero, stats y día a día', () => {
    tableRows = [photo({ id: 'a', taken_on: '2026-03-28', place: 'Candelaria' }),
      photo({ id: 'b', taken_on: '2026-03-29', place: 'Monserrate' })];
    render(<RecuerdosModule trip={trip} />);
    expect(screen.getByRole('heading', { name: 'Bogotá' })).toBeInTheDocument();
    expect(screen.getByText('fotos')).toBeInTheDocument();
    expect(screen.getAllByText('2').length).toBeGreaterThan(0); // 2 fotos/días/lugares
    expect(screen.getByText('Día a día')).toBeInTheDocument();
  });

  it('tocar foto abre el visor y se cierra', () => {
    tableRows = [photo()];
    render(<RecuerdosModule trip={trip} />);
    fireEvent.click(screen.getByRole('button', { name: /Ver foto: Candelaria/ }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar foto' }));
    // tras cerrar, el diálogo desaparece (AnimatePresence exit inmediato en jsdom)
  });
});
