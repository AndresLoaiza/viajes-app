-- Ubicación de fotos: lat/lon (GPS EXIF) + place (reverse-geocode).
-- Antes el "donde" se metía en `caption`; ahora caption vuelve a ser nota libre del usuario.
-- Aplicar en Supabase Dashboard → SQL Editor (o vía service-role/psql).

alter table public.photos
  add column if not exists lat   double precision,
  add column if not exists lon   double precision,
  add column if not exists place text;

-- Backfill de captions auto-geocodeadas → place, y limpiar caption.
-- Solo afecta fotos de Bogotá cuyo caption fue puesto por el geocode (no tocadas a mano aún).
-- El backfill real de lat/lon/place por foto lo hace scripts/backfill-bogota-location.mjs.
