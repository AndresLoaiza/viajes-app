// Importa las decisiones de Melisa (carpeta ../../respuestas, flujo viejo de
// gists) a place_selections para que aparezcan en vivo en Lugares y Mapa.
// Mapea el nombre del lugar -> id del catálogo (src/data/cities/*.ts).
// Idempotente: no duplica una selección ya existente.
//
// Uso:  node scripts/import-respuestas-melisa.mjs
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';

const TRIP = 'brasil-2026';
const WHO = 'melisa';
const RESP = new URL('../../respuestas/', import.meta.url);

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]),
);
const sb = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

/** name -> id del catálogo de una ciudad (lee el .ts como texto). */
function nameToId(cityFile) {
  const txt = readFileSync(new URL(`../src/data/cities/${cityFile}`, import.meta.url), 'utf8');
  const map = new Map();
  // id en una línea, name en la siguiente (places). Las categorías van en 1 línea → no matchean.
  const re = /id:\s*'([^']+)',\s*\n\s*name:\s*'([^']+)'/g;
  let m;
  while ((m = re.exec(txt))) map.set(m[2], m[1]);
  return map;
}

// Ciudad en la respuesta -> (city_id app, archivo de catálogo, json más reciente)
const FUENTES = [
  { city_id: 'rio', file: 'rio.ts', json: 'Melisa-rio-2026-06-06-19-48.json' },
  { city_id: 'sp', file: 'sp.ts', json: 'Melisa-sp-2026-06-10-01-03.json' },
];

// Selecciones ya existentes de Melisa (para no duplicar).
const { data: prev } = await sb.from('place_selections')
  .select('city_id, place_id').eq('trip_id', TRIP).eq('selected_by', WHO);
const yaHay = new Set((prev ?? []).map((r) => `${r.city_id}:${r.place_id}`));

const filas = [];
const noMatch = [];
for (const f of FUENTES) {
  const idByName = nameToId(f.file);
  const payload = JSON.parse(readFileSync(new URL(f.json, RESP), 'utf8'));
  for (const sel of payload.selections) {
    const id = idByName.get(sel.place);
    if (!id) { noMatch.push(`${f.city_id}: ${sel.place}`); continue; }
    if (yaHay.has(`${f.city_id}:${id}`)) continue;
    filas.push({
      id: randomUUID(), trip_id: TRIP, city_id: f.city_id, place_id: id,
      selected_by: WHO, note: sel.notes || null, preferred_dates: [],
      created_at: new Date().toISOString(),
    });
  }
}

if (noMatch.length) console.log('⚠️  Sin match en el catálogo:\n  - ' + noMatch.join('\n  - '));
if (filas.length === 0) { console.log('Nada nuevo para importar.'); process.exit(0); }

const { error } = await sb.from('place_selections').insert(filas);
if (error) { console.error('Error:', error.message); process.exit(1); }
const porCity = filas.reduce((a, r) => ((a[r.city_id] = (a[r.city_id] ?? 0) + 1), a), {});
console.log(`Importadas ${filas.length} selecciones de Melisa:`, porCity);
