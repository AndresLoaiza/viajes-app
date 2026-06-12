# Nuestros Viajes — Plan 1 (Base + Brasil core) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convertir `viajes-app` en hub multi-viaje compartido con sync en vivo: gate de acceso, hub de viajes (Bogotá/Brasil), shell con nav inferior, Inicio (countdown), Itinerario día-por-día con realtime, y Lugares (Rio/Foz/SP) persistido en Supabase.

**Architecture:** Trips viven como config estática en código (registry, igual que cities hoy); los datos dinámicos (itinerario, selecciones, etc.) viven en Supabase con `trip_id text` — sin tabla `trips` (YAGNI: la config define los viajes). Hook genérico `useTable` hace select inicial + subscripción realtime. Navegación por estado en App (sin router). UI con framer-motion; diseño refinado con skills `ui-ux-pro-max` / `impeccable` en los pasos de UI.

**Tech Stack:** React 19, Vite 8, TS, Tailwind v4, `@supabase/supabase-js`, `framer-motion`, vitest (nuevo, para lógica pura).

**Spec:** `docs/superpowers/specs/2026-06-12-nuestros-viajes-design.md`

---

## File Structure

```
src/
  lib/supabase.ts            # cliente supabase (env)
  lib/realtime.ts            # applyChange reducer + useTable hook
  lib/identity.ts            # gate código + identidad localStorage
  lib/dates.ts               # countdown, días del viaje, formato es-CO
  types/trip.ts              # TripConfig, ModuleId, TravelerId, ItineraryItem...
  data/trips/index.ts        # registry [bogota, brasil]
  data/trips/bogota.ts       # viaje pasado, módulos: [galeria]
  data/trips/brasil.ts       # 9 días, 3 ciudades, 7 módulos
  data/cities/foz.ts         # NUEVA ciudad curada (~11 lugares, 4 categorías)
  components/gate/AccessGate.tsx
  components/hub/TripHub.tsx
  components/shell/TripShell.tsx   # nav inferior + render módulo activo
  modules/inicio/InicioModule.tsx
  modules/itinerario/ItinerarioModule.tsx
  modules/lugares/LugaresModule.tsx  # reusa CategorySection/PlaceCard
  App.tsx                    # rewire: gate → hub → shell
```

`tsconfig` ya compila `src/**`. Componentes existentes (PlaceCard, CategorySection, CityPicker…) se conservan; el flujo Gist deja de ser el camino principal pero el código no se borra en este plan.

---

### Task 1: Deps + vitest

**Files:** Modify: `package.json`

- [ ] **Step 1:** Instalar deps

```bash
cd d:/ANDRES/Claude_Projects/Consulta_Viajes/viajes-app
npm i @supabase/supabase-js framer-motion
npm i -D vitest
```

- [ ] **Step 2:** Agregar script test en `package.json`:

```json
"test": "vitest run"
```

- [ ] **Step 3:** Verificar: `npm run test` → "no test files found" (exit ok con --passWithNoTests si falla, agregar flag).

- [ ] **Step 4:** Commit: `chore: add supabase, framer-motion, vitest`

---

### Task 2: lib/dates.ts (TDD)

**Files:** Create: `src/lib/dates.ts`, Test: `src/lib/dates.test.ts`

- [ ] **Step 1: Test que falla**

```ts
import { describe, it, expect } from 'vitest';
import { daysUntil, formatDayEs, isToday } from './dates';

describe('daysUntil', () => {
  it('cuenta días hasta fecha futura', () => {
    expect(daysUntil('2026-06-25', new Date('2026-06-12T10:00:00'))).toBe(13);
  });
  it('0 si es hoy', () => {
    expect(daysUntil('2026-06-25', new Date('2026-06-25T08:00:00'))).toBe(0);
  });
  it('negativo si pasó', () => {
    expect(daysUntil('2026-06-25', new Date('2026-06-30T08:00:00'))).toBe(-5);
  });
});

describe('formatDayEs', () => {
  it('formatea fecha ISO a español', () => {
    expect(formatDayEs('2026-06-25')).toMatch(/jueves/i);
    expect(formatDayEs('2026-06-25')).toMatch(/25/);
  });
});

describe('isToday', () => {
  it('true si coincide', () => {
    expect(isToday('2026-06-25', new Date('2026-06-25T23:00:00'))).toBe(true);
    expect(isToday('2026-06-25', new Date('2026-06-26T01:00:00'))).toBe(false);
  });
});
```

- [ ] **Step 2:** `npm run test` → FAIL (módulo no existe)

- [ ] **Step 3: Implementación**

```ts
// src/lib/dates.ts
// Fechas ISO 'YYYY-MM-DD' interpretadas en hora local (no UTC) para evitar off-by-one.
function parseLocal(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function daysUntil(iso: string, now: Date = new Date()): number {
  const target = parseLocal(iso);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

export function formatDayEs(iso: string): string {
  return parseLocal(iso).toLocaleDateString('es-CO', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
}

export function isToday(iso: string, now: Date = new Date()): boolean {
  return daysUntil(iso, now) === 0;
}
```

- [ ] **Step 4:** `npm run test` → PASS
- [ ] **Step 5:** Commit: `feat: date helpers (countdown, formato es)`

---

### Task 3: Tipos + registry de viajes + data Foz

**Files:** Create: `src/types/trip.ts`, `src/data/trips/brasil.ts`, `src/data/trips/bogota.ts`, `src/data/trips/index.ts`, `src/data/cities/foz.ts`

- [ ] **Step 1:** `src/types/trip.ts`:

```ts
import type { CityConfig } from './city';

export type TravelerId = 'andres' | 'melisa';
export type ModuleId =
  | 'inicio' | 'itinerario' | 'logistica' | 'lugares'
  | 'galeria' | 'mapa' | 'pendientes';

export interface TripDay {
  date: string;        // 'YYYY-MM-DD'
  cityId: string;      // ref a city registry
  note?: string;       // p.ej. 'Tarde → vuelo a Iguazú'
}

export interface TripConfig {
  id: string;
  name: string;
  flag: string;        // emoji bandera
  tagline: string;
  status: 'past' | 'upcoming';
  startDate: string;
  endDate: string;
  days: TripDay[];     // [] para viajes pasados
  cities: CityConfig[];
  modules: ModuleId[];
  theme: { primary: string; accent: string; bg: string };
}

// Filas Supabase (tablas en Task 4)
export interface ItineraryItem {
  id: string;
  trip_id: string;
  date: string;
  time: string | null;      // 'HH:MM' o null
  title: string;
  place_id: string | null;
  note: string | null;
  created_by: TravelerId;
  created_at: string;
}

export interface PlaceSelection {
  id: string;
  trip_id: string;
  city_id: string;
  place_id: string;
  selected_by: TravelerId;
  note: string | null;
  created_at: string;
}
```

- [ ] **Step 2:** `src/data/cities/foz.ts` — copiar estructura de `rio.ts`. Contenido curado (imágenes se llenan en Task 11):

| Categoría | Lugares |
|---|---|
| Cataratas & Naturaleza | Cataratas do Iguaçu (lado BR) · Passarela Garganta do Diabo · Parque das Aves |
| Ingeniería & Monumentos | Represa Itaipú (tour) · Marco das Três Fronteiras |
| Templos & Cultura | Templo Budista Chen Tien · Mezquita Omar Ibn Al-Khattab |
| Gastronomía | Rafain Churrascaria (show) · Vó Bertila · Castelo Libanês · Empório com Arte |

`dates: []` no aplica aquí — Foz usa el shape `CityConfig` existente; poner `dates: []` (los días reales viven en `brasil.ts`). Cada lugar: `id`, `name`, `category`, `description` (2-3 frases, por qué vale la pena, tips), `images: []` (Task 11), `mapsUrl` (buscar URL real de Google Maps).

- [ ] **Step 3:** `src/data/trips/brasil.ts`:

```ts
import { rio } from '../cities/rio';
import { sp } from '../cities/sp';
import { foz } from '../cities/foz';
import type { TripConfig } from '../../types/trip';

export const brasil: TripConfig = {
  id: 'brasil-2026',
  name: 'Brasil',
  flag: '🇧🇷',
  tagline: 'Rio · Iguazú · São Paulo',
  status: 'upcoming',
  startDate: '2026-06-25',
  endDate: '2026-07-03',
  days: [
    { date: '2026-06-25', cityId: 'rio' },
    { date: '2026-06-26', cityId: 'rio' },
    { date: '2026-06-27', cityId: 'rio' },
    { date: '2026-06-28', cityId: 'rio', note: 'Tarde → vuelo a Iguazú' },
    { date: '2026-06-29', cityId: 'foz' },
    { date: '2026-06-30', cityId: 'foz', note: 'Noche → vuelo a São Paulo' },
    { date: '2026-07-01', cityId: 'sp' },
    { date: '2026-07-02', cityId: 'sp' },
    { date: '2026-07-03', cityId: 'sp', note: 'Noche → vuelo a Medellín' },
  ],
  cities: [rio, foz, sp],
  modules: ['inicio', 'itinerario', 'logistica', 'lugares', 'galeria', 'mapa', 'pendientes'],
  theme: { primary: '#009C3B', accent: '#FFDF00', bg: '#FFFDF5' },
};
```

(Verificar nombres reales de exports en `rio.ts`/`sp.ts` y ajustar imports.)

- [ ] **Step 4:** `src/data/trips/bogota.ts`:

```ts
import type { TripConfig } from '../../types/trip';

export const bogota: TripConfig = {
  id: 'bogota-2026',
  name: 'Bogotá',
  flag: '🇨🇴',
  tagline: 'Nuestro primer viaje',
  status: 'past',
  startDate: '2026-01-01', // placeholder deliberado: preguntar fechas reales a Andrés en este paso (solo decorativo en la tarjeta)
  endDate: '2026-01-01',
  days: [],
  cities: [],
  modules: ['galeria'],
  theme: { primary: '#FCD116', accent: '#003893', bg: '#FFFDF5' },
};
```

**Nota ejecución:** preguntar a Andrés las fechas reales de Bogotá antes de commitear (solo se muestran en la tarjeta).

- [ ] **Step 5:** `src/data/trips/index.ts`:

```ts
import { brasil } from './brasil';
import { bogota } from './bogota';
export const trips = [brasil, bogota];
```

- [ ] **Step 6:** `npx tsc -b` → sin errores. Commit: `feat: trips registry (brasil 9 días, bogotá) + ciudad foz`

---

### Task 4: Supabase — proyecto + schema (manual con Andrés)

**Files:** Modify: `.env`, `.env.example`, `.github/workflows/deploy.yml`

- [ ] **Step 1 (Andrés, guiado):** Crear proyecto en https://supabase.com (org personal, plan free, región `sa-east-1` São Paulo — menor latencia en viaje). Obtener `Project URL` y `anon public key` (Settings → API).

- [ ] **Step 2:** SQL Editor → pegar y ejecutar:

```sql
-- Itinerario
create table itinerary_items (
  id uuid primary key default gen_random_uuid(),
  trip_id text not null,
  date date not null,
  time text,
  title text not null,
  place_id text,
  note text,
  created_by text not null,
  created_at timestamptz not null default now()
);

-- Selección de lugares (reemplaza flujo Gist)
create table place_selections (
  id uuid primary key default gen_random_uuid(),
  trip_id text not null,
  city_id text not null,
  place_id text not null,
  selected_by text not null,
  note text,
  created_at timestamptz not null default now(),
  unique (trip_id, city_id, place_id, selected_by)
);

-- Fase 2 de construcción usa estas; crearlas ya evita otra ronda de SQL:
create table flights (
  id uuid primary key default gen_random_uuid(),
  trip_id text not null,
  airline text not null,
  flight_number text,
  confirmation text,
  from_city text not null,
  to_city text not null,
  departs_at timestamptz not null,
  arrives_at timestamptz,
  note text,
  created_by text not null,
  created_at timestamptz not null default now()
);

create table hotels (
  id uuid primary key default gen_random_uuid(),
  trip_id text not null,
  name text not null,
  city_id text not null,
  address text,
  check_in date not null,
  check_out date not null,
  confirmation text,
  note text,
  created_by text not null,
  created_at timestamptz not null default now()
);

create table tickets (
  id uuid primary key default gen_random_uuid(),
  trip_id text not null,
  title text not null,
  date date,
  time text,
  file_path text,          -- ruta en bucket docs
  note text,
  created_by text not null,
  created_at timestamptz not null default now()
);

create table photos (
  id uuid primary key default gen_random_uuid(),
  trip_id text not null,
  file_path text not null,  -- ruta en bucket photos
  taken_on date,
  city_id text,
  caption text,
  uploaded_by text not null,
  created_at timestamptz not null default now()
);

create table checklist_items (
  id uuid primary key default gen_random_uuid(),
  trip_id text not null,
  text text not null,
  done boolean not null default false,
  created_by text not null,
  created_at timestamptz not null default now()
);

create table notes (
  id uuid primary key default gen_random_uuid(),
  trip_id text not null,
  body text not null,
  created_by text not null,
  created_at timestamptz not null default now()
);

-- RLS abierto a anon (privacidad por oscuridad, acordada en spec §3)
do $$
declare t text;
begin
  foreach t in array array['itinerary_items','place_selections','flights','hotels','tickets','photos','checklist_items','notes']
  loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy "anon_all" on %I for all using (true) with check (true)', t);
  end loop;
end $$;

-- Realtime
alter publication supabase_realtime add table
  itinerary_items, place_selections, flights, hotels, tickets, photos, checklist_items, notes;
```

- [ ] **Step 3:** Storage → crear buckets `docs` y `photos`, ambos **public**. Policies: permitir `insert`/`select`/`delete` a `anon` en ambos (Storage → Policies → new policy, template "Enable access to everyone").

- [ ] **Step 4:** `.env` local:

```
VITE_SUPABASE_URL=https://<proyecto>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>
VITE_ACCESS_CODE_HASH=<se genera en Task 6>
```

Replicar claves (sin valores) en `.env.example`. GitHub repo → Settings → Secrets → `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `ACCESS_CODE_HASH`.

- [ ] **Step 5:** `.github/workflows/deploy.yml` — en el step de build, junto al `VITE_GIST_TOKEN` existente, agregar:

```yaml
env:
  VITE_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
  VITE_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
  VITE_ACCESS_CODE_HASH: ${{ secrets.ACCESS_CODE_HASH }}
```

- [ ] **Step 6:** Commit: `chore: supabase env + deploy secrets` (solo `.env.example` y `deploy.yml`; `.env` está gitignored — verificar).

---

### Task 5: lib/supabase.ts + lib/realtime.ts (TDD en reducer)

**Files:** Create: `src/lib/supabase.ts`, `src/lib/realtime.ts`, Test: `src/lib/realtime.test.ts`

- [ ] **Step 1:** `src/lib/supabase.ts`:

```ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);
```

- [ ] **Step 2: Test que falla** — `src/lib/realtime.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { applyChange } from './realtime';

type Row = { id: string; title: string };
const rows: Row[] = [{ id: 'a', title: 'uno' }, { id: 'b', title: 'dos' }];

describe('applyChange', () => {
  it('INSERT agrega', () => {
    const out = applyChange(rows, { eventType: 'INSERT', new: { id: 'c', title: 'tres' }, old: {} });
    expect(out).toHaveLength(3);
  });
  it('INSERT no duplica id existente', () => {
    const out = applyChange(rows, { eventType: 'INSERT', new: { id: 'a', title: 'uno' }, old: {} });
    expect(out).toHaveLength(2);
  });
  it('UPDATE reemplaza por id', () => {
    const out = applyChange(rows, { eventType: 'UPDATE', new: { id: 'a', title: 'editado' }, old: { id: 'a' } });
    expect(out.find(r => r.id === 'a')!.title).toBe('editado');
  });
  it('DELETE quita por id', () => {
    const out = applyChange(rows, { eventType: 'DELETE', new: {}, old: { id: 'b' } });
    expect(out).toHaveLength(1);
  });
});
```

- [ ] **Step 3:** `npm run test` → FAIL

- [ ] **Step 4:** `src/lib/realtime.ts`:

```ts
import { useEffect, useState } from 'react';
import { supabase } from './supabase';

type ChangePayload = {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: Record<string, unknown>;
  old: Record<string, unknown>;
};

export function applyChange<T extends { id: string }>(rows: T[], p: ChangePayload): T[] {
  switch (p.eventType) {
    case 'INSERT': {
      const row = p.new as T;
      return rows.some(r => r.id === row.id) ? rows : [...rows, row];
    }
    case 'UPDATE': {
      const row = p.new as T;
      return rows.map(r => (r.id === row.id ? row : r));
    }
    case 'DELETE':
      return rows.filter(r => r.id !== (p.old as T).id);
  }
}

/** Select inicial + subscripción realtime, filtrado por trip_id. */
export function useTable<T extends { id: string }>(table: string, tripId: string) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase.from(table).select('*').eq('trip_id', tripId)
      .then(({ data }) => {
        if (active && data) setRows(data as T[]);
        if (active) setLoading(false);
      });
    const channel = supabase
      .channel(`${table}:${tripId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table, filter: `trip_id=eq.${tripId}` },
        payload => setRows(prev => applyChange(prev, payload as unknown as ChangePayload)))
      .subscribe();
    return () => { active = false; supabase.removeChannel(channel); };
  }, [table, tripId]);

  return { rows, loading };
}
```

- [ ] **Step 5:** `npm run test` → PASS. Commit: `feat: supabase client + useTable realtime hook`

---

### Task 6: lib/identity.ts (TDD)

**Files:** Create: `src/lib/identity.ts`, Test: `src/lib/identity.test.ts`

- [ ] **Step 1:** Elegir código secreto con Andrés (p.ej. una palabra que ambos sepan). Generar hash:

```bash
node -e "crypto.subtle.digest('SHA-256', new TextEncoder().encode('CODIGO_AQUI')).then(b => console.log(Buffer.from(b).toString('hex')))"
```

Pegar resultado en `.env` como `VITE_ACCESS_CODE_HASH` y en secret `ACCESS_CODE_HASH`.

- [ ] **Step 2: Test que falla** — `src/lib/identity.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { sha256Hex, getStoredIdentity, storeIdentity } from './identity';

describe('sha256Hex', () => {
  it('hashea determinístico', async () => {
    expect(await sha256Hex('hola')).toBe(
      'b221d9dbb083a7f33428d7c2a3c3198ae925614d70210e28716ccaa7cd4ddb79');
  });
});

describe('identity storage', () => {
  it('guarda y lee', () => {
    storeIdentity('melisa');
    expect(getStoredIdentity()).toBe('melisa');
  });
  it('null si no hay', () => {
    localStorage.clear();
    expect(getStoredIdentity()).toBeNull();
  });
});
```

vitest necesita DOM para localStorage: `npm i -D jsdom` y en `vite.config.ts` agregar `test: { environment: 'jsdom' }` (castear config si TS protesta, o crear `vitest.config.ts` separado).

- [ ] **Step 3:** `npm run test` → FAIL

- [ ] **Step 4:** `src/lib/identity.ts`:

```ts
import type { TravelerId } from '../types/trip';

const KEY = 'nuestros-viajes:identity';

export async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function checkAccessCode(code: string): Promise<boolean> {
  return (await sha256Hex(code.trim().toLowerCase())) === import.meta.env.VITE_ACCESS_CODE_HASH;
}

export function getStoredIdentity(): TravelerId | null {
  const v = localStorage.getItem(KEY);
  return v === 'andres' || v === 'melisa' ? v : null;
}

export function storeIdentity(id: TravelerId): void {
  localStorage.setItem(KEY, id);
}
```

(Identidad guardada implica código ya validado — un solo gate.)

- [ ] **Step 5:** `npm run test` → PASS. Commit: `feat: access gate logic + identidad persistente`

---

### Task 7: AccessGate UI

**Files:** Create: `src/components/gate/AccessGate.tsx`, Modify: `src/App.tsx`

**Antes de codificar UI:** invocar skill `ui-ux-pro-max` (y `impeccable` para crítica) — pantalla de bienvenida romántica/viajera, 2 pasos: código → elegir avatar Andrés/Melisa. framer-motion para transición entre pasos.

- [ ] **Step 1:** `AccessGate.tsx` — comportamiento:

```tsx
// Props: onUnlocked(identity: TravelerId)
// Paso 1: input código + botón; checkAccessCode() → si falla, shake (framer-motion) + mensaje
// Paso 2: dos tarjetas grandes "Andrés" / "Melisa" → storeIdentity() → onUnlocked()
// Si getStoredIdentity() != null al montar, App salta el gate por completo.
```

Estructura mínima (estilo final lo definen las skills de diseño):

```tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { checkAccessCode, storeIdentity } from '../../lib/identity';
import type { TravelerId } from '../../types/trip';

export function AccessGate({ onUnlocked }: { onUnlocked: (id: TravelerId) => void }) {
  const [step, setStep] = useState<'code' | 'who'>('code');
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);

  async function submit() {
    if (await checkAccessCode(code)) setStep('who');
    else setError(true);
  }
  function pick(id: TravelerId) {
    storeIdentity(id);
    onUnlocked(id);
  }
  // render: AnimatePresence con motion.div por paso; ver skills de diseño
  /* ... */
}
```

- [ ] **Step 2:** Verificar manual: `npm run dev` → pide código → código malo = error animado → código bueno → elegir persona → recarga página → entra directo (localStorage).
- [ ] **Step 3:** Commit: `feat: access gate (código + identidad)`

---

### Task 8: TripHub

**Files:** Create: `src/components/hub/TripHub.tsx`

**Diseño:** tarjetas grandes full-bleed por viaje. Brasil arriba (próximo): countdown grande "Faltan 13 días", tagline, gradiente tema Brasil. Bogotá: tono recuerdo/sepia, "Nuestro primer viaje". framer-motion stagger al entrar. Consultar `ui-ux-pro-max`.

- [ ] **Step 1:** `TripHub.tsx`:

```tsx
import { motion } from 'framer-motion';
import { trips } from '../../data/trips';
import { daysUntil } from '../../lib/dates';
import type { TripConfig } from '../../types/trip';

export function TripHub({ onOpen }: { onOpen: (trip: TripConfig) => void }) {
  return (
    <div className="min-h-screen p-4 space-y-4" style={{ background: '#FFFDF5' }}>
      <h1 className="text-2xl font-bold pt-4">Nuestros Viajes ✈️</h1>
      {trips.map((trip, i) => {
        const dias = trip.status === 'upcoming' ? daysUntil(trip.startDate) : null;
        return (
          <motion.button
            key={trip.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.12 }}
            onClick={() => onOpen(trip)}
            className="w-full rounded-3xl p-6 text-left shadow-lg"
            style={{ background: trip.theme.primary, color: 'white' }}
          >
            <div className="text-4xl">{trip.flag}</div>
            <div className="text-2xl font-bold">{trip.name}</div>
            <div className="opacity-90">{trip.tagline}</div>
            {dias !== null && dias > 0 && (
              <div className="mt-2 text-lg font-semibold">Faltan {dias} días 🎉</div>
            )}
            {trip.status === 'past' && <div className="mt-2 text-sm opacity-75">Recuerdos 📸</div>}
          </motion.button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2:** Verificar en dev (con App rewire de Task 10 o render temporal). Commit: `feat: hub de viajes con countdown`

---

### Task 9: TripShell + nav inferior

**Files:** Create: `src/components/shell/TripShell.tsx`

- [ ] **Step 1:** `TripShell.tsx` — nav inferior solo con módulos del viaje (`trip.modules`); Bogotá (1 módulo) no muestra nav:

```tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import type { TripConfig, ModuleId, TravelerId } from '../../types/trip';

const MODULE_META: Record<ModuleId, { label: string; icon: string }> = {
  inicio: { label: 'Inicio', icon: '🏠' },
  itinerario: { label: 'Días', icon: '🗓️' },
  logistica: { label: 'Vuelos', icon: '✈️' },
  lugares: { label: 'Lugares', icon: '📍' },
  galeria: { label: 'Fotos', icon: '🖼️' },
  mapa: { label: 'Mapa', icon: '🗺️' },
  pendientes: { label: 'Listas', icon: '✅' },
};

export function TripShell({ trip, identity, onBack, renderModule }: {
  trip: TripConfig;
  identity: TravelerId;
  onBack: () => void;
  renderModule: (m: ModuleId) => React.ReactNode;
}) {
  const [active, setActive] = useState<ModuleId>(trip.modules[0]);
  return (
    <div className="min-h-screen pb-20" style={{ background: trip.theme.bg }}>
      <header className="flex items-center gap-2 p-4">
        <button onClick={onBack} aria-label="Volver">←</button>
        <span className="font-bold">{trip.flag} {trip.name}</span>
      </header>
      <main>{renderModule(active)}</main>
      {trip.modules.length > 1 && (
        <nav className="fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur border-t flex">
          {trip.modules.map(m => (
            <button key={m} onClick={() => setActive(m)}
              className="flex-1 py-2 text-xs flex flex-col items-center"
              style={{ color: active === m ? trip.theme.primary : '#888' }}>
              <span className="text-xl">{MODULE_META[m].icon}</span>
              {MODULE_META[m].label}
              {active === m && <motion.div layoutId="nav-dot" className="w-1 h-1 rounded-full"
                style={{ background: trip.theme.primary }} />}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
```

7 módulos en nav = apretado en móvil; si skill `impeccable` lo objeta, mover Mapa+Pendientes a un "Más" — decidir en ejecución con la skill.

- [ ] **Step 2:** Commit: `feat: trip shell con nav inferior`

---

### Task 10: App.tsx rewire + InicioModule

**Files:** Modify: `src/App.tsx`, Create: `src/modules/inicio/InicioModule.tsx`

- [ ] **Step 1:** `InicioModule.tsx` — countdown hero, día actual del viaje (si está en curso: ciudad de hoy + items del itinerario de hoy vía `useTable`), accesos rápidos a módulos:

```tsx
import { useTable } from '../../lib/realtime';
import { daysUntil, formatDayEs, isToday } from '../../lib/dates';
import type { TripConfig, ItineraryItem } from '../../types/trip';

export function InicioModule({ trip }: { trip: TripConfig }) {
  const dias = daysUntil(trip.startDate);
  const hoy = trip.days.find(d => isToday(d.date));
  const { rows: items } = useTable<ItineraryItem>('itinerary_items', trip.id);
  const itemsHoy = hoy
    ? items.filter(i => i.date === hoy.date).sort((a, b) => (a.time ?? '99').localeCompare(b.time ?? '99'))
    : [];

  return (
    <div className="p-4 space-y-6">
      {dias > 0 && (
        <section className="rounded-3xl p-8 text-center text-white" style={{ background: trip.theme.primary }}>
          <div className="text-6xl font-black">{dias}</div>
          <div>días para {trip.name} {trip.flag}</div>
          <div className="text-sm opacity-80 mt-1">{formatDayEs(trip.startDate)}</div>
        </section>
      )}
      {hoy && (
        <section>
          <h2 className="font-bold text-lg">Hoy — {formatDayEs(hoy.date)}</h2>
          {hoy.note && <p className="text-sm text-amber-700">⚠️ {hoy.note}</p>}
          {itemsHoy.length === 0
            ? <p className="text-sm opacity-60">Sin plan aún — agrégalo en Días 🗓️</p>
            : itemsHoy.map(i => (
                <div key={i.id} className="py-2 border-b">
                  <span className="font-mono text-sm mr-2">{i.time ?? '—'}</span>{i.title}
                </div>
              ))}
        </section>
      )}
    </div>
  );
}
```

(Clima llega en Plan 3 — no incluirlo aún.)

- [ ] **Step 2:** Reescribir `src/App.tsx`:

```tsx
import { useState } from 'react';
import { AccessGate } from './components/gate/AccessGate';
import { TripHub } from './components/hub/TripHub';
import { TripShell } from './components/shell/TripShell';
import { InicioModule } from './modules/inicio/InicioModule';
import { getStoredIdentity } from './lib/identity';
import type { TripConfig, ModuleId, TravelerId } from './types/trip';

export default function App() {
  const [identity, setIdentity] = useState<TravelerId | null>(getStoredIdentity());
  const [trip, setTrip] = useState<TripConfig | null>(null);

  if (!identity) return <AccessGate onUnlocked={setIdentity} />;
  if (!trip) return <TripHub onOpen={setTrip} />;

  function renderModule(m: ModuleId) {
    switch (m) {
      case 'inicio': return <InicioModule trip={trip!} />;
      // itinerario (Task 12), lugares (Task 11) — los demás módulos: Plan 2/3
      default: return <div className="p-8 text-center opacity-60">Próximamente ✨</div>;
    }
  }
  return <TripShell trip={trip} identity={identity} onBack={() => setTrip(null)} renderModule={renderModule} />;
}
```

El contenido anterior de App.tsx (flujo selección/Gist) se preserva moviéndolo a `src/legacy/SelectionApp.tsx` sin importarlo (referencia para Task 11).

- [ ] **Step 3:** `npm run dev` — flujo completo: gate → hub → Brasil → Inicio con countdown. `npx tsc -b` limpio.
- [ ] **Step 4:** Commit: `feat: app rewire (gate→hub→shell) + módulo inicio`

---

### Task 11: LugaresModule + imágenes Foz

**Files:** Create: `src/modules/lugares/LugaresModule.tsx`, Modify: `src/data/cities/foz.ts`

- [ ] **Step 1:** `LugaresModule.tsx` — tabs de ciudad (Rio/Foz/SP), reusa `CategorySection`/`PlaceCard` existentes para explorar; el toggle de selección hace upsert/delete en `place_selections` (Supabase) con `selected_by = identity`. Leer firma actual de `PlaceCard` antes de integrar y adaptar props (hoy maneja días preferidos + notas; conservar notas, días preferidos solo informativo en este plan):

```tsx
// Estado: const { rows: selections } = useTable<PlaceSelection>('place_selections', trip.id)
// isSelected(placeId) = selections.some(s => s.place_id === placeId && s.selected_by === identity)
// toggle:
//   si no está → supabase.from('place_selections').insert({ trip_id, city_id, place_id, selected_by: identity })
//   si está   → supabase.from('place_selections').delete().match({ trip_id, city_id, place_id, selected_by: identity })
// Mostrar también selección del otro: corazón con inicial (A/M) en la card.
```

- [ ] **Step 2:** Imágenes Foz — seguir procedimiento documentado en context.md: Wikimedia Commons search API por lugar (Cataratas, Itaipu, Parque das Aves, etc. tienen fotos libres de sobra). Venues gastronómicos sin foto libre → `mapsUrl` fallback (patrón existente). **Validar en browser con Playwright** (`naturalWidth > 0`), NO con curl/Python (falsos negativos — regla del proyecto).

- [ ] **Step 3:** Verificar manual: marcar lugar en un browser normal y en otro en incógnito (otra identidad) → aparece en vivo en ambos.
- [ ] **Step 4:** Commit: `feat: módulo lugares con sync supabase + ciudad foz con fotos`

---

### Task 12: ItinerarioModule

**Files:** Create: `src/modules/itinerario/ItinerarioModule.tsx`, Modify: `src/App.tsx` (case)

- [ ] **Step 1:** Comportamiento:
  - Tabs horizontales de los 9 días (chip: "jue 25 · Rio"), scrollables; día de hoy resaltado.
  - Lista de `itinerary_items` del día ordenada por `time` (nulls al final).
  - FAB "+" → form inline: hora (opcional), título, nota; al guardar `insert` con `created_by: identity`, `date` del tab activo.
  - Item: tap → editar (update) / borrar (delete con confirm). Mostrar autor con inicial.
  - Banner con `day.note` si existe ('Tarde → vuelo a Iguazú').
  - Desde Lugares: botón "agregar al itinerario" abre selector de día → crea item con `place_id` y `title = place.name` (integración: exponer función `addPlaceToDay` o duplicar insert — decidir en ejecución, mínimo viable: en LugaresModule un select de día + insert directo).

```tsx
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useTable } from '../../lib/realtime';
import { formatDayEs, isToday } from '../../lib/dates';
import type { TripConfig, ItineraryItem, TravelerId } from '../../types/trip';

export function ItinerarioModule({ trip, identity }: { trip: TripConfig; identity: TravelerId }) {
  const [activeDate, setActiveDate] = useState(
    trip.days.find(d => isToday(d.date))?.date ?? trip.days[0].date);
  const { rows } = useTable<ItineraryItem>('itinerary_items', trip.id);
  const day = trip.days.find(d => d.date === activeDate)!;
  const items = rows.filter(i => i.date === activeDate)
    .sort((a, b) => (a.time ?? '99').localeCompare(b.time ?? '99'));

  async function addItem(time: string, title: string, note: string) {
    await supabase.from('itinerary_items').insert({
      trip_id: trip.id, date: activeDate, time: time || null,
      title, note: note || null, created_by: identity,
    });
  }
  async function removeItem(id: string) {
    await supabase.from('itinerary_items').delete().eq('id', id);
  }
  /* render: tabs (trip.days), banner day.note, lista items, form add — diseño con skills */
}
```

- [ ] **Step 2:** Agregar case en App.tsx: `case 'itinerario': return <ItinerarioModule trip={trip!} identity={identity} />;`
- [ ] **Step 3:** Verificar 2-browser sync igual que Task 11. `npm run test` + `npx tsc -b` limpios.
- [ ] **Step 4:** Commit: `feat: itinerario día-por-día con realtime`

---

### Task 13: Pulido + deploy

- [ ] **Step 1:** Pasada de diseño completa con skill `impeccable` sobre gate, hub, shell, inicio, itinerario, lugares (jerarquía, espaciado, estados vacíos, animaciones framer-motion consistentes).
- [ ] **Step 2:** `npm run build` limpio. Probar `npm run preview` en celular (misma red) — flujo entero.
- [ ] **Step 3:** Push a main → GitHub Actions deploy → verificar en URL de Pages desde 2 celulares (Andrés y Melisa), sync en vivo real.
- [ ] **Step 4:** Commit final + avisar a Andrés que comparta link+código a Melisa.

---

## Después de este plan

- **Plan 2:** Galería (Bogotá+Brasil, upload a bucket `photos`) + Logística (vuelos/hoteles/boletas, upload a `docs`, visor PDF/imagen).
- **Plan 3:** Mapa (Leaflet) + Clima (Open-Meteo) + Pendientes (checklist+notas) + PWA offline.

Schema SQL de esas fases ya queda creado en Task 4 (una sola ronda de setup con Andrés).
