# Contexto del Proyecto — Consulta Viajes

## Qué es
App web estática para planear un viaje. Andrés comparte un link con Melisa; ella elige la ciudad, escoge los lugares que quiere visitar, indica qué día prefiere cada uno (si la ciudad tiene fechas), y agrega notas. Al finalizar, la selección se guarda como Gist secreto en la cuenta de GitHub de Andrés (reemplazó al email/Formspree el 2026-06-06).

## Ciudades (selector)
Dos ciudades en un solo link, elegidas en `CityPicker`:
- **Río de Janeiro** 🇧🇷 — con fechas (25–28 junio 2026; dom 28 solo mañana). 28 lugares, 6 categorías.
- **São Paulo** 🏙️ — sin fechas (`dates: []`, solo marcar lugares). 28 lugares, 6 categorías.
- **Viajeros:** Andrés + Melisa

## Flujo de uso
1. Andrés tiene el repo + token Gist (`VITE_GIST_TOKEN` / secret `GIST_TOKEN`)
2. Push a main → GitHub Actions despliega automáticamente a Pages
3. Comparte el link con Melisa
4. Melisa elige ciudad (Río o São Paulo) y explora los lugares por categoría
5. Selecciona lugares, elige días preferidos (solo Río), agrega notas opcionales
6. Presiona "Enviar lista a Andrés" → se crea un Gist secreto en github.com/AndresLoaiza
7. Andrés descarga el Gist y planea el itinerario

## Lugares incluidos (28)
### Playas (3)
Copacabana · Ipanema · Arco da Lapa

### Naturaleza & Senderos (5)
Morro Dois Irmãos · Pedra Bonita · Pan de Azúcar · Parque Lage · Jardín Botánico

### Cultura & Historia (7)
Real Gabinete Português · Cristo Redentor · Escaleras Selarón · Sambódromo · Santa Teresa · Forte de Copacabana · Museu do Amanhã

### Experiencias (3)
Amanecer paddle surf · Ala delta · Caminar por el Malecón

### Gastronomía (8)
Confeitaria Colombo · Sanduíche Paraíso · Garota de Ipanema · Carretão · So Lo Café · Padaria Ipanema · Fala · Feria Nocturna Copacabana

### Compras & Noche (2)
Tienda Havaianas · Roxy Dinner Show

## Lugares São Paulo (28)
### Museos & Arte (8)
MASP · Pinacoteca · Museu da Língua Portuguesa · MAC USP · Farol Santander · Casa das Rosas · Museu do Café (Santos) · Instituto Ricardo Brennand (Recife)

### Centros Culturales (7)
IMS Paulista · Itaú Cultural · Tomie Ohtake · CCBB · Japan House · Theatro Municipal · Templo Zu Lai

### Librerías & Lectura (4)
Biblioteca Mário de Andrade · Livraria Martins Fontes · Livraria Megafauna (Copan) · Drummond Livraria

### Gastronomía & Cafés (4)
Mercado Municipal (Mercadão) · A Casa do Porco · Casa de Francisca · Bar do Cofre

### Parques & Naturaleza (2)
Parque do Ibirapuera · Praça Pôr do Sol

### Barrios & Paseos (3)
Bairro da Liberdade · Beco do Batman · Rua Oscar Freire

> Lista original de Andrés (Google Maps) tenía 35; se quitaron 7 (Museu Paulista, Casa da Don'Anna, Ema Klabin, Futuro Refeitório, Padaria Santa Tereza, IL Barista, Mata Atlântica). Martins Fontes solo tiene 1 foto libre en Commons.

## Reutilización
El código sirve para cualquier ciudad. El 100% de los datos de una ciudad vive en su `src/data/cities/<ciudad>.ts`. Para otra ciudad: copiar `rio.ts`/`sp.ts`, editar, y **añadirla al array `cities` en `src/data/cities/index.ts`** (el selector aparece solo). Decoración opcional en `public/decor/<ciudad>/`.

## Decisiones técnicas
- **Sin backend:** GitHub Pages (estático) + GitHub Gist API como buzón (cada envío = gist secreto)
- **Imágenes (fotos reales del lugar exacto):**
  - Landmarks → Wikimedia Commons search API (libres, estables, hotlinkables)
  - Venues (Padaria, Fala, Havaianas, Roxy) → TripAdvisor (`dynamic-media-cdn`) / Time Out
  - Venues sin foto libre (Carretão, SO_Lo, Feira Hippie) → fallback botón "Ver fotos en Google Maps"
  - Cada lugar: `images: string[]` (carrusel) + `mapsUrl` (enlace estable Google Maps)
  - PlaceCard tiene `onError` por imagen: descarta automáticamente las que no cargan
- **`source.unsplash.com` deprecado** desde 2024 — NO usar
- **Validar imágenes en browser** (Playwright, naturalWidth>0), NO con urllib/curl (Wikimedia/TripAdvisor bloquean Python → falsos negativos)
- **Tailwind v4** con `@tailwindcss/vite` — sin `tailwind.config.js`
- **Deploy:** GitHub Actions push a main → auto-deploy Pages

## Estado al cierre (2026-06-06)
App completa y funcionando en dev. Git: 2 commits en `viajes-app/`.
- ✅ UI completa estilo Brasil, 28 lugares, 6 categorías
- ✅ Fotos reales por lugar + carrusel + enlace Maps (88 imgs, 0 rotas)
- ✅ Selección con día preferido + notas, envío Formspree, success screen
- ✅ CLAUDE.md, context.md, SETUP.md, GitHub Actions deploy

### Pendiente (mañana / antes de publicar)
1. Registrar Formspree con andres.9438@gmail.com → pegar ID en `src/data/cities/rio.ts` línea ~14 (`formspreeEndpoint`)
2. Crear repo GitHub + actualizar `base` en `vite.config.ts` con nombre del repo
3. Push → Settings > Pages > Source: GitHub Actions
4. Compartir link a Melisa: `https://USUARIO.github.io/REPO/`

### Posibles mejoras futuras
- Conseguir fotos reales de Carretão/SO_Lo/Feira Hippie (hoy solo Maps link)
- Verificar que las fotos de TripAdvisor sean del venue correcto (a veces mezcla cercanos)
- Probar envío Formspree end-to-end una vez configurado el endpoint
