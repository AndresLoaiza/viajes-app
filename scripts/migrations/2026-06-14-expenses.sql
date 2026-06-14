-- Gastos compartidos. Crea la tabla `expenses` con el mismo patrón que el resto
-- (RLS abierta para anon, realtime, replica identity full).
-- Aplicar en Supabase Dashboard → SQL Editor (o vía psycopg con SUPABASE_DB_PASSWORD).
--
-- DESPUÉS de correr esto, activar la UI: en src/modules/logistica/LogisticaModule.tsx
-- descomentar las 2 líneas marcadas con「Gastos」(import + <GastosSection ... />).

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  trip_id text not null,
  description text not null,
  amount numeric not null,
  currency text not null default 'COP',
  paid_by text not null,
  category text,
  spent_on date,
  created_by text not null,
  created_at timestamptz not null default now()
);

alter table public.expenses enable row level security;

do $$ begin
  if not exists (select 1 from pg_policy where polrelid = 'public.expenses'::regclass and polname = 'anon_all') then
    create policy anon_all on public.expenses for all using (true) with check (true);
  end if;
end $$;

grant all on public.expenses to anon, authenticated;

alter table public.expenses replica identity full;

do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'expenses') then
    alter publication supabase_realtime add table public.expenses;
  end if;
end $$;
