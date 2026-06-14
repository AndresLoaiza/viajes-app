// Cola de escritura offline (outbox). Cuando no hay red, las mutaciones se
// guardan acá y se reintentan al reconectar. Replay idempotente (upsert por id).
import { supabase } from './supabase';

export type OutboxItem =
  | { key: string; ts: number; table: string; type: 'insert'; row: Record<string, unknown> }
  | { key: string; ts: number; table: string; type: 'update'; id: string; patch: Record<string, unknown> }
  | { key: string; ts: number; table: string; type: 'delete'; id: string };

const KEY = 'viajes-outbox';
const listeners = new Set<() => void>();
let flushing = false;

function read(): OutboxItem[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}
function write(items: OutboxItem[]) {
  try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* cuota → ignorar */ }
  listeners.forEach((l) => l());
}

export function uuid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  // fallback (entornos sin crypto.randomUUID)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export type NewOutboxItem =
  | { table: string; type: 'insert'; row: Record<string, unknown> }
  | { table: string; type: 'update'; id: string; patch: Record<string, unknown> }
  | { table: string; type: 'delete'; id: string };

export function enqueue(item: NewOutboxItem): void {
  const items = read();
  items.push({ ...item, key: uuid(), ts: Date.now() } as OutboxItem);
  write(items);
}

export function pendingCount(): number {
  return read().length;
}

export function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

async function replay(item: OutboxItem): Promise<boolean> {
  // Devuelve true si se procesó (quitar de la cola), false si fue error de red (reintentar luego).
  try {
    if (item.type === 'insert') {
      const { error } = await supabase.from(item.table).upsert(item.row);
      if (error && isNetwork(error.message)) return false;
      return true; // ok o error definitivo (no reintentar para no bloquear la cola)
    }
    if (item.type === 'update') {
      const { error } = await supabase.from(item.table).update(item.patch).eq('id', item.id);
      if (error && isNetwork(error.message)) return false;
      return true;
    }
    // delete
    const { error } = await supabase.from(item.table).delete().eq('id', item.id);
    if (error && isNetwork(error.message)) return false;
    return true;
  } catch (e) {
    return !isNetwork(String(e)); // throw de red → reintentar (false); otro → descartar (true)
  }
}

export function isNetwork(msg: string): boolean {
  return !navigator.onLine || /fetch|network|Failed to fetch|NetworkError/i.test(msg);
}

/** Reintenta la cola en orden. Para en el primer error de red. */
export async function flush(): Promise<void> {
  if (flushing || !navigator.onLine) return;
  flushing = true;
  try {
    let items = read();
    while (items.length) {
      const item = items[0];
      const done = await replay(item);
      if (!done) break; // sigue offline → reintentar después
      items = read().filter((x) => x.key !== item.key);
      write(items);
    }
  } finally {
    flushing = false;
  }
}

/** Engancha el flush automático: al cargar, al reconectar y cada 30s. */
export function startOutbox(): void {
  if (typeof window === 'undefined') return;
  window.addEventListener('online', () => { void flush(); });
  setInterval(() => { if (navigator.onLine && pendingCount() > 0) void flush(); }, 30_000);
  void flush();
}
