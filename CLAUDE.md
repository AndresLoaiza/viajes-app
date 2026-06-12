# Nuestros Viajes — Claude Code Config

## Qué es
Hub compartido en vivo para Andrés y Melisa. Multi-viaje con sync realtime via Supabase. Deploy en GitHub Pages.

**URL:** https://andresloaiza.github.io/viajes-app/ — código `brasil2026`

## Stack
- React 19 + Vite 8 + TypeScript
- Tailwind CSS v4 (`@tailwindcss/vite`, sin tailwind.config.js)
- framer-motion (`MotionConfig reducedMotion="user"` en App.tsx raíz)
- `@supabase/supabase-js` — Postgres + RLS + Realtime + Storage
- vitest + jsdom (unit tests), Playwright (smoke E2E)
- GitHub Pages via GitHub Actions (push a main = deploy)

## Comandos
```bash
npm run dev          # dev server → http://localhost:5173/viajes-app/
npm run build        # build producción
npm test             # vitest (correr desde D:/ mayúscula en Windows)
node scripts/smoke.mjs  # smoke test E2E (requiere dev server corriendo)
```

## Supabase
- URL: `https://gbfxpzsblnrasfvxnquk.supabase.co` (en `.env`)
- Todas las tablas necesitan `REPLICA IDENTITY FULL` para DELETE realtime con filtro
- Storage buckets: `photos` (galería), `docs` (boletas/PDFs)
- Schema completo: `trips`, `days`, `itinerary_items`, `flights`, `hotels`, `tickets`, `place_selections`, `photos`, `checklist_items`, `notes`

## Estructura clave
```
src/
  App.tsx                     — gate → hub → shell (MotionConfig aquí)
  types/trip.ts               — TravelerId, ModuleId, TripConfig, ItineraryItem, TripPlaceSelection
  types/city.ts               — CityConfig, Place, PlaceSelection, SelectionsMap
  lib/
    supabase.ts               — createClient
    realtime.ts               — applyChange<T>, useTable<T> (fetch + realtime + apply())
    identity.ts               — SHA-256 gate, localStorage identity
    dates.ts                  — daysUntil, formatDayEs, isToday (local-time, no UTC)
  data/
    trips/brasil.ts, bogota.ts, index.ts
    cities/rio.ts, sp.ts, foz.ts, index.ts
  components/
    gate/AccessGate.tsx
    hub/TripHub.tsx
    shell/TripShell.tsx
    CategoryGrid.tsx, PlaceCard.tsx
  modules/
    inicio/InicioModule.tsx
    itinerario/ItinerarioModule.tsx
    lugares/LugaresModule.tsx
    # logistica/, galeria/, mapa/, pendientes/ — por construir
  legacy/SelectionApp.tsx     — app vieja (Gist API), NO importada, solo referencia
```

## Patrón realtime (todos los módulos lo usan)
```ts
const { rows, loading, apply } = useTable<T>('table_name', trip.id);

// Optimistic insert:
const { data, error } = await supabase.from('table').insert({...}).select().single();
if (data) apply({ eventType: 'INSERT', new: data, old: {} });

// Optimistic delete:
const { error } = await supabase.from('table').delete().eq('id', id);
if (!error) apply({ eventType: 'DELETE', new: {}, old: { id } });
```
`apply()` refleja el cambio de inmediato. El eco realtime llega después (idempotente, no duplica).

## Viajes
| Viaje | ID | Estado | Módulos activos |
|---|---|---|---|
| 🇧🇷 Brasil | `brasil-2026` | upcoming | inicio, itinerario, logistica, lugares, galeria, mapa, pendientes |
| 🇨🇴 Bogotá | `bogota-2026` | past | galeria |

## Para agregar módulo nuevo
1. Crear `src/modules/<nombre>/<Nombre>Module.tsx`
2. Importar y añadir `case '<nombre>':` en `App.tsx` `renderModule`
3. El módulo recibe `{ trip: TripConfig, identity: TravelerId }`
4. Usar `useTable<RowType>('tabla', trip.id)` para datos

## Paleta Brasil
- Verde: `#009C3B` (`brasil-green` en Tailwind)
- Amarillo: `#FFDF00` (`brasil-yellow`)
- Azul: `#002776` (`brasil-blue`)
- Arena: `#F5E6C8` (`sand`)
- Warm white: `#FFFDF5` (`warm-white`)

## Reglas
- Sin foto real → `image: ''` (no Ideogram, no placeholder)
- Sin info verificada → omitir, no inventar
- PowerShell: NO usar Get-Content/Set-Content con texto español (corrupción UTF-16). Usar Write tool o bash sed.
