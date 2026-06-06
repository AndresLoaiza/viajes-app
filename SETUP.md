# Setup — Consulta Viajes

Los envíos de Melisa se guardan como **Gist secreto** en la cuenta de GitHub de Andrés
(antes era Formspree). Cada envío = un Gist nuevo con el JSON + un `resumen.md`.

## Pasos para publicar

### 1. Crear token fine-grained (permiso solo Gists)
1. Ve a https://github.com/settings/personal-access-tokens/new
2. **Token name:** `viajes-app`
3. **Expiration:** la que quieras (ej. 90 días o custom)
4. **Repository access:** Public Repositories (read-only) — no se usa, da igual
5. **Permissions → Account permissions → Gists:** `Read and write`
6. Generate token → copia el valor (empieza con `github_pat_...`)

El token se usa en 2 lugares:
- **Local** (`.env`): `VITE_GIST_TOKEN=github_pat_...`
- **GitHub Actions** (secret del repo): `GIST_TOKEN` (ver paso 3)

> El token queda embebido en el JS público del sitio. Solo tiene permiso de Gists,
> así que el peor caso es spam de gists — revocable al instante en la misma página.

### 2. Subir a GitHub (repo `viajes-app`)
Ya configurado vía `gh` por Claude. Manual sería:
```bash
cd viajes-app
git init -b main
git add .
git commit -m "Initial commit"
gh repo create viajes-app --public --source=. --push
```

### 3. Guardar el token como secret del repo
```bash
gh secret set GIST_TOKEN --body "github_pat_..."
```

### 4. Activar GitHub Pages
1. Repo → Settings → Pages
2. Source: **GitHub Actions**
3. El workflow `.github/workflows/deploy.yml` corre solo en cada push a `main`

### 5. Link para Melisa
```
https://AndresLoaiza.github.io/viajes-app/
```

### 6. Ver los envíos
Cada envío aparece en https://gist.github.com/AndresLoaiza (gists secretos).

---

## Para usar con otra ciudad
1. Copia `src/data/cities/rio.ts` → `src/data/cities/paris.ts`
2. Edita campos (lugares, fechas, tema)
3. En `App.tsx` cambia `import rio from './data/cities/rio'`
4. Cambia `base` en `vite.config.ts` si el repo cambia de nombre

---

## Dev local
```bash
npm install
cp .env.example .env   # y pega tu VITE_GIST_TOKEN
npm run dev            # → http://localhost:5173/viajes-app/
```
