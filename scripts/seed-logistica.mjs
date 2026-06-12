// Seed de logística Brasil 2026: sube boletas PDF al bucket `docs` e inserta
// vuelos, hoteles y boletas en Supabase. Idempotente: aborta si ya hay datos
// del viaje (usar --force para borrar y re-insertar).
//
// Uso:  node scripts/seed-logistica.mjs [--force]
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

const TRIP = 'brasil-2026';
const FORCE = process.argv.includes('--force');

// .env manual (sin dep dotenv)
const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n')
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]),
);

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

// ── Boletas PDF: local → bucket docs ────────────────────────────────────────
const PDFS = [
  { local: 'D:/Download/vouchers-249083ff-6360-42d5-bd04-2d17a0c86bd4.pdf', remote: `${TRIP}/roxy-dinner-show.pdf` },
  { local: 'D:/Download/reserva-910b35b8-3092-4ad6-800d-d23e5f9b7593.pdf', remote: `${TRIP}/gran-aventura.pdf` },
  { local: 'D:/Download/TQHR3S.pdf', remote: `${TRIP}/recorrido-nocturno.pdf` },
];

// ── Datos ───────────────────────────────────────────────────────────────────
// departs_at/arrives_at: hora LOCAL del aeropuerto guardada como UTC ficticio
// ('Z'). El display hace slice del string — nunca convertir con Date local.
const flights = [
  {
    trip_id: TRIP, airline: 'GOL', flight_number: null, confirmation: null,
    from_city: 'Rio de Janeiro', to_city: 'Foz do Iguaçu',
    departs_at: '2026-06-28T17:10:00Z', arrives_at: '2026-06-28T19:25:00Z',
    note: 'COP $385.400 por persona · $770.800 total · Comprado por Despegar',
    created_by: 'andres',
  },
  {
    trip_id: TRIP, airline: 'LATAM', flight_number: null, confirmation: null,
    from_city: 'Foz do Iguaçu', to_city: 'São Paulo',
    departs_at: '2026-06-30T19:40:00Z', arrives_at: '2026-06-30T21:25:00Z',
    note: 'COP $390.700 por persona · $781.400 total',
    created_by: 'andres',
  },
];

const hotels = [
  {
    trip_id: TRIP, name: 'Mirador Rio Copacabana Hotel', city_id: 'rio',
    address: 'Rua Toneleros, 338, Copacabana, Río de Janeiro, CEP 22030-002, Brasil',
    check_in: '2026-06-24', check_out: '2026-06-28',
    confirmation: '5881146630 · PIN 0261',
    note: 'Booking · COP $1.023.600 · ⚠️ Sin pagar',
    created_by: 'andres',
  },
  {
    trip_id: TRIP, name: 'VELINN Hotel Natureza Foz', city_id: 'foz',
    address: 'Rua Maximino Tosi, 253, Foz do Iguaçu, CEP 85864-030, Brasil',
    check_in: '2026-06-28', check_out: '2026-06-30',
    confirmation: '6483664491 · PIN 9798',
    note: 'Booking · COP $254.340 · Pagado',
    created_by: 'andres',
  },
  {
    trip_id: TRIP, name: 'ISONDU Suites & Breakfast', city_id: 'foz',
    address: 'Uruguay 592, 3370 Puerto Iguazú, Argentina',
    check_in: '2026-06-29', check_out: '2026-06-30',
    confirmation: '5660266733 · PIN 9817',
    note: 'Booking · COP $175.380 · Lado argentino (noche del recorrido nocturno)',
    created_by: 'andres',
  },
  {
    trip_id: TRIP, name: 'Sooz Hotel Collection', city_id: 'sp',
    address: 'Av São Luiz, 234 - Republica, São Paulo, CEP 01046-914, Brasil',
    check_in: '2026-06-30', check_out: '2026-07-03',
    confirmation: '5102716495 · PIN 7530',
    note: 'Booking · COP $823.080 · Pagado',
    created_by: 'andres',
  },
];

const tickets = [
  {
    trip_id: TRIP, title: 'Roxy Dinner Show', date: '2026-06-25', time: '19:00',
    file_path: `${TRIP}/roxy-dinner-show.pdf`,
    note: 'Rio de Janeiro · Mesa C41, asientos 1 y 2 · Vouchers XUYZC4D2 (clave CJ2R4H) y QCA26QNA (clave 2FUDRB) · Pagado',
    created_by: 'andres',
  },
  {
    trip_id: TRIP, title: 'Gran Aventura', date: '2026-06-29', time: '10:15',
    file_path: `${TRIP}/gran-aventura.pdf`,
    note: 'Parque Iguazú (Puerto Iguazú) · Reserva #00096542 · Pagado',
    created_by: 'andres',
  },
  {
    trip_id: TRIP, title: 'Recorrido nocturno', date: '2026-06-29', time: '19:45',
    file_path: `${TRIP}/recorrido-nocturno.pdf`,
    note: 'Parque Iguazú (Puerto Iguazú) · Localizador TQHR3S · Pagado',
    created_by: 'andres',
  },
  {
    trip_id: TRIP, title: 'Entrada Parque Iguazú', date: '2026-06-29', time: null,
    file_path: null,
    note: 'Puerto Iguazú · Comprar en https://ventaweb.apn.gob.ar/reserva/IGR · ⚠️ Sin comprar',
    created_by: 'andres',
  },
];

// ── Ejecución ───────────────────────────────────────────────────────────────
async function main() {
  for (const table of ['flights', 'hotels', 'tickets']) {
    const { count, error } = await supabase
      .from(table).select('id', { count: 'exact', head: true }).eq('trip_id', TRIP);
    if (error) throw new Error(`${table}: ${error.message}`);
    if (count > 0 && !FORCE) {
      console.error(`${table} ya tiene ${count} filas para ${TRIP}. Usa --force para re-seedear.`);
      process.exit(1);
    }
    if (count > 0 && FORCE) {
      const { error: delErr } = await supabase.from(table).delete().eq('trip_id', TRIP);
      if (delErr) throw new Error(`delete ${table}: ${delErr.message}`);
      console.log(`${table}: ${count} filas borradas`);
    }
  }

  for (const { local, remote } of PDFS) {
    const buf = readFileSync(local);
    const { error } = await supabase.storage.from('docs')
      .upload(remote, buf, { contentType: 'application/pdf', upsert: true });
    if (error) throw new Error(`upload ${remote}: ${error.message}`);
    console.log(`subido: docs/${remote} (${(buf.length / 1024).toFixed(0)} KB)`);
  }

  for (const [table, rows] of [['flights', flights], ['hotels', hotels], ['tickets', tickets]]) {
    const { error } = await supabase.from(table).insert(rows);
    if (error) throw new Error(`insert ${table}: ${error.message}`);
    console.log(`${table}: ${rows.length} filas insertadas`);
  }

  console.log('Seed completo ✓');
}

main().catch((e) => { console.error(e.message); process.exit(1); });
