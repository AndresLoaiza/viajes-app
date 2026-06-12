// Check E2E Galería: subir foto de prueba, lightbox, caption, borrar.
import { chromium } from 'playwright';
import { writeFileSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const BASE = 'http://localhost:5173/viajes-app/';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });

// PNG de prueba 80x60 rojo (generado con canvas del propio browser)
const tmpPng = join(tmpdir(), 'galeria-test.png');
const dataUrl = await page.evaluate(() => {
  const c = document.createElement('canvas');
  c.width = 80; c.height = 60;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#c0392b';
  ctx.fillRect(0, 0, 80, 60);
  return c.toDataURL('image/png');
});
writeFileSync(tmpPng, Buffer.from(dataUrl.split(',')[1], 'base64'));

await page.goto(BASE, { waitUntil: 'networkidle' });
await page.fill('#access-code', 'brasil2026');
await page.keyboard.press('Enter');
await page.waitForSelector('text=¿Quién eres?', { timeout: 5000 });
await page.click('text=Andrés');
await page.waitForSelector('text=Nuestros Viajes', { timeout: 5000 });
await page.click('text=Brasil');
await page.waitForSelector('text=Faltan', { timeout: 5000 });

// Tab Fotos
await page.click('nav >> text=Fotos');
await page.waitForSelector('text=Galería', { timeout: 5000 });
await page.waitForTimeout(1200);
await page.screenshot({ path: 'scripts/shot-11-galeria-vacia.png' });

// Subir foto de prueba
await page.setInputFiles('input[type=file]', tmpPng);
await page.waitForSelector('button[aria-label="Ver foto"]', { timeout: 15000 });
console.log('✓ foto subida y visible en grid');
await page.screenshot({ path: 'scripts/shot-12-galeria-foto.png' });

// Lightbox + caption
await page.click('button[aria-label="Ver foto"]');
await page.waitForSelector('[aria-label="Foto ampliada"]', { timeout: 5000 });
await page.fill('[aria-label="Nota de la foto"]', 'prueba e2e');
await page.click('button:has-text("Guardar")');
await page.waitForTimeout(1000);
console.log('✓ lightbox + caption guardada');
await page.screenshot({ path: 'scripts/shot-13-galeria-lightbox.png' });

// Borrar (limpia el dato de prueba)
page.on('dialog', (d) => d.accept());
await page.click('[aria-label="Borrar foto"]');
await page.waitForSelector('[aria-label="Foto ampliada"]', { state: 'detached', timeout: 5000 });
await page.waitForSelector('text=Aún no hay fotos', { timeout: 5000 });
console.log('✓ foto borrada (tabla + storage)');

unlinkSync(tmpPng);
console.log(errors.length ? `ERRORES:\n${errors.join('\n')}` : 'Sin errores de consola ✓');
await browser.close();
process.exit(errors.length ? 1 : 0);
