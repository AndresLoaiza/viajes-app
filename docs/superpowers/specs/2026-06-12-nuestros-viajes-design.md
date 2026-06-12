# Spec — "Nuestros Viajes" (hub multi-viaje compartido)

**Fecha:** 2026-06-12
**Estado:** Aprobado por Andrés
**Proyecto:** evolución de `viajes-app` (Consulta_Viajes)

## 1. Qué es

La app actual (formulario una-vía: Melisa escoge lugares → Gist) evoluciona a un **panel compartido de viajes** que sincroniza en vivo entre los celulares de Andrés y Melisa. Multi-viaje: pantalla inicial es un hub con tarjetas de viajes; cada viaje define qué módulos muestra.

## 2. Viajes v1

| Viaje | Estado | Módulos |
|---|---|---|
| 🇨🇴 Bogotá | Pasado | Solo Galería |
| 🇧🇷 Brasil | Próximo (countdown) | Inicio, Itinerario, Logística, Lugares, Galería, Mapa, Pendientes |

### Fechas Brasil (9 días, 3 ciudades)

| Fecha | Día | Ciudad | Nota |
|---|---|---|---|
| 25 jun 2026 | jueves | Rio de Janeiro | |
| 26 jun 2026 | viernes | Rio de Janeiro | |
| 27 jun 2026 | sábado | Rio de Janeiro | |
| 28 jun 2026 | domingo | Rio de Janeiro | Tarde → vuelo a Iguazú |
| 29 jun 2026 | lunes | Foz do Iguaçu | |
| 30 jun 2026 | martes | Foz do Iguaçu | Noche → vuelo a São Paulo |
| 1 jul 2026 | miércoles | São Paulo | |
| 2 jul 2026 | jueves | São Paulo | |
| 3 jul 2026 | viernes | São Paulo | Noche → vuelo a Medellín |

Rio y SP ya tienen 28 lugares curados cada una (`src/data/cities/rio.ts`, `sp.ts`). **Foz do Iguaçu es nueva** — curar lugares: Cataratas (lado BR), Garganta do Diabo, Parque das Aves, Represa Itaipú, Marco das Três Fronteiras, + gastronomía local.

## 3. Acceso e identidad

- Link único (GitHub Pages) + **código secreto** pedido una sola vez.
- Tras el código, elegir "Andrés" o "Melisa" → guardado en `localStorage`, no se vuelve a pedir.
- La identidad marca autoría de ediciones, fotos, notas.
- Privacidad **por oscuridad** (acordado): RLS de Supabase abierto a la llave anon; el candado real es que solo ellos dos tienen link+código. Sin login de email.

## 4. Permisos

**Ambos editan todo** (acordado). Sin roles. Autoría visible (quién subió/editó).

## 5. Módulos (viaje Brasil)

Navegación: barra inferior tipo app móvil.

- 🏠 **Inicio** — countdown a 25 jun, "plan de hoy" (durante el viaje), clima del día por ciudad, accesos rápidos.
- 🗓️ **Itinerario** — 9 días en tabs. Cada día = lista de bloques con hora, lugar/actividad, nota. Se pueden añadir lugares marcados en "Lugares" a un día.
- ✈️ **Logística** — tarjetas de: vuelos (aerolínea, hora, código confirmación, origen/destino), hoteles (nombre, dirección, check-in/out, confirmación), boletas/experiencias compradas (con archivo adjunto PDF/imagen y **visor integrado**).
- 📍 **Lugares** — explorar y marcar por ciudad (Rio/Foz/SP). Reusa data curada existente. Botón "agregar al itinerario".
- 🖼️ **Galería** — álbum compartido; ambos suben fotos; organizadas por día/ciudad; quién la subió.
- 🗺️ **Mapa** — Leaflet + OpenStreetMap (gratis, sin key). Pines de lugares marcados + hoteles, por ciudad.
- ✅ **Pendientes** — checklist compartido (equipaje, trámites) + notas libres compartidas.

Viaje Bogotá: solo módulo Galería.

## 6. Backend — Supabase

- **Tablas:** `trips` (raíz), `days`, `itinerary_items`, `flights`, `hotels`, `tickets`, `place_selections`, `photos`, `checklist_items`, `notes`. Todo con FK a `trip_id`.
- **Storage:** bucket `docs` (boletas PDF/imagen), bucket `photos` (galería).
- **Realtime:** subscripciones de Supabase → cambios visibles al instante en el otro dispositivo.
- **Env:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (cliente, seguras de exponer), inyectadas en build de GitHub Actions como secrets.

## 7. Extras

- **PWA offline** (`vite-plugin-pwa`): instalable; itinerario, logística, boletas y lugares cacheados → **lectura sin datos** en Brasil. Escritura requiere conexión.
- **Clima:** Open-Meteo (gratis, sin API key), pronóstico por ciudad/día.
- **Countdown:** días restantes en hub y en Inicio.

## 8. Stack y deploy

- Mismo repo `viajes-app`: React 19 + Vite 8 + TypeScript + Tailwind v4.
- Nuevas deps: `@supabase/supabase-js`, `vite-plugin-pwa`, `leaflet` + `react-leaflet`, `framer-motion` (ya instalada globalmente — animaciones de UI).
- Deploy igual: push a main → GitHub Actions → GitHub Pages.
- **Diseño UI:** usar skills `ui-ux-pro-max` e `impeccable` (y stitch si aplica) en la fase de UI. Mantener identidad visual Brasil existente (verde `#009C3B`, amarillo `#FFDF00`, azul `#002776`, arena `#F5E6C8`) para el viaje Brasil; el hub y Bogotá pueden tener su propia decoración por viaje.
- La selección de lugares existente (flujo Gist) queda integrada dentro del módulo Lugares; el envío por Gist deja de ser el flujo principal (las selecciones se guardan en Supabase).

## 9. Orden de construcción

1. **Base:** schema Supabase + gate de código + identidad + hub de viajes + shell/nav.
2. **Brasil:** Inicio/countdown + Itinerario + Lugares (con data Foz nueva).
3. **Galería** (Bogotá + Brasil).
4. **Logística** (vuelos/hoteles/boletas + subida + visor).
5. **Mapa + Clima + Pendientes.**
6. **PWA offline.**

## 10. Fuera de alcance v1

- Presupuesto/gastos (descartado por Andrés).
- Login con email / candado real.
- Edición offline (solo lectura offline).
- Más de 2 usuarios.
