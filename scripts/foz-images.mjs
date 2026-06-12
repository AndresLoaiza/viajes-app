// Curación de imágenes Foz: busca en Wikimedia Commons y valida en browser real
// (regla del proyecto: validar con Playwright naturalWidth>0, nunca con curl/Python).
import { chromium } from 'playwright';

const QUERIES = {
  'cataratas-brasileno': ['Iguazu Falls Brazil panorama', 'Cataratas do Iguaçu Brasil'],
  'passarela-garganta': ["Devil's Throat Iguazu walkway", 'Garganta do Diabo Iguaçu'],
  'parque-das-aves': ['Parque das Aves Foz do Iguaçu', 'Parque das Aves toucan'],
  'itaipu-tour': ['Itaipu Dam', 'Usina Itaipu Binacional'],
  'marco-tres-fronteiras': ['Marco das Três Fronteiras Brasil', 'Triple Frontier obelisk Iguazu'],
  'templo-chen-tien': ['Chen Tien Buddhist Temple Foz', 'Templo Budista Foz do Iguaçu'],
  'mezquita-omar': ['Mosque Omar Ibn Al-Khattab Foz do Iguaçu', 'Mesquita Foz do Iguaçu'],
};

async function searchCommons(query, limit = 6) {
  const url = 'https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*' +
    '&generator=search&gsrnamespace=6&gsrlimit=' + limit +
    '&gsrsearch=' + encodeURIComponent(query + ' filetype:bitmap') +
    '&prop=imageinfo&iiprop=url|mime&iiurlwidth=800';
  await new Promise((r) => setTimeout(r, 2500)); // rate limit de Commons
  const res = await fetch(url, { headers: { 'User-Agent': 'viajes-app-curation/1.0' } });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { console.error(`  rate-limited en "${query}", saltando`); return []; }
  if (!data.query?.pages) return [];
  return Object.values(data.query.pages)
    .sort((a, b) => a.index - b.index)
    .map((p) => p.imageinfo?.[0])
    .filter((ii) => ii && /jpeg|png/.test(ii.mime))
    .map((ii) => ii.thumburl);
}

// Uso: node foz-images.mjs [id1,id2] — sin args procesa todos
const FILTER = process.argv[2]?.split(',');
for (const k of Object.keys(QUERIES)) {
  if (FILTER && !FILTER.includes(k)) delete QUERIES[k];
}

const browser = await chromium.launch();
const page = await browser.newPage();

async function validate(url) {
  try {
    const ok = await page.evaluate((src) => new Promise((resolve) => {
      const img = new Image();
      const t = setTimeout(() => resolve(false), 10000);
      img.onload = () => { clearTimeout(t); resolve(img.naturalWidth > 0); };
      img.onerror = () => { clearTimeout(t); resolve(false); };
      img.src = src;
    }), url);
    return ok;
  } catch { return false; }
}

await page.goto('about:blank');
const out = {};
for (const [placeId, queries] of Object.entries(QUERIES)) {
  const candidates = [];
  for (const q of queries) {
    for (const u of await searchCommons(q)) {
      if (!candidates.includes(u)) candidates.push(u);
    }
  }
  const valid = [];
  for (const u of candidates) {
    if (valid.length >= 3) break;
    if (await validate(u)) valid.push(u);
  }
  out[placeId] = valid;
  console.error(`${placeId}: ${valid.length} válidas de ${candidates.length} candidatas`);
}

console.log(JSON.stringify(out, null, 2));
await browser.close();
