// Geocodifica los lugares estáticos (rio/sp/foz) usando el texto del mapsUrl
// y escribe src/data/cities/coords.ts = Record<placeId, [lat, lng]>.
// Idempotente: relee coords.ts existente y solo geocodifica los que falten
// (o todos con --force). Rate-limit 1.1s (Nominatim).
//
// Uso: node scripts/geocode-places.mjs [--force]
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const FORCE = process.argv.includes('--force');
const FILES = ['rio', 'sp', 'foz'];
const CITY = { rio: 'Rio de Janeiro', sp: 'São Paulo', foz: 'Foz do Iguaçu' };

// viewbox = lon_oeste,lat_norte,lon_este,lat_sur. Con bounded=1 Nominatim
// SOLO devuelve resultados dentro de la caja → mata falsos positivos en otras
// regiones/países (ej. "So Lo Cafe" en México, "Liberdade" en Sorocaba).
const BOX = {
  rio: [-43.85, -22.75, -43.05, -23.10],
  sp:  [-47.00, -23.35, -46.25, -24.05], // incluye Cotia (Zu Lai) y Santos (Museu do Café)
  foz: [-54.66, -25.38, -54.40, -25.72], // incluye Cataratas, Itaipu, Marco 3 Fronteiras
};

// Landmarks que Nominatim no ubica bien por estar dentro de otro edificio o por
// nombre comercial. Coordenadas públicas verificadas del lugar.
const OVERRIDE = {
  masp: [-23.561414, -46.655881],            // Av. Paulista 1578
  'mac-usp': [-23.587862, -46.657747],       // MAC USP Ibirapuera
  'itau-cultural': [-23.566412, -46.652299], // Av. Paulista 149
  'megafauna-copan': [-23.546233, -46.643012], // Edifício Copan
  'bar-do-cofre': [-23.545776, -46.634099],  // dentro de Farol Santander
  'cataratas-brasileno': [-25.695278, -54.436389],
  'passarela-garganta': [-25.690833, -54.444167],
  'rafain-churrascaria': [-25.515278, -54.560833],
  liberdade: [-23.5587, -46.6347],            // Praça da Liberdade
  malecon: [-22.9712, -43.1822],              // Calçadão de Copacabana (Av. Atlântica)
  'paddle-amanecer': [-22.9876, -43.1885],    // Praia de Copacabana, Posto 6
  'roxy-show': [-22.9709, -43.1858],          // Av. N. Sra. de Copacabana 945
};
const OUT = new URL('../src/data/cities/coords.ts', import.meta.url);
const UA = { 'User-Agent': 'viajes-app/1.0 (andres.9438@gmail.com)' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// id ↔ query del mapsUrl, sin cruzar al siguiente objeto (negative lookahead).
const RE = /\bid:\s*'([^']+)'(?:(?!\bid:)[\s\S])*?mapsUrl:\s*'[^']*[?&]query=([^'&]+)/g;

function extract(city) {
  const src = readFileSync(new URL(`../src/data/cities/${city}.ts`, import.meta.url), 'utf8');
  const out = [];
  for (const m of src.matchAll(RE)) {
    out.push({ id: m[1], city, query: decodeURIComponent(m[2].replace(/\+/g, ' ')) });
  }
  return out;
}

async function geoOne(q, box) {
  const vb = `&viewbox=${box.join(',')}&bounded=1`;
  const r = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1&accept-language=es${vb}`,
    { headers: UA },
  );
  const a = await r.json();
  return a[0] ? [Math.round(+a[0].lat * 1e6) / 1e6, Math.round(+a[0].lon * 1e6) / 1e6] : null;
}

// Override manual → query completo → primer-segmento + ciudad → primer-segmento.
// Todo restringido al viewbox de la ciudad (bounded).
async function geo(p) {
  if (OVERRIDE[p.id]) return OVERRIDE[p.id];
  const box = BOX[p.city];
  const segs = p.query.split(',').map((s) => s.trim());
  const first = segs[0];
  // segmento que parece dirección de calle (geocodifica mejor que el nombre comercial)
  const street = segs.find((s) => /^(Rua|Av|Avenida|Pra(ia|ça)|Cal[çc]ad|Estrada|Largo)/i.test(s));
  const cands = [...new Set([
    p.query,
    street && `${street}, ${CITY[p.city]}`,
    `${first}, ${CITY[p.city]}`,
    first,
  ].filter(Boolean))];
  for (const q of cands) {
    const c = await geoOne(q, box);
    await sleep(1100);
    if (c) return c;
  }
  return null;
}

// coords previas (para no re-geocodificar)
let prev = {};
if (existsSync(OUT) && !FORCE) {
  const txt = readFileSync(OUT, 'utf8');
  const mm = txt.match(/'([^']+)':\s*\[([-\d.]+),\s*([-\d.]+)\]/g) || [];
  for (const line of mm) {
    const m = line.match(/'([^']+)':\s*\[([-\d.]+),\s*([-\d.]+)\]/);
    if (m) prev[m[1]] = [+m[2], +m[3]];
  }
}

const all = {};
const seen = new Set();
let done = 0, fail = 0, skip = 0;
for (const city of FILES) {
  for (const p of extract(city)) {
    if (seen.has(p.id)) { console.warn(`DUP id "${p.id}" (${city}) — se sobreescribe`); }
    seen.add(p.id);
    if (prev[p.id]) { all[p.id] = prev[p.id]; skip++; continue; }
    const c = await geo(p);
    if (c) { all[p.id] = c; done++; console.log(`OK  ${p.id}  ${c[0]},${c[1]}`); }
    else { fail++; console.log(`FAIL ${p.id}  "${p.query}"`); }
  }
}

const body = Object.keys(all).sort().map((id) => `  '${id}': [${all[id][0]}, ${all[id][1]}],`).join('\n');
const ts = `// GENERADO por scripts/geocode-places.mjs — no editar a mano.\n`
  + `// Coordenadas [lat, lng] de los lugares estáticos, geocodificadas con Nominatim.\n`
  + `export const placeCoords: Record<string, [number, number]> = {\n${body}\n};\n`;
writeFileSync(OUT, ts);
console.log(`\nlugares: ${done} geocodificados, ${skip} cacheados, ${fail} sin coords. total ${Object.keys(all).length}`);
