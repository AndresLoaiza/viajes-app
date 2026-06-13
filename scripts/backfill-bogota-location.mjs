// Backfill lat/lon/place en photos (trip bogota-2026) desde el EXIF/geocode ya extraído.
// Requiere que la migración 2026-06-13-photos-location.sql esté aplicada (columnas lat/lon/place).
// Lee %TEMP%/bogota-geo.json (generado por la extracción EXIF + Nominatim).
// Mueve el lugar de `caption` → `place` y deja caption en null (nota libre).
//
// Uso: node scripts/backfill-bogota-location.mjs
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const TRIP = 'bogota-2026';
const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n')
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]),
);
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

const rows = JSON.parse(readFileSync(join(tmpdir(), 'bogota-geo.json'), 'utf8'));

let ok = 0, err = 0;
for (const r of rows) {
  const place = r.place && !String(r.place).startsWith('ERR') ? r.place : null;
  const { error } = await supabase
    .from('photos')
    .update({ lat: r.lat ?? null, lon: r.lon ?? null, place, caption: null })
    .eq('trip_id', TRIP)
    .eq('file_path', r.file_path);
  if (error) { console.log('ERR', r.file_path, error.message); err++; }
  else ok++;
}
console.log(`backfill: ${ok} ok, ${err} errores`);
