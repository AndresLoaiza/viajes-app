import { describe, it, expect } from 'vitest';
import {
  fechaLocalPartido, horaLocalPartido, porDefinir, etiquetaFase, marcador, partidosDeFecha, esDeInteres,
  type Partido,
} from './mundial';

const p = (over: Partial<Partido> = {}): Partido => ({
  id: 'm1', ext_id: '1', fase: 'grupos', grupo: 'A', fecha_hora: '2026-06-25T18:00:00Z',
  equipo_local: 'Brazil', equipo_visitante: 'Croatia', bandera_local: null, bandera_visitante: null,
  gol_local_real: null, gol_visitante_real: null, estado: 'programado', ...over,
});

describe('mundial helpers', () => {
  it('fechaLocalPartido pasa UTC a fecha local UTC-3', () => {
    expect(fechaLocalPartido('2026-06-25T18:00:00Z')).toBe('2026-06-25'); // 15:00 local
    // 01:00Z del 26 → 22:00 local del 25
    expect(fechaLocalPartido('2026-06-26T01:00:00Z')).toBe('2026-06-25');
  });

  it('horaLocalPartido devuelve HH:MM en UTC-3', () => {
    expect(horaLocalPartido('2026-06-25T18:00:00Z')).toBe('15:00');
    expect(horaLocalPartido('2026-06-26T01:30:00Z')).toBe('22:30');
  });

  it('porDefinir detecta equipos sin definir', () => {
    expect(porDefinir(p())).toBe(false);
    expect(porDefinir(p({ equipo_local: 'Por definir' }))).toBe(true);
    expect(porDefinir(p({ equipo_visitante: 'Por definir' }))).toBe(true);
  });

  it('etiquetaFase: grupo vs eliminación', () => {
    expect(etiquetaFase(p({ fase: 'grupos', grupo: 'C' }))).toBe('Grupo C');
    expect(etiquetaFase(p({ fase: 'eliminacion', grupo: null }))).toBe('Eliminación');
  });

  it('marcador solo cuando hay goles', () => {
    expect(marcador(p())).toBeNull();
    expect(marcador(p({ gol_local_real: 2, gol_visitante_real: 1 }))).toBe('2 - 1');
    expect(marcador(p({ gol_local_real: 0, gol_visitante_real: 0 }))).toBe('0 - 0');
  });

  it('esDeInteres: solo Colombia/Brasil; TBD se deja', () => {
    expect(esDeInteres(p({ equipo_local: 'Colombia', equipo_visitante: 'Portugal' }))).toBe(true);
    expect(esDeInteres(p({ equipo_local: 'Brazil', equipo_visitante: 'Croatia' }))).toBe(true);
    expect(esDeInteres(p({ equipo_local: 'Japan', equipo_visitante: 'Sweden' }))).toBe(false);
    expect(esDeInteres(p({ equipo_local: 'Por definir', equipo_visitante: 'Por definir', fase: 'eliminacion', grupo: null }))).toBe(true);
  });

  it('partidosDeFecha excluye los que no son Colombia/Brasil', () => {
    const lista = [
      p({ id: 'col', equipo_local: 'Colombia', equipo_visitante: 'Portugal' }),
      p({ id: 'otro', equipo_local: 'Japan', equipo_visitante: 'Sweden' }),
    ];
    expect(partidosDeFecha(lista, '2026-06-25').map((x) => x.id)).toEqual(['col']);
  });

  it('partidosDeFecha filtra por fecha local y ordena por hora', () => {
    const lista = [
      p({ id: 'tarde', fecha_hora: '2026-06-25T22:00:00Z' }), // 19:00 local 25
      p({ id: 'manana', fecha_hora: '2026-06-25T15:00:00Z' }), // 12:00 local 25
      p({ id: 'otroDia', fecha_hora: '2026-06-27T18:00:00Z' }),
    ];
    const res = partidosDeFecha(lista, '2026-06-25');
    expect(res.map((x) => x.id)).toEqual(['manana', 'tarde']);
  });
});
