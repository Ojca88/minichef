-- Ejecuta esto en Supabase: Project -> SQL Editor -> New query -> Run

create table if not exists households (
  code text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- RLS activado. Como la app no usa login (solo un código de 6 letras),
-- el propio código actúa como "contraseña": cualquiera que lo conozca puede
-- leer y escribir esa fila. Es el mismo modelo de confianza que un PIN de
-- videollamada o un código de una partida online -- adecuado para compartir
-- el menú en casa, pero ten en cuenta que no es un sistema de cuentas real.
alter table households enable row level security;

create policy "anon puede leer households"
  on households for select
  to anon
  using (true);

create policy "anon puede crear households"
  on households for insert
  to anon
  with check (true);

create policy "anon puede actualizar households"
  on households for update
  to anon
  using (true);

-- Habilita las actualizaciones en tiempo real (necesario para que un
-- dispositivo vea al instante los cambios hechos en otro).
alter publication supabase_realtime add table households;
