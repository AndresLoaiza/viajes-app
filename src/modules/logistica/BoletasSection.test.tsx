import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import type { Ticket, TripConfig } from '../../types/trip';

const apply = vi.fn();
let tableRows: Ticket[] = [];
vi.mock('../../lib/realtime', () => ({
  useTable: () => ({ rows: tableRows, loading: false, apply }),
}));

let mutateResult: { data: unknown; error: unknown } = { data: { id: 'new-1' }, error: null };
const mutate = vi.fn(() => Promise.resolve(mutateResult));
vi.mock('../../lib/mutate', () => ({
  mutate: (op: unknown) => mutate(op),
  uuid: () => 'uuid-1',
}));

const storageRemove = vi.fn(() => Promise.resolve({ error: null }));
vi.mock('../../lib/supabase', () => ({
  supabase: {
    storage: {
      from: () => ({
        getPublicUrl: (p: string) => ({ data: { publicUrl: `https://cdn/${p}` } }),
        remove: (paths: string[]) => storageRemove(paths),
        upload: () => Promise.resolve({ error: null }),
      }),
    },
  },
}));

import BoletasSection from './BoletasSection';

const trip = { id: 'brasil-2026' } as unknown as TripConfig;
const ticket = (over: Partial<Ticket> = {}): Ticket => ({
  id: 't1', trip_id: 'brasil-2026', title: 'Cristo Redentor', date: '2026-06-26',
  time: '09:00', file_path: null, note: 'Reserva web', created_by: 'andres',
  created_at: '2026-06-01T00:00:00Z', ...over,
});

function renderSection() {
  return render(<BoletasSection trip={trip} identity="andres" />);
}

describe('BoletasSection', () => {
  beforeEach(() => {
    apply.mockClear(); mutate.mockClear(); storageRemove.mockClear();
    tableRows = [];
    mutateResult = { data: { id: 'new-1' }, error: null };
    vi.stubGlobal('confirm', () => true);
    vi.stubGlobal('navigator', { onLine: true });
  });

  it('sin experiencias → hint vacío', () => {
    renderSection();
    fireEvent.click(screen.getByRole('button', { name: /^Experiencias/ }));
    expect(screen.getByText(/Sin experiencias aún/)).toBeInTheDocument();
  });

  it('lista ticket con fecha/hora; PDF → enlace pestaña nueva', () => {
    tableRows = [ticket({ file_path: 'brasil-2026/cristo.pdf' })];
    renderSection();
    fireEvent.click(screen.getByRole('button', { name: /^Experiencias/ }));
    expect(screen.getByText('Cristo Redentor')).toBeInTheDocument();
    expect(screen.getByText(/09:00/)).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /Ver boleta/ });
    expect(link.getAttribute('href')).toBe('https://cdn/brasil-2026/cristo.pdf');
    expect(link.getAttribute('target')).toBe('_blank');
  });

  it('imagen → "Ver boleta" abre visor (dialog)', () => {
    tableRows = [ticket({ file_path: 'brasil-2026/cristo.jpg' })];
    renderSection();
    fireEvent.click(screen.getByRole('button', { name: /^Experiencias/ }));
    fireEvent.click(screen.getByRole('button', { name: /Ver boleta/ }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByAltText('Boleta Cristo Redentor')).toBeInTheDocument();
  });

  it('guardar nueva experiencia (solo título) → insert', async () => {
    renderSection();
    fireEvent.click(screen.getByLabelText('Agregar a Experiencias'));
    fireEvent.change(screen.getByLabelText('Título *'), { target: { value: 'Pan de Azúcar' } });
    fireEvent.click(screen.getByRole('button', { name: 'Agregar' }));

    await waitFor(() => expect(mutate).toHaveBeenCalled());
    const op = mutate.mock.calls[0][0] as { type: string; row: { title: string; file_path: string | null } };
    expect(op.type).toBe('insert');
    expect(op.row.title).toBe('Pan de Azúcar');
    expect(op.row.file_path).toBeNull();
  });

  it('borrar con archivo → mutate delete + remove del bucket', async () => {
    tableRows = [ticket({ file_path: 'brasil-2026/cristo.pdf' })];
    renderSection();
    fireEvent.click(screen.getByRole('button', { name: /^Experiencias/ }));
    fireEvent.click(screen.getByLabelText('Borrar Cristo Redentor'));
    await waitFor(() => expect(mutate).toHaveBeenCalled());
    expect((mutate.mock.calls[0][0] as { type: string }).type).toBe('delete');
    await waitFor(() => expect(storageRemove).toHaveBeenCalledWith(['brasil-2026/cristo.pdf']));
  });
});
