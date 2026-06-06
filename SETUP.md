# Setup — Consulta Viajes

## Pasos para publicar

### 1. Crear repositorio en GitHub
```
Nombre sugerido: viajes-melisa
Visibilidad: Public (necesario para GitHub Pages gratis)
```

### 2. Registrar Formspree (envío de email)
1. Ve a [formspree.io](https://formspree.io)
2. Crea cuenta con **andres.9438@gmail.com**
3. "New Form" → ponle nombre "Consulta Viajes Melisa"
4. Copia el endpoint: `https://formspree.io/f/XXXXXXXX`
5. Abre `src/data/cities/rio.ts`
6. Reemplaza `REEMPLAZA_CON_TU_ID` con tu ID real:
   ```ts
   formspreeEndpoint: 'https://formspree.io/f/XXXXXXXX',
   ```

### 3. Actualizar base URL en vite.config.ts
Cambia `'/viajes-app/'` por el nombre de tu repo:
```ts
base: '/viajes-melisa/',   // ← nombre del repo en GitHub
```

### 4. Subir a GitHub
```bash
cd viajes-app
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/TU_USUARIO/viajes-melisa.git
git push -u origin main
```

### 5. Activar GitHub Pages
1. En tu repo → Settings → Pages
2. Source: **GitHub Actions** (no "Deploy from a branch")
3. El workflow `.github/workflows/deploy.yml` se ejecuta automáticamente

### 6. Obtener el link para Melisa
```
https://TU_USUARIO.github.io/viajes-melisa/
```

---

## Para usar con otra ciudad

1. Copia `src/data/cities/rio.ts` → `src/data/cities/paris.ts`
2. Edita todos los campos (lugares, fechas, tema de colores)
3. En `App.tsx` cambia `import rio from './data/cities/rio'` por la nueva ciudad

---

## Dev local
```bash
npm install
npm run dev   # → http://localhost:5173
```
