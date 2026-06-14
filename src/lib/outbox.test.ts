import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock supabase chainable. `result` se ajusta por test.
let result: { data: unknown; error: { message: string } | null } = { data: null, error: null };
const chain: Record<string, unknown> = {};
['insert', 'update', 'delete', 'upsert', 'select', 'eq'].forEach((m) => { chain[m] = () => chain; });
chain.single = () => Promise.resolve(result);
chain.then = (res: (v: unknown) => unknown) => Promise.resolve(result).then(res);
vi.mock('./supabase', () => ({ supabase: { from: () => chain } }));

import { enqueue, pendingCount, flush, isNetwork, uuid } from './outbox';

function setOnline(v: boolean) {
  Object.defineProperty(navigator, 'onLine', { configurable: true, value: v });
}

describe('outbox', () => {
  beforeEach(() => { localStorage.clear(); result = { data: null, error: null }; setOnline(true); });
  afterEach(() => setOnline(true));

  it('uuid v4', () => {
    expect(uuid()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  it('enqueue suma a la cola persistida', () => {
    expect(pendingCount()).toBe(0);
    enqueue({ table: 'notes', type: 'insert', row: { id: 'a' } });
    enqueue({ table: 'notes', type: 'delete', id: 'a' });
    expect(pendingCount()).toBe(2);
  });

  it('isNetwork: offline o mensajes de red', () => {
    setOnline(false);
    expect(isNetwork('cualquier cosa')).toBe(true);
    setOnline(true);
    expect(isNetwork('Failed to fetch')).toBe(true);
    expect(isNetwork('permiso denegado')).toBe(false);
  });

  it('flush vacía la cola cuando online y sin error', async () => {
    enqueue({ table: 'notes', type: 'insert', row: { id: 'a' } });
    enqueue({ table: 'notes', type: 'update', id: 'a', patch: { body: 'x' } });
    await flush();
    expect(pendingCount()).toBe(0);
  });

  it('flush conserva la cola si hay error de red', async () => {
    result = { data: null, error: { message: 'Failed to fetch' } };
    enqueue({ table: 'notes', type: 'insert', row: { id: 'a' } });
    await flush();
    expect(pendingCount()).toBe(1);
  });

  it('flush no corre si está offline', async () => {
    setOnline(false);
    enqueue({ table: 'notes', type: 'insert', row: { id: 'a' } });
    await flush();
    expect(pendingCount()).toBe(1);
  });
});
