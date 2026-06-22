// Agrega los vuelos internacionales Colombia<->Brasil (reserva LATAM AMJYHH) y
// enriquece el vuelo GOL Rio->Foz con su número y código de check-in (voucher
// Despegar 63024345300). Idempotente: no duplica.
//
// Uso:  node scripts/seed-vuelos-internacionales.mjs
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';

const TRIP = 'brasil-2026';
const BY = 'andres';
const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]),
);
const sb = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

// Hora LOCAL del aeropuerto como UTC ficticio ('...T18:15:00Z'); se muestra por slice.
const NUEVOS = [
  {
    airline: 'LATAM', flight_number: 'LA 2393', confirmation: 'AMJYHH',
    from_city: 'Medellín (MDE)', to_city: 'Lima (LIM)',
    departs_at: '2026-06-24T18:15:00Z', arrives_at: '2026-06-24T21:25:00Z',
    note: 'David Andrés · ida a Brasil vía Lima · reserva AMJYHH · llegar 3h antes',
  },
  {
    airline: 'LATAM', flight_number: 'LA 2404', confirmation: 'AMJYHH',
    from_city: 'Lima (LIM)', to_city: 'Río de Janeiro (GIG)',
    departs_at: '2026-06-24T23:10:00Z', arrives_at: '2026-06-25T06:20:00Z',
    note: 'David Andrés · vuelo nocturno, llega 25 jun 06:20 · reserva AMJYHH',
  },
  {
    airline: 'LATAM', flight_number: 'LA 4908', confirmation: 'AMJYHH',
    from_city: 'São Paulo (GRU)', to_city: 'Bogotá (BOG)',
    departs_at: '2026-07-03T23:45:00Z', arrives_at: '2026-07-04T03:55:00Z',
    note: 'David Andrés · regreso, sale 3 jul 23:45 llega 4 jul 03:55 · Terminal 3 · reserva AMJYHH',
  },
  {
    airline: 'LATAM', flight_number: 'LA 4006', confirmation: 'AMJYHH',
    from_city: 'Bogotá (BOG)', to_city: 'Medellín (MDE)',
    departs_at: '2026-07-04T08:20:00Z', arrives_at: '2026-07-04T09:20:00Z',
    note: 'David Andrés · último tramo a casa · Terminal 1 · reserva AMJYHH',
  },
];

// 1) Enriquecer el GOL Rio->Foz existente con nº de vuelo + check-in.
const { data: gol } = await sb.from('flights').select('id, flight_number, confirmation')
  .eq('trip_id', TRIP).eq('airline', 'GOL').ilike('to_city', '%Foz%').limit(1);
if (gol?.[0] && (!gol[0].flight_number || !gol[0].confirmation)) {
  const { error } = await sb.from('flights').update({
    flight_number: '1866', confirmation: 'CHCUJX',
    note: 'Andrés y Melisa · mochila + equipaje de mano (sin despachar) · reserva Despegar 63024345300',
  }).eq('id', gol[0].id);
  console.log('GOL Rio->Foz:', error ? error.message : 'actualizado (1866 / CHCUJX)');
} else {
  console.log('GOL Rio->Foz: ya tenía datos o no se encontró.');
}

// 2) Insertar los internacionales que falten (por nº de vuelo).
const { data: exist } = await sb.from('flights').select('flight_number').eq('trip_id', TRIP);
const yaHay = new Set((exist ?? []).map((f) => f.flight_number));
const filas = NUEVOS.filter((f) => !yaHay.has(f.flight_number)).map((f) => ({
  id: randomUUID(), trip_id: TRIP, created_by: BY, created_at: new Date().toISOString(), ...f,
}));
if (filas.length === 0) {
  console.log('Internacionales: ya estaban todos.');
} else {
  const { error } = await sb.from('flights').insert(filas);
  console.log('Internacionales:', error ? error.message : `insertados ${filas.length} (${filas.map((f) => f.flight_number).join(', ')})`);
}
