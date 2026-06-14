import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

let result: { data: unknown; error: { message: string } | null } = { data: null, error: null };
const chain: Record<string, unknown> = {};
['insert', 'update', 'delete', 'upsert', 'select', 'eq'].forEach((m) => { chain[m] = () => chain; });
chain.single = () => Promise.resolve(result);
chain.then = (res: (v: unknown) => unknown) => Promise.resolve(result).then(res);
vi.mock('./supabase', () => ({ supabase: { from: () => chain } }));

import { mutate } from './mutate';
import { pendingCount } from './outbox';

function setOnline(v: boolean) {
  Object.defineProperty(navigator, 'onLine', { configurable: true, value: v });
}

describe('mutate', () => {
  beforeEach(() => { localStorage.clear(); result = { data: null, error: null }; setOnline(true); });
  afterEach(() => setOnline(true));

  it('online OK → devuelve fila del servidor, no encola', async () => {
    result = { data: { id: 'srv', body: 'hola' }, error: null };
    const r = await mutate({ table: 'notes', type: 'insert', row: { id: 'srv', body: 'hola' } });
    expect(r.queued).toBe(false);
    expect(r.data).toEqual({ id: 'srv', body: 'hola' });
    expect(pendingCount()).toBe(0);
  });

  it('offline → encola y marca queued, sin error', async () => {
    setOnline(false);
    const r = await mutate({ table: 'notes', type: 'insert', row: { id: 'a', body: 'x' } });
    expect(r.queued).toBe(true);
    expect(r.data).toBeNull();
    expect(r.error).toBeNull();
    expect(pendingCount()).toBe(1);
  });

  it('error de red online → encola (queued)', async () => {
    result = { data: null, error: { message: 'TypeError: Failed to fetch' } };
    const r = await mutate({ table: 'notes', type: 'update', id: 'a', patch: { body: 'y' } });
    expect(r.queued).toBe(true);
    expect(pendingCount()).toBe(1);
  });

  it('error real (permisos) → no encola, devuelve error', async () => {
    result = { data: null, error: { message: 'permission denied for table' } };
    const r = await mutate({ table: 'notes', type: 'delete', id: 'a' });
    expect(r.queued).toBe(false);
    expect(r.error).toMatch(/permission/);
    expect(pendingCount()).toBe(0);
  });
});
