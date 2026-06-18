import { useEffect, useState } from 'react';
import { supabase } from './supabase';

// Partidos del Mundial: comparten Supabase con la Polla (tabla `polla_partidos`,
// lectura anon abierta). La Polla sincroniza la tabla por cron desde
// football-data.org, así que los partidos "Por definir" (eliminación) se
// actualizan solos cuando se sabe quién juega. Aquí solo LEEMOS.

export type FasePartido = 'grupos' | 'eliminacion';
export type EstadoPartido = 'programado' | 'en_juego' | 'finalizado';

export interface Partido {
  id: string;
  ext_id: string;
  fase: FasePartido;
  grupo: string | null;
  fecha_hora: string;            // ISO UTC
  equipo_local: string;
  equipo_visitante: string;
  bandera_local: string | null;
  bandera_visitante: string | null;
  gol_local_real: number | null;
  gol_visitante_real: number | null;
  estado: EstadoPartido;
}

const TBD = 'Por definir';
// Brasil y Argentina están en UTC-3 (sin horario de verano en estas fechas).
const TZ_OFFSET_MS = 3 * 60 * 60 * 1000;

/** Fecha local (Brasil/Argentina, UTC-3) de un partido → 'YYYY-MM-DD'. */
export function fechaLocalPartido(iso: string): string {
  return new Date(Date.parse(iso) - TZ_OFFSET_MS).toISOString().slice(0, 10);
}

/** Hora local (UTC-3) de un partido → 'HH:MM'. */
export function horaLocalPartido(iso: string): string {
  return new Date(Date.parse(iso) - TZ_OFFSET_MS).toISOString().slice(11, 16);
}

/** True si aún no se sabe alguno de los equipos (eliminación por definir). */
export function porDefinir(p: Partido): boolean {
  return p.equipo_local === TBD || p.equipo_visitante === TBD;
}

/** Etiqueta corta de la fase/grupo: "Grupo A" / "Eliminación". */
export function etiquetaFase(p: Partido): string {
  return p.fase === 'grupos' && p.grupo ? `Grupo ${p.grupo}` : 'Eliminación';
}

/** Marcador "2 - 1" si ya hay goles, o null. */
export function marcador(p: Partido): string | null {
  if (p.gol_local_real == null || p.gol_visitante_real == null) return null;
  return `${p.gol_local_real} - ${p.gol_visitante_real}`;
}

/** Partidos de una fecha local concreta ('YYYY-MM-DD'), ordenados por hora. */
export function partidosDeFecha(partidos: Partido[], fecha: string): Partido[] {
  return partidos
    .filter((p) => fechaLocalPartido(p.fecha_hora) === fecha)
    .sort((a, b) => a.fecha_hora.localeCompare(b.fecha_hora));
}

/** Lee `polla_partidos` (todos) + realtime. Sin filtro de viaje: es el fixture global. */
export function useMundial() {
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase.from('polla_partidos').select('*').then(({ data }) => {
      if (!active) return;
      if (data) setPartidos(data as Partido[]);
      setLoading(false);
    });
    const channel = supabase
      .channel('polla_partidos:viajes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'polla_partidos' }, (payload) => {
        const row = payload.new as Partido;
        setPartidos((prev) => {
          if (payload.eventType === 'DELETE') {
            return prev.filter((p) => p.id !== (payload.old as Partido).id);
          }
          return prev.some((p) => p.id === row.id)
            ? prev.map((p) => (p.id === row.id ? row : p))
            : [...prev, row];
        });
      })
      .subscribe();
    return () => { active = false; supabase.removeChannel(channel); };
  }, []);

  return { partidos, loading };
}
