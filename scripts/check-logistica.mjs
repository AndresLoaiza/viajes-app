// Check visual del módulo Logística: gate → hub → Brasil → tab Logística.
import { chromium } from 'playwright';

const BASE = 'http://localhost:5173/viajes-app/';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });

await page.goto(BASE, { waitUntil: 'networkidle' });
await page.fill('#access-code', 'brasil2026');
await page.keyboard.press('Enter');
await page.waitForSelector('text=¿Quién eres?', { timeout: 5000 });
await page.click('text=Andrés');
await page.waitForSelector('text=Nuestros Viajes', { timeout: 5000 });
await page.click('text=Brasil');
await page.waitForSelector('text=Faltan', { timeout: 5000 });

// Tab Logística (label del nav: "Vuelos")
await page.click('nav >> text=Vuelos');
await page.waitForSelector('text=Hoteles', { timeout: 5000 });
await page.waitForTimeout(1500); // datos de Supabase
await page.screenshot({ path: 'scripts/shot-7-logistica-vuelos.png' });

// Verificar datos seed
for (const txt of ['GOL', 'LATAM', 'Mirador Rio Copacabana Hotel', 'Roxy Dinner Show', 'Sin pagar']) {
  const visible = await page.locator(`text=${txt}`).first().isVisible().catch(() => false);
  console.log(`${visible ? '✓' : '✗'} ${txt}`);
}

// Scroll a hoteles y boletas
await page.locator('text=Sooz Hotel Collection').scrollIntoViewIfNeeded();
await page.screenshot({ path: 'scripts/shot-8-logistica-hoteles.png' });
await page.locator('text=Entrada Parque Iguazú').scrollIntoViewIfNeeded();
await page.screenshot({ path: 'scripts/shot-9-logistica-boletas.png' });

// "Ver boleta" de PDF debe ser link a pestaña nueva (visor nativo)
const href = await page.locator('a:has-text("Ver boleta")').first().getAttribute('href');
console.log(href?.includes('/storage/v1/object/public/docs/') ? '✓ link boleta PDF' : `✗ link boleta: ${href}`);

// CRUD: agregar vuelo de prueba y borrarlo (escribe en Supabase real)
await page.locator('[aria-label="Agregar a Vuelos"]').click();
await page.fill('#fl-from', 'Medellín');
await page.fill('#fl-to', 'Rio de Janeiro');
await page.fill('#fl-date', '2026-06-24');
await page.fill('#fl-dep', '10:00');
await page.fill('#fl-air', 'TEST');
await page.click('button:has-text("Agregar vuelo")');
await page.waitForSelector('text=Medellín', { timeout: 5000 });
console.log('✓ vuelo de prueba agregado');
page.on('dialog', (d) => d.accept());
await page.locator('[aria-label="Borrar vuelo Medellín a Rio de Janeiro"]').click();
await page.waitForSelector('text=Medellín', { state: 'detached', timeout: 5000 });
console.log('✓ vuelo de prueba borrado');

console.log(errors.length ? `ERRORES:\n${errors.join('\n')}` : 'Sin errores de consola ✓');
await browser.close();
process.exit(errors.length ? 1 : 0);
