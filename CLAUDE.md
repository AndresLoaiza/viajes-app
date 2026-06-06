# Consulta Viajes — Claude Code Config

## Proyecto
App web para que Melisa escoja lugares a visitar en Río de Janeiro. Interfaz estilo Brasil. Código reutilizable para otras ciudades.

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
- `src/data/cities/rio.ts` — config de Río (lugares, fechas, tema, imágenes)
- `src/types/city.ts` — tipos TypeScript (CityConfig, Place, TravelDate, etc.)
- `src/components/` — WelcomeScreen, CategorySection, PlaceCard, StickyBar, SuccessScreen
- `src/App.tsx` — orquestador principal, maneja estado y envío a Gist API
- `.github/workflows/deploy.yml` — auto-deploy a GitHub Pages en push a main

## Para agregar otra ciudad
1. Copia `src/data/cities/rio.ts` → nueva ciudad
2. Edita todos los campos (lugares, fechas, tema)
3. En `App.tsx` cambia `import rio from './data/cities/rio'`
4. Actualiza `base` en `vite.config.ts` con el nombre del nuevo repo

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
