# Contexto del Proyecto — Consulta Viajes

## Qué es
App web estática para planear un viaje. Andrés comparte un link con Melisa para que ella escoja los lugares que quiere visitar, indique qué día prefiere cada uno, y agregue notas. Al finalizar, la selección se envía automáticamente al email de Andrés.

## Viaje actual
- **Destino:** Río de Janeiro 🇧🇷
- **Fechas:** 25–28 junio 2026 (domingo 28: solo mañana, viajan en la tarde)
- **Viajeros:** Andrés + Melisa

## Flujo de uso
1. Andrés crea repo en GitHub + configura Formspree
2. Sube el código → GitHub Actions despliega automáticamente
3. Comparte el link con Melisa
4. Melisa entra, explora 28 lugares en 6 categorías
5. Selecciona lugares, elige días preferidos, agrega notas opcionales
6. Presiona "Enviar lista a Andrés" → email llega a andres.9438@gmail.com
7. Andrés planea el itinerario con base en las selecciones

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

## Reutilización
El código está diseñado para usarse con cualquier ciudad. El 100% de los datos específicos de Río está en `src/data/cities/rio.ts`. Para otra ciudad: copiar ese archivo, editar, cambiar el import en App.tsx.

## Decisiones técnicas
- **Sin backend:** GitHub Pages (estático) + Formspree (form handler)
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
