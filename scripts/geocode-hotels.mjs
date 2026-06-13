// Geocodifica los hoteles (columna address) y guarda lat/lon en la tabla hotels.
// Requiere columnas hotels.lat/lon (migración 2026-06-13). Anon key basta (UPDATE, RLS abierto).
// Rate-limit 1.1s (Nominatim). Intenta: address completa → address sin CEP → nombre.
//
// Uso: node scripts/geocode-hotels.mjs
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]),
);
const sb = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);
const UA = { 'User-Agent': 'viajes-app/1.0 (andres.9438@gmail.com)' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function geo(q) {
  const r = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1&accept-language=es`,
    { headers: UA },
  );
  const a = await r.json();
  return a[0] ? [+a[0].lat, +a[0].lon] : null;
}

const { data: hotels, error } = await sb.from('hotels').select('id,name,address,lat');
if (error) { console.error(error.message); process.exit(1); }

let ok = 0, fail = 0;
for (const h of hotels) {
  if (h.lat != null) { console.log('skip', h.name); continue; }
  const noCep = (h.address ?? '').replace(/,?\s*CEP\s*[\d-]+/i, '').trim();
  const cands = [h.address, noCep, h.name].filter(Boolean);
  let c = null;
  for (const q of cands) { c = await geo(q); await sleep(1100); if (c) break; }
  if (c) { await sb.from('hotels').update({ lat: c[0], lon: c[1] }).eq('id', h.id); ok++; console.log('OK', h.name, c.map((n) => n.toFixed(5)).join(',')); }
  else { fail++; console.log('FAIL', h.name); }
}
console.log(`\nhoteles: ${ok} geocodificados, ${fail} sin coords`);
