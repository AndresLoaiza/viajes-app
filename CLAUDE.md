# Consulta Viajes — Claude Code Config

## Proyecto
App web para que Melisa escoja lugares a visitar en Brasil. **Dos ciudades:** Río de Janeiro y São Paulo, con selector de ciudad (un solo link). Interfaz estilo Brasil. Código reutilizable para más ciudades vía registry.

## Stack
- React 19 + Vite 8 + TypeScript
- Tailwind CSS v4 (`@tailwindcss/vite`)
- GitHub Pages (deploy via GitHub Actions)
- GitHub Gist API (cada envío = Gist secreto; sin backend)

## Comandos
```bash
npm run dev      # dev server → http://localhost:5173/viajes-app/
npm run build    # build producción → dist/
npm run deploy   # build + push a gh-pages (manual)
```

## Estructura clave
- `src/data/cities/index.ts` — **registry** `cities = [rio, sp]` + `defaultCityId`
- `src/data/cities/rio.ts` — config de Río (lugares, fechas, tema, imágenes)
- `src/data/cities/sp.ts` — config de São Paulo (28 lugares, `dates: []` = sin selector de días)
- `src/types/city.ts` — tipos TypeScript (CityConfig, Place, TravelDate, etc.)
- `src/components/` — CityPicker, WelcomeScreen, CategorySection, PlaceCard, StickyBar, SuccessScreen
- `src/App.tsx` — orquestador: selector de ciudad, estado por ciudad, envío a Gist API
- `.github/workflows/deploy.yml` — auto-deploy a GitHub Pages en push a main

## Ciudades y días
- Si el registry tiene >1 ciudad, App arranca en `CityPicker` (selector). Con 1 sola, va directo.
- Selecciones independientes por ciudad (`selectionsByCity`).
- Si una ciudad tiene `dates: []`, se oculta TODO el UI de fechas (header, welcome, card). SP usa esto.

## Para agregar otra ciudad
1. Copia `src/data/cities/rio.ts` (o `sp.ts`) → nueva ciudad, edita campos (lugares, fechas, tema).
2. Añádela al array `cities` en `src/data/cities/index.ts`. El selector aparece solo.
3. (Opcional) decoración propia en `public/decor/<ciudad>/` y cablear con `asset()`.

## Imágenes
- Lugares famosos: `https://images.unsplash.com/photo-{ID}?auto=format&fit=crop&w=800&q=80`
- Otros: `https://picsum.photos/seed/{seed}/800/450` (estable por seed)
- `source.unsplash.com` está deprecado desde 2024 — NO usar

## Envío (GitHub Gist)
- App lee `import.meta.env.VITE_GIST_TOKEN` y hace POST a `https://api.github.com/gists`.
- Token fine-grained con permiso solo "Gists" (read/write). Ver `SETUP.md` / `.env.example`.
- Local: en `.env`. CI: secret de repo `GIST_TOKEN` → inyectado en `deploy.yml`.
- Cada envío crea un Gist secreto en https://gist.github.com/AndresLoaiza.

## Paleta Brasil
- Verde: `#009C3B`
- Amarillo: `#FFDF00`
- Azul: `#002776`
- Arena: `#F5E6C8`
- Warm white: `#FFFDF5`
