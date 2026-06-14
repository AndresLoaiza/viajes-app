// Capa de mutación tolerante a offline. Online: idéntico a hoy (devuelve la fila
// del servidor). Offline / fallo de red: encola en el outbox y deja que el caller
// aplique la fila optimista. Inserts deben traer `id` (uuid de cliente) → estable.
import { supabase } from './supabase';
import { enqueue, flush, isNetwork } from './outbox';

export { uuid } from './outbox';

export interface MutateResult {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;          // fila del servidor si online; null si quedó encolado
  queued: boolean;    // true = sin red, guardado para sincronizar luego
  error: string | null; // error REAL (no de red), ej. permisos
}

import type { NewOutboxItem } from './outbox';
export type Op = NewOutboxItem;

async function run(op: Op): Promise<MutateResult> {
  if (op.type === 'insert') {
    const q = await supabase.from(op.table).insert(op.row).select().single();
    return { data: q.data, queued: false, error: q.error?.message ?? null };
  }
  if (op.type === 'update') {
    const q = await supabase.from(op.table).update(op.patch).eq('id', op.id).select().single();
    return { data: q.data, queued: false, error: q.error?.message ?? null };
  }
  const q = await supabase.from(op.table).delete().eq('id', op.id);
  return { data: null, queued: false, error: q.error?.message ?? null };
}

function queue(op: Op): void {
  if (op.type === 'insert') enqueue({ table: op.table, type: 'insert', row: op.row });
  else if (op.type === 'update') enqueue({ table: op.table, type: 'update', id: op.id, patch: op.patch });
  else enqueue({ table: op.table, type: 'delete', id: op.id });
}

/**
 * Ejecuta la mutación con tolerancia offline.
 * - Online OK → { data: fila servidor, queued:false }.
 * - Sin red / fallo de red → encola → { data:null, queued:true }. El caller aplica su fila optimista.
 * - Error real (permisos, etc.) → { error } y NO encola.
 */
export async function mutate(op: Op): Promise<MutateResult> {
  if (!navigator.onLine) { queue(op); return { data: null, queued: true, error: null }; }
  try {
    const res = await run(op);
    if (res.error && isNetwork(res.error)) { queue(op); return { data: null, queued: true, error: null }; }
    if (!res.error) void flush(); // de paso, drena pendientes
    return res;
  } catch (e) {
    if (isNetwork(String(e))) { queue(op); return { data: null, queued: true, error: null }; }
    return { data: null, queued: false, error: String(e) };
  }
}
