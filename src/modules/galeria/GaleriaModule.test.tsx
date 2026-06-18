import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import type { Photo, TripConfig } from '../../types/trip';
import type { CityConfig } from '../../types/city';

const apply = vi.fn();
let tableRows: Photo[] = [];
vi.mock('../../lib/realtime', () => ({
  useTable: () => ({ rows: tableRows, loading: false, apply }),
}));

let mutateResult: { data: unknown; error: unknown } = { data: { id: 'new-1' }, error: null };
const mutate = vi.fn((..._a: unknown[]) => Promise.resolve(mutateResult));
vi.mock('../../lib/mutate', () => ({
  mutate: (op: unknown) => mutate(op),
}));

const storageRemove = vi.fn((..._a: unknown[]) => Promise.resolve({ error: null }));
vi.mock('../../lib/supabase', () => ({
  supabase: {
    storage: { from: () => ({
      getPublicUrl: (p: string) => ({ data: { publicUrl: `https://cdn/${p}` } }),
      remove: (paths: string[]) => storageRemove(paths),
    }) },
  },
}));

import GaleriaModule from './GaleriaModule';

const cities = [{ id: 'rio', name: 'Río', flag: '🇧🇷' }] as unknown as CityConfig[];
const trip = {
  id: 'brasil-2026',
  days: [{ date: '2026-06-25', cityId: 'rio' }],
  cities,
} as unknown as TripConfig;

const photo = (over: Partial<Photo> = {}): Photo => ({
  id: 'ph1', trip_id: 'brasil-2026', file_path: 'brasil-2026/1.jpg', taken_on: '2026-06-25',
  city_id: 'rio', caption: null, lat: -22.9, lon: -43.2, place: 'Copacabana',
  uploaded_by: 'andres', created_at: '2026-06-25T12:00:00Z', ...over,
});

function renderModule() {
  return render(<GaleriaModule trip={trip} identity="andres" />);
}

describe('GaleriaModule', () => {
  beforeEach(() => {
    apply.mockClear(); mutate.mockClear(); storageRemove.mockClear();
    tableRows = [];
    mutateResult = { data: { id: 'new-1' }, error: null };
    vi.stubGlobal('confirm', () => true);
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: true });
  });

  it('sin fotos → estado vacío', () => {
    renderModule();
    expect(screen.getByText('Aún no hay fotos')).toBeInTheDocument();
  });

  it('agrupa fotos por día con ciudad y cuenta', () => {
    tableRows = [photo()];
    const { container } = renderModule();
    expect(screen.getByText('🇧🇷 Río')).toBeInTheDocument();
    expect(screen.getByText('(1)')).toBeInTheDocument();
    const img = container.querySelector('img');
    expect(img?.getAttribute('src')).toBe('https://cdn/brasil-2026/1.jpg');
  });

  it('abrir lightbox muestra autor, lugar con link a Maps', () => {
    tableRows = [photo()];
    renderModule();
    fireEvent.click(screen.getByRole('button', { name: 'Ver foto' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Andrés', { exact: false })).toBeInTheDocument();
    const mapLink = screen.getByRole('link', { name: /Copacabana/ });
    expect(mapLink.getAttribute('href')).toBe('https://www.google.com/maps/search/?api=1&query=-22.9,-43.2');
  });

  it('editar caption → aparece Guardar, click → mutate update', async () => {
    tableRows = [photo()];
    renderModule();
    fireEvent.click(screen.getByRole('button', { name: 'Ver foto' }));
    fireEvent.change(screen.getByLabelText('Nota de la foto'), { target: { value: 'Atardecer' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));

    await waitFor(() => expect(mutate).toHaveBeenCalled());
    const op = mutate.mock.calls[0][0] as { type: string; patch: { caption: string } };
    expect(op.type).toBe('update');
    expect(op.patch.caption).toBe('Atardecer');
  });

  it('borrar foto (confirm) → mutate delete + remove del bucket', async () => {
    tableRows = [photo()];
    renderModule();
    fireEvent.click(screen.getByRole('button', { name: 'Ver foto' }));
    fireEvent.click(screen.getByRole('button', { name: 'Borrar foto' }));

    await waitFor(() => expect(mutate).toHaveBeenCalled());
    expect((mutate.mock.calls[0][0] as { type: string }).type).toBe('delete');
    await waitFor(() => expect(storageRemove).toHaveBeenCalledWith(['brasil-2026/1.jpg']));
  });
});
