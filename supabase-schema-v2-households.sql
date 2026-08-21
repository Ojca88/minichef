-- ============================================================================
-- MiniChef — modelo de hogares/usuarios con login anónimo real + RLS
-- ============================================================================
-- Como el proyecto no tiene datos en producción todavía, esta migración
-- sustituye por completo el modelo anterior (código de 6 letras como clave
-- primaria, RLS abierto con `using (true)`) en vez de migrar datos.
--
-- Ejecuta esto entero en Supabase: Project -> SQL Editor -> New query -> Run
-- ============================================================================

-- 1) Habilita el login anónimo real de Supabase (Authentication -> Settings ->
--    "Allow anonymous sign-ins"). Esto NO se puede activar por SQL: tienes que
--    ir al panel y activarlo a mano. Sin esto, nada de lo de abajo funciona
--    para usuarios sin Google.

-- 2) Limpieza del modelo anterior (sin backup: no hay datos que conservar).
drop table if exists user_households cascade;
drop table if exists households cascade;

-- ============================================================================
-- Tablas
-- ============================================================================

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  email text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table households (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Mi hogar',
  invite_code text not null unique,
  created_by uuid references profiles(id) on delete set null,
  -- Mantenemos el menú/lista de la compra/comidas como un blob JSON, igual
  -- que antes: el documento pide que los datos "pertenezcan al hogar", no
  -- que estén en tablas separadas fila por fila. Normalizarlo del todo sería
  -- una reescritura mucho mayor sin beneficio de seguridad adicional (RLS ya
  -- protege la fila entera).
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table household_members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  created_at timestamptz not null default now(),
  unique (household_id, user_id)
);

alter publication supabase_realtime add table households;

-- ============================================================================
-- Perfil automático al crear cualquier usuario (anónimo o con Google)
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', new.email, 'Invitado'),
    new.email,
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Cuando alguien vincula su cuenta anónima a Google (o simplemente actualiza
-- su perfil de Google), refrescamos también profiles.
create or replace function public.handle_user_update()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  update public.profiles set
    display_name = coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', new.email, display_name),
    email = coalesce(new.email, email),
    avatar_url = coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', avatar_url),
    updated_at = now()
  where id = new.id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
  after update on auth.users
  for each row execute function public.handle_user_update();

-- ============================================================================
-- Funciones auxiliares para RLS (SECURITY DEFINER para evitar recursión al
-- consultar household_members desde sus propias policies)
-- ============================================================================
create or replace function public.is_household_member(target_household uuid)
returns boolean
language sql security definer stable set search_path = public
as $$
  select exists (
    select 1 from household_members
    where household_id = target_household and user_id = auth.uid()
  );
$$;

create or replace function public.is_household_owner(target_household uuid)
returns boolean
language sql security definer stable set search_path = public
as $$
  select exists (
    select 1 from household_members
    where household_id = target_household and user_id = auth.uid() and role = 'owner'
  );
$$;

-- ============================================================================
-- RLS
-- ============================================================================
alter table profiles enable row level security;
alter table households enable row level security;
alter table household_members enable row level security;

create policy "ver mi perfil y el de mis compañeros de hogar"
  on profiles for select to authenticated
  using (
    id = auth.uid()
    or exists (
      select 1 from household_members hm
      where hm.user_id = profiles.id and is_household_member(hm.household_id)
    )
  );

create policy "insertar mi propio perfil"
  on profiles for insert to authenticated
  with check (id = auth.uid());

create policy "actualizar mi propio perfil"
  on profiles for update to authenticated
  using (id = auth.uid());

create policy "ver mi hogar"
  on households for select to authenticated
  using (is_household_member(id));

create policy "actualizar mi hogar (cualquier miembro puede editar los datos compartidos)"
  on households for update to authenticated
  using (is_household_member(id));

create policy "el propietario puede borrar el hogar"
  on households for delete to authenticated
  using (is_household_owner(id));

-- Ninguna policy de INSERT para households ni household_members: se crean
-- exclusivamente a través de las funciones RPC de abajo (SECURITY DEFINER),
-- nunca insertando directamente desde el cliente.

create policy "ver miembros de mi hogar"
  on household_members for select to authenticated
  using (is_household_member(household_id));

create policy "salir del hogar, o ser expulsado por el propietario"
  on household_members for delete to authenticated
  using (user_id = auth.uid() or is_household_owner(household_id));

create policy "el propietario puede cambiar roles"
  on household_members for update to authenticated
  using (is_household_owner(household_id));

-- ============================================================================
-- Generación de código de invitación (alfabeto sin caracteres ambiguos:
-- sin 0/O ni 1/I, igual que ya usaba el frontend)
-- ============================================================================
create or replace function public.generate_invite_code()
returns text
language plpgsql set search_path = public
as $$
declare
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i int;
begin
  for i in 1..6 loop
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  end loop;
  return result;
end;
$$;

-- ============================================================================
-- RPCs: crear, unirse, salir, regenerar código, transferir propiedad, borrar
-- ============================================================================
create or replace function public.create_household(household_name text default 'Mi hogar')
returns households
language plpgsql security definer set search_path = public
as $$
declare
  new_household households;
  new_code text;
begin
  loop
    new_code := generate_invite_code();
    exit when not exists (select 1 from households where invite_code = new_code);
  end loop;

  insert into households (name, invite_code, created_by, data)
  values (coalesce(nullif(trim(household_name), ''), 'Mi hogar'), new_code, auth.uid(), '{}'::jsonb)
  returning * into new_household;

  insert into household_members (household_id, user_id, role)
  values (new_household.id, auth.uid(), 'owner');

  return new_household;
end;
$$;

create or replace function public.join_household(code text)
returns households
language plpgsql security definer set search_path = public
as $$
declare
  target households;
begin
  select * into target from households where invite_code = upper(trim(code));
  if not found then
    raise exception 'CODIGO_INVALIDO' using errcode = 'P0001';
  end if;

  insert into household_members (household_id, user_id, role)
  values (target.id, auth.uid(), 'member')
  on conflict (household_id, user_id) do nothing;

  return target;
end;
$$;

create or replace function public.leave_household(target_household uuid)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  delete from household_members where household_id = target_household and user_id = auth.uid();
end;
$$;

create or replace function public.regenerate_invite_code(target_household uuid)
returns text
language plpgsql security definer set search_path = public
as $$
declare
  new_code text;
begin
  if not is_household_owner(target_household) then
    raise exception 'SOLO_EL_PROPIETARIO_PUEDE_REGENERAR' using errcode = 'P0001';
  end if;

  loop
    new_code := generate_invite_code();
    exit when not exists (select 1 from households where invite_code = new_code);
  end loop;

  update households set invite_code = new_code, updated_at = now() where id = target_household;
  return new_code;
end;
$$;

create or replace function public.transfer_household_ownership(target_household uuid, new_owner uuid)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not is_household_owner(target_household) then
    raise exception 'NO_AUTORIZADO' using errcode = 'P0001';
  end if;
  if not exists (select 1 from household_members where household_id = target_household and user_id = new_owner) then
    raise exception 'EL_NUEVO_PROPIETARIO_NO_ES_MIEMBRO' using errcode = 'P0001';
  end if;
  update household_members set role = 'member' where household_id = target_household and user_id = auth.uid();
  update household_members set role = 'owner' where household_id = target_household and user_id = new_owner;
end;
$$;

-- Borrado fuerte: exige escribir el nombre exacto del hogar, como pide el
-- documento (paso de confirmación explícito, no solo un botón).
create or replace function public.delete_household(target_household uuid, confirm_name text)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  h households;
begin
  select * into h from households where id = target_household;
  if not found or not is_household_owner(target_household) then
    raise exception 'NO_AUTORIZADO' using errcode = 'P0001';
  end if;
  if h.name <> confirm_name then
    raise exception 'NOMBRE_NO_COINCIDE' using errcode = 'P0001';
  end if;
  delete from households where id = target_household; -- household_members cae en cascada
end;
$$;

-- NOTA sobre esta función: devuelve "setof households" (no "households" a
-- secas) a propósito. Con "returns households" (una sola fila), si la
-- consulta no encuentra ningún hogar, Postgres no devuelve "nada": devuelve
-- UNA fila con todos los campos en null (id incluido) — un fallo sutil que
-- hacía que la app mostrara una tarjeta de hogar "fantasma" vacía en vez de
-- la pantalla de "crear/unirse". Con "setof" se comporta como una consulta
-- normal: 0 filas si no hay hogar, 1 fila si lo hay.
drop function if exists public.my_household();
create function public.my_household()
returns setof households
language sql security definer stable set search_path = public
as $$
  select h.* from households h
  join household_members hm on hm.household_id = h.id
  where hm.user_id = auth.uid()
  order by hm.created_at asc
  limit 1;
$$;

create or replace function public.save_household_data(target_household uuid, new_data jsonb)
returns households
language plpgsql security definer set search_path = public
as $$
declare
  updated households;
begin
  if not is_household_member(target_household) then
    raise exception 'NO_AUTORIZADO' using errcode = 'P0001';
  end if;
  update households set data = new_data, updated_at = now()
  where id = target_household
  returning * into updated;
  return updated;
end;
$$;
