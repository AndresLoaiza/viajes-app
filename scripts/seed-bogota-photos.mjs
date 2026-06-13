// Seed fotos Bogotá 2026: convierte HEIC/JPG con ffmpeg, sube a bucket `photos`,
// inserta filas en tabla `photos`. Idempotente por file_path.
//
// Prerrequisitos — extraer zip primero desde bash:
//   mkdir -p /tmp/bogota-photos
//   unzip -o "d:/ANDRES/Claude_Projects/Consulta_Viajes/Photos-3-001 (2).zip" -d /tmp/bogota-photos/
//
// Uso: node scripts/seed-bogota-photos.mjs [--force]
//   --force  borra y re-sube fotos que ya existen
import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync, statSync, writeFileSync, unlinkSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, basename, extname } from 'node:path';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';

const TRIP = 'bogota-2026';
const UPLOADER = 'andres';
// bash /tmp = C:\Users\...\AppData\Local\Temp en Windows; usar forward slashes para ffmpeg
const PHOTOS_DIR = join(tmpdir(), 'bogota-photos').replace(/\\/g, '/');
const FORCE = process.argv.includes('--force');

if (!existsSync(PHOTOS_DIR)) {
  console.error(`Directorio no encontrado: ${PHOTOS_DIR}`);
  console.error('Extraer zip primero (desde bash/Git Bash):');
  console.error('  mkdir -p /tmp/bogota-photos');
  console.error('  unzip -o "d:/ANDRES/Claude_Projects/Consulta_Viajes/Photos-3-001 (2).zip" -d /tmp/bogota-photos/');
  process.exit(1);
}
console.log(`Leyendo fotos de: ${PHOTOS_DIR}`);

// ── .env ────────────────────────────────────────────────────────────────────
const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n')
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]),
);
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

// ── Archivos a procesar ──────────────────────────────────────────────────────
const EXTS = new Set(['.heic', '.heif', '.jpg', '.jpeg', '.png', '.webp']);
const files = readdirSync(PHOTOS_DIR)
  .filter((f) => EXTS.has(extname(f).toLowerCase()))
  .sort();

if (files.length === 0) {
  console.error(`No se encontraron imágenes en ${PHOTOS_DIR}`);
  process.exit(1);
}
console.log(`${files.length} imágenes encontradas`);

// ── Fotos ya en DB ──────────────────────────────────────────────────────────
const { data: existing, error: existErr } = await supabase
  .from('photos').select('file_path').eq('trip_id', TRIP);
if (existErr) { console.error('Error DB:', existErr.message); process.exit(1); }
const existingPaths = new Set((existing ?? []).map((r) => r.file_path));
console.log(`${existingPaths.size} fotos ya en DB para ${TRIP}`);

// ── fecha de captura: EXIF DateTimeOriginal, fallback a mtime ────────────────
// El mtime es la fecha de extracción del zip (hoy), NO cuándo se tomó la foto.
// pillow_heif lee HEIC; cae a mtime si la foto no trae EXIF.
function mtimeDate(filepath) {
  const d = new Date(statSync(filepath).mtime.getTime());
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function exifDate(filepath) {
  const py = [
    'import sys,pillow_heif; pillow_heif.register_heif_opener()',
    'from PIL import Image',
    'ex=Image.open(sys.argv[1]).getexif()',
    'dt=ex.get_ifd(0x8769).get(0x9003) or ex.get(306)',
    'print(dt.split(" ")[0].replace(":","-") if dt else "")',
  ].join('\n');
  try {
    const out = execFileSync('python', ['-c', py, filepath.replace(/\\/g, '/')], {
      stdio: ['ignore', 'pipe', 'ignore'],
    }).toString().trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(out) ? out : mtimeDate(filepath);
  } catch {
    return mtimeDate(filepath);
  }
}

// ── ffmpeg: convierte a JPEG y escala a max 1600px ─────────────────────────
// filter_complex evita el conflicto "simple vs complex filtergraph" de HEIC multi-stream.
// force_original_aspect_ratio=decrease: escala proporcionalmente, nunca upscale.
function toJpeg(inputPath) {
  const outPath = `/tmp/seed-${randomUUID()}.jpg`;
  const inFwd = inputPath.replace(/\\/g, '/');
  execFileSync('ffmpeg', [
    '-y', '-i', inFwd,
    '-filter_complex', '[0:v:0]scale=1600:1600:force_original_aspect_ratio=decrease[out]',
    '-map', '[out]',
    '-frames:v', '1',
    '-q:v', '4',  // JPEG quality ~85%
    outPath,
  ], { stdio: 'pipe' });
  const buf = readFileSync(outPath);
  unlinkSync(outPath);
  return buf;
}

// ── Subir ───────────────────────────────────────────────────────────────────
let uploaded = 0, skipped = 0, failed = 0;

for (const filename of files) {
  const inputPath = join(PHOTOS_DIR, filename);
  const stem = basename(filename, extname(filename));
  const remotePath = `${TRIP}/${stem}.jpg`;

  if (!FORCE && existingPaths.has(remotePath)) {
    console.log(`  skip  ${filename}`);
    skipped++;
    continue;
  }

  // Convertir
  let buf;
  try {
    process.stdout.write(`  conv  ${filename} → `);
    buf = toJpeg(inputPath);
    process.stdout.write(`${Math.round(buf.length / 1024)} KB → `);
  } catch (err) {
    console.log(`ERROR ffmpeg: ${err.stderr?.toString().split('\n').at(-2) ?? err.message}`);
    failed++;
    continue;
  }

  // Borrar existente si --force
  if (FORCE && existingPaths.has(remotePath)) {
    await supabase.from('photos').delete()
      .eq('trip_id', TRIP).eq('file_path', remotePath);
    await supabase.storage.from('photos').remove([remotePath]);
  }

  // Storage upload
  const { error: upErr } = await supabase.storage.from('photos')
    .upload(remotePath, buf, { contentType: 'image/jpeg', upsert: FORCE });
  if (upErr) {
    console.log(`ERROR storage: ${upErr.message}`);
    failed++;
    continue;
  }

  // DB insert
  const takenOn = exifDate(inputPath);
  const { error: dbErr } = await supabase.from('photos').insert({
    trip_id: TRIP,
    file_path: remotePath,
    taken_on: takenOn,
    city_id: null,
    uploaded_by: UPLOADER,
  });
  if (dbErr) {
    console.log(`ERROR DB: ${dbErr.message}`);
    await supabase.storage.from('photos').remove([remotePath]);
    failed++;
    continue;
  }

  console.log(`✓ ${takenOn}`);
  uploaded++;
}

console.log(`\nListo: ${uploaded} subidas, ${skipped} omitidas, ${failed} errores`);
if (failed > 0) process.exit(1);
