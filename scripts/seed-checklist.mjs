// Seed del checklist de equipaje para Brasil 2026. Idempotente: solo inserta
// los ítems que aún no existen (por texto), así re-correrlo agrega los nuevos
// sin duplicar. Categorías: equipaje / tramites / compras / otros.
//
// Uso:  node scripts/seed-checklist.mjs
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';

const TRIP = 'brasil-2026';
const BY = 'andres';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n')
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]),
);
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

// Checklist pensado para el viaje: Río + Foz (Cataratas) + São Paulo, invierno
// (noches frescas, SP más frío), Mundial 2026, viaje internacional.
const ITEMS = {
  tramites: [
    'Pasaporte vigente — Andrés',
    'Pasaporte vigente — Melisa',
    'Vacuna fiebre amarilla + certificado (recomendada para Iguazú)',
    'Seguro de viaje (póliza + teléfono de asistencia)',
    'Reservas impresas: vuelos, hoteles y boletas',
    'Copia digital de documentos (foto en el celular)',
    'Avisar al banco que viajamos al exterior',
    'Tarjeta sin recargo en el exterior + algo de efectivo en reales',
    'Check-in online de los vuelos',
  ],
  equipaje: [
    'Chaqueta abrigada (noches frescas, SP más frío)',
    'Impermeable o poncho liviano (Cataratas)',
    'Zapatos cómodos para caminar mucho',
    'Sandalias / chanclas',
    'Ropa de baño',
    'Gafas de sol + protector solar',
    'Repelente de mosquitos (zona de Iguazú)',
    'Cargadores + power bank',
    'Adaptador de enchufe Brasil (tipo N)',
    'Neceser (cepillo, pasta, desodorante, etc.)',
    'Medicamentos personales + botiquín básico',
    'Bolsa impermeable o ziploc para el celular (Cataratas)',
    'Toalla de secado rápido',
    'Audífonos',
  ],
  compras: [
    'Chip o eSIM con datos para Brasil',
    'Cambiar plata a reales (BRL)',
    'Snacks para los vuelos',
    'Souvenirs (dejar para el final)',
  ],
  otros: [
    'Descargar mapas offline (Google Maps) de Río, Foz y SP',
    'Instalar esta app y la de la polla en el celular (PWA)',
    'Camiseta para ver los partidos del Mundial',
    'Colombia vs Portugal — 27 jun, no perdérselo',
    'Cargar fotos a la galería durante el viaje',
  ],
};

const { data: existing, error: exErr } = await supabase
  .from('checklist_items').select('text').eq('trip_id', TRIP);
if (exErr) { console.error('Error leyendo existentes:', exErr.message); process.exit(1); }
const yaHay = new Set((existing ?? []).map((r) => r.text));

const filas = [];
for (const [category, textos] of Object.entries(ITEMS)) {
  for (const text of textos) {
    if (yaHay.has(text)) continue;
    filas.push({
      id: randomUUID(), trip_id: TRIP, text, done: false,
      category, created_by: BY, created_at: new Date().toISOString(),
    });
  }
}

if (filas.length === 0) {
  console.log('Nada nuevo — el checklist ya estaba completo.');
  process.exit(0);
}

const { error } = await supabase.from('checklist_items').insert(filas);
if (error) { console.error('Error insertando:', error.message); process.exit(1); }
console.log(`Insertados ${filas.length} ítems al checklist de ${TRIP}.`);
const porCat = filas.reduce((a, f) => ((a[f.category] = (a[f.category] ?? 0) + 1), a), {});
console.log(porCat);
