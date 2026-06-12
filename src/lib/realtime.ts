import { useEffect, useState } from 'react';
import { supabase } from './supabase';

type ChangePayload = {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: Record<string, unknown>;
  old: Record<string, unknown>;
};

export function applyChange<T extends { id: string }>(rows: T[], p: ChangePayload): T[] {
  switch (p.eventType) {
    case 'INSERT': {
      const row = p.new as T;
      return rows.some(r => r.id === row.id) ? rows : [...rows, row];
    }
    case 'UPDATE': {
      const row = p.new as T;
      return rows.map(r => (r.id === row.id ? row : r));
    }
    case 'DELETE':
      return rows.filter(r => r.id !== (p.old as T).id);
  }
}

/** Select inicial + subscripción realtime, filtrado por trip_id. */
export function useTable<T extends { id: string }>(table: string, tripId: string) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase.from(table).select('*').eq('trip_id', tripId)
      .then(({ data }) => {
        if (active && data) setRows(data as T[]);
        if (active) setLoading(false);
      });
    const channel = supabase
      .channel(`${table}:${tripId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table, filter: `trip_id=eq.${tripId}` },
        payload => setRows(prev => applyChange(prev, payload as unknown as ChangePayload)))
      .subscribe();
    return () => { active = false; supabase.removeChannel(channel); };
  }, [table, tripId]);

  return { rows, loading };
}
