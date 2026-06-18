import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import type { ChecklistItem, Note, TripConfig } from '../../types/trip';

// useTable despacha por tabla
const stores: Record<string, { rows: unknown[]; apply: ReturnType<typeof vi.fn> }> = {
  checklist_items: { rows: [], apply: vi.fn() },
  notes: { rows: [], apply: vi.fn() },
};
vi.mock('../../lib/realtime', () => ({
  useTable: (table: string) => stores[table] ?? { rows: [], apply: vi.fn() },
}));

let mutateResult: { data: unknown; error: unknown } = { data: { id: 'new-1' }, error: null };
const mutate = vi.fn(() => Promise.resolve(mutateResult));
vi.mock('../../lib/mutate', () => ({
  mutate: (op: unknown) => mutate(op),
  uuid: () => 'uuid-1',
}));

import PendientesModule from './PendientesModule';

const trip = { id: 'brasil-2026' } as TripConfig;
const item = (over: Partial<ChecklistItem> = {}): ChecklistItem => ({
  id: 'c1', trip_id: 'brasil-2026', text: 'Pasaporte', done: false, category: 'tramites',
  created_by: 'andres', created_at: '2026-06-10T10:00:00Z', ...over,
});
const note = (over: Partial<Note> = {}): Note => ({
  id: 'n1', trip_id: 'brasil-2026', body: 'Llevar adaptador', created_by: 'melisa',
  created_at: '2026-06-10T10:00:00Z', ...over,
});

function renderModule() {
  return render(<PendientesModule trip={trip} identity="andres" />);
}

describe('PendientesModule', () => {
  beforeEach(() => {
    stores.checklist_items = { rows: [], apply: vi.fn() };
    stores.notes = { rows: [], apply: vi.fn() };
    mutate.mockClear();
    mutateResult = { data: { id: 'new-1' }, error: null };
  });

  // ── Checklist ──
  it('checklist vacío → estado vacío', () => {
    renderModule();
    expect(screen.getByText('Aún no hay pendientes')).toBeInTheDocument();
  });

  it('agregar pendiente → mutate insert + apply', async () => {
    renderModule();
    fireEvent.change(screen.getByLabelText('Nuevo pendiente'), { target: { value: 'Cargador' } });
    fireEvent.click(screen.getByRole('button', { name: 'Agregar' }));

    await waitFor(() => expect(mutate).toHaveBeenCalled());
    const op = mutate.mock.calls[0][0] as { table: string; type: string; row: { text: string; id: string } };
    expect(op.table).toBe('checklist_items');
    expect(op.type).toBe('insert');
    expect(op.row.text).toBe('Cargador');
    expect(stores.checklist_items.apply).toHaveBeenCalledWith(expect.objectContaining({ eventType: 'INSERT' }));
  });

  it('Enter en el input agrega', async () => {
    renderModule();
    const input = screen.getByLabelText('Nuevo pendiente');
    fireEvent.change(input, { target: { value: 'Cargador' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    await waitFor(() => expect(mutate).toHaveBeenCalled());
  });

  it('toggle item → mutate update done', async () => {
    stores.checklist_items.rows = [item()];
    renderModule();
    fireEvent.click(screen.getByRole('button', { name: 'Marcar como hecho' }));

    await waitFor(() => expect(mutate).toHaveBeenCalled());
    const op = mutate.mock.calls[0][0] as { type: string; patch: { done: boolean } };
    expect(op.type).toBe('update');
    expect(op.patch.done).toBe(true);
  });

  it('borrar item → mutate delete', async () => {
    stores.checklist_items.rows = [item()];
    renderModule();
    fireEvent.click(screen.getByRole('button', { name: 'Borrar' }));
    await waitFor(() => expect(mutate).toHaveBeenCalled());
    expect((mutate.mock.calls[0][0] as { type: string }).type).toBe('delete');
  });

  it('error al agregar → alerta', async () => {
    mutateResult = { data: null, error: { message: 'x' } };
    renderModule();
    fireEvent.change(screen.getByLabelText('Nuevo pendiente'), { target: { value: 'Cargador' } });
    fireEvent.click(screen.getByRole('button', { name: 'Agregar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/No se pudo agregar/);
  });

  // ── Notas ──
  it('cambiar a Notas → agregar nota llama mutate insert en "notes"', async () => {
    renderModule();
    fireEvent.click(screen.getByRole('tab', { name: /Notas/ }));

    fireEvent.change(screen.getByLabelText('Nueva nota'), { target: { value: 'Comprar chip' } });
    fireEvent.click(screen.getByRole('button', { name: /Agregar nota/ }));

    await waitFor(() => expect(mutate).toHaveBeenCalled());
    const op = mutate.mock.calls[0][0] as { table: string; type: string; row: { body: string } };
    expect(op.table).toBe('notes');
    expect(op.row.body).toBe('Comprar chip');
  });

  it('editar nota → mutate update body', async () => {
    stores.notes.rows = [note()];
    renderModule();
    fireEvent.click(screen.getByRole('tab', { name: /Notas/ }));

    fireEvent.click(screen.getByRole('button', { name: 'Editar nota' }));
    fireEvent.change(screen.getByLabelText('Editar nota'), { target: { value: 'Texto nuevo' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));

    await waitFor(() => expect(mutate).toHaveBeenCalled());
    const op = mutate.mock.calls[0][0] as { table: string; type: string; patch: { body: string } };
    expect(op.table).toBe('notes');
    expect(op.type).toBe('update');
    expect(op.patch.body).toBe('Texto nuevo');
  });
});
