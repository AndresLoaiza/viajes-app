// Smoke test del flujo: gate → identidad → hub → viaje Brasil (Inicio).
import { chromium } from 'playwright';

const BASE = 'http://localhost:5173/viajes-app/';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });

await page.goto(BASE, { waitUntil: 'networkidle' });
await page.screenshot({ path: 'scripts/shot-1-gate.png' });

// Paso 1: código incorrecto → error
await page.fill('#access-code', 'malo');
await page.keyboard.press('Enter');
await page.waitForTimeout(600);
const errVisible = await page.locator('[role="alert"]').isVisible();

// Paso 2: código correcto
await page.fill('#access-code', 'brasil2026');
await page.keyboard.press('Enter');
await page.waitForSelector('text=¿Quién eres?', { timeout: 5000 });
await page.screenshot({ path: 'scripts/shot-2-who.png' });

// Paso 3: elegir Andrés → hub
await page.click('text=Andrés');
await page.waitForSelector('text=Nuestros Viajes', { timeout: 5000 });
await page.waitForTimeout(800);
await page.screenshot({ path: 'scripts/shot-3-hub.png' });

// Paso 4: abrir Brasil → Inicio con countdown
await page.click('text=Brasil');
await page.waitForSelector('text=Faltan', { timeout: 5000 });
await page.waitForTimeout(800);
await page.screenshot({ path: 'scripts/shot-4-inicio.png' });

// Paso 5: Itinerario — agregar plan (escribe en Supabase real) y borrarlo
await page.click('nav >> text=Días');
await page.waitForSelector('text=Agregar plan', { timeout: 5000 });
await page.click('text=Agregar plan');
await page.fill('#it-title', 'SMOKE TEST — borrar');
await page.fill('#it-time', '09:30');
await page.click('text=Agregar al día');
await page.waitForSelector('text=SMOKE TEST — borrar', { timeout: 8000 });
await page.screenshot({ path: 'scripts/shot-5-itinerario.png' });
page.once('dialog', (d) => d.accept());
await page.click('[aria-label="Borrar SMOKE TEST — borrar"]');
await page.waitForSelector('text=SMOKE TEST — borrar', { state: 'detached', timeout: 8000 });
const itinerarioOk = true;

// Paso 5b: Lugares — Foz, categoría, seleccionar y deseleccionar (Supabase real)
await page.click('nav >> text=Lugares');
await page.waitForSelector('text=Marquen lo que les gustaría conocer', { timeout: 5000 });
await page.click('[role="tab"]:has-text("Foz")');
await page.click('text=Cataratas & Naturaleza');
await page.waitForSelector('text=Parque das Aves', { timeout: 5000 });
await page.waitForTimeout(1200); // imágenes
await page.screenshot({ path: 'scripts/shot-6-lugares.png' });
const imgOk = await page.evaluate(() => {
  const imgs = [...document.querySelectorAll('img')];
  return imgs.some((i) => i.naturalWidth > 0);
});
// Toggle selección: tap en el card del Parque das Aves
await page.click('h3:has-text("Parque das Aves")');
await page.waitForSelector('text=Agregar nota', { timeout: 8000 });
await page.click('h3:has-text("Parque das Aves")');
await page.waitForSelector('text=Agregar nota', { state: 'detached', timeout: 8000 });
const lugaresOk = true;

// Paso 6: recarga → entra directo (identidad persistida)
await page.reload({ waitUntil: 'networkidle' });
const directo = await page.locator('text=Nuestros Viajes').first().isVisible();

console.log(JSON.stringify({
  errorConCodigoMalo: errVisible,
  itinerarioCrudOk: itinerarioOk,
  lugaresFotosCargan: imgOk,
  lugaresToggleOk: lugaresOk,
  entraDirectoTrasRecarga: directo,
  erroresJs: errors,
}, null, 2));

await browser.close();
