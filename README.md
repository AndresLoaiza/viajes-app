# 🗺️ Consulta Viajes — Brasil (Río & São Paulo)

App web estática para planear un viaje en pareja. Andrés comparte un link con Melisa; ella elige primero la ciudad (**Río de Janeiro** o **São Paulo**), explora los lugares, marca los que quiere visitar, elige día preferido y agrega notas. Al enviar, la selección se guarda como **Gist secreto** en la cuenta de GitHub de Andrés (sin backend, sin servidor).

**App en vivo:** https://andresloaiza.github.io/viajes-app/

> Río usa fechas (Melisa elige día por lugar); São Paulo va sin fechas (solo marca lugares). El selector de día se oculta automáticamente cuando la ciudad no tiene `dates`.

---

## Stack

- **React 19** + **Vite 8** + **TypeScript**
- **Tailwind CSS v4** (`@tailwindcss/vite`, sin `tailwind.config.js`)
- **GitHub Gist API** como buzón de respuestas (cada envío = un gist secreto)
- **GitHub Pages** (deploy automático con GitHub Actions)

## Comandos

```bash
npm install
npm run dev      # dev → http://localhost:5173/viajes-app/
npm run build    # build producción → dist/
```

## Estructura

```
src/
├── App.tsx                  # orquestador: selector de ciudad, estado por ciudad, envío a Gist API
├── types/city.ts            # tipos (CityConfig, Place, TravelDate, PlaceSelection…)
├── data/cities/
│   ├── index.ts            # registry: cities = [rio, sp] + defaultCityId
│   ├── rio.ts              # data de Río (lugares, fechas, tema, imágenes)
│   └── sp.ts               # data de São Paulo (28 lugares, sin fechas)
└── components/
    ├── CityPicker.tsx      # selector de ciudad (landing si hay >1 ciudad)
    ├── WelcomeScreen.tsx   # pantalla de bienvenida (por ciudad)
    ├── CategorySection.tsx # agrupa lugares por categoría
    ├── PlaceCard.tsx       # card con carrusel de fotos + selección
    ├── StickyBar.tsx       # barra inferior con contador + botón enviar
    └── SuccessScreen.tsx   # confirmación tras enviar
public/decor/                # ilustraciones Ideogram de Río (hero, og, icon, mascota…)
public/decor/sp/             # ilustraciones Ideogram de São Paulo
.github/workflows/deploy.yml # build + deploy a Pages en push a main
```

## Cómo funciona el envío

1. La app lee `import.meta.env.VITE_GIST_TOKEN` (token fine-grained con permiso **solo Gists** r/w).
2. Al enviar, hace `POST https://api.github.com/gists` con un gist secreto que contiene:
   - `Melisa-<ciudad>-<timestamp>.json` — payload estructurado (lugares, días, notas).
   - `resumen.md` — versión legible del mensaje.
3. Los envíos llegan a https://gist.github.com/AndresLoaiza (privados). **No** hay email.

### Configurar el token
- Local: copiar `.env.example` → `.env` y poner `VITE_GIST_TOKEN=...`
- CI: `gh secret set GIST_TOKEN` → inyectado en `deploy.yml` durante el build.
- Detalle paso a paso en [`SETUP.md`](SETUP.md).

### Descargar las respuestas
```bash
# listar gists recibidos
gh api gists -q '.[] | "\(.id)\t\(.created_at)\t\(.description)"'

# bajar el contenido de uno
gh api gists/<ID> -q '.files["resumen.md"].content'
```
Las respuestas descargadas se guardan en `../respuestas/`.

## Reutilizar para otra ciudad

El 100% de los datos específicos de una ciudad vive en su archivo `src/data/cities/<ciudad>.ts`.

1. Copiar `rio.ts` (o `sp.ts`) → `<ciudad>.ts` y editar lugares, fechas, tema e imágenes.
2. Añadir la ciudad al array `cities` en `src/data/cities/index.ts` → el selector aparece solo.
3. (Opcional) decoración propia en `public/decor/<ciudad>/`, cableada con `asset()`.

Si una ciudad lleva `dates: []`, la app oculta todo el UI de fechas (es lo que hace São Paulo).

## Paleta (Brasil)

| | Hex |
|---|---|
| Verde | `#009C3B` |
| Amarillo | `#FFDF00` |
| Azul | `#002776` |
| Arena | `#F5E6C8` |
| Warm white | `#FFFDF5` |

## Documentación relacionada

- [`CLAUDE.md`](CLAUDE.md) — config y convenciones para Claude Code
- [`context.md`](context.md) — contexto completo del proyecto y decisiones
- [`SETUP.md`](SETUP.md) — pasos de publicación y token
