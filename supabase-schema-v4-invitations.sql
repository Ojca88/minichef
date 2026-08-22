-- ============================================================================
-- MiniChef — sistema de invitaciones por email (el código deja de dar acceso)
-- ============================================================================
-- Ejecuta esto en Supabase: Project -> SQL Editor -> New query -> Run
--
-- Qué cambia respecto al modelo anterior:
--  - La tabla `households` y `household_members` NO cambian de forma (se
--    reutilizan tal cual).
--  - `join_household(code)` (unirse solo con el código) se ELIMINA: ya no
--    debe existir ninguna vía para entrar a un hogar solo con el código.
--  - Se añade `household_invitations`: cada invitación es un token propio,
--    ligado a un email concreto, con caducidad y estado.
--  - Se añade la restricción "un usuario solo pertenece a un hogar a la vez".
-- ============================================================================

-- ============================================================================
-- ANTES DE EJECUTAR: comprueba que nadie pertenece ya a más de un hogar
-- (muy posible si has estado probando la app tú mismo). Ejecuta esto suelto
-- primero:
--
--   select user_id, count(*) from household_members group by user_id having count(*) > 1;
--
-- Si devuelve alguna fila, decide para cada usuario qué hogar quieres que
-- conserve (por ejemplo, el más reciente) y borra manualmente sus otras
-- filas de household_members antes de continuar:
--
--   delete from household_members where user_id = '<ID>' and household_id = '<ID_A_QUITAR>';
--
-- Solo cuando la consulta de arriba devuelva 0 filas, ejecuta el resto de
-- este archivo.
-- ============================================================================

-- 1) Un usuario solo puede pertenecer a un hogar simultáneamente (regla de
--    negocio explícita del documento, punto 12/20).
alter table household_members
  add constraint household_members_one_household_per_user unique (user_id);

-- 2) Elimina la vía de "entrar solo con el código" — a partir de ahora la
--    pertenencia se concede exclusivamente por invitación aceptada.
drop function if exists public.join_household(text);

-- ============================================================================
-- Tabla de invitaciones
-- ============================================================================
create table household_invitations (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  invited_email text not null,
  invited_by uuid not null references profiles(id) on delete cascade,
  token_hash text not null,               -- hash del token; el token en claro nunca se guarda
  status text not null default 'pending' check (status in ('pending', 'accepted', 'expired', 'revoked')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  accepted_at timestamptz,
  accepted_by uuid references profiles(id) on delete set null,
  revoked_at timestamptz,
  updated_at timestamptz not null default now()
);

create index idx_invitations_household on household_invitations(household_id);
create index idx_invitations_email on household_invitations(lower(invited_email));
create index idx_invitations_token_hash on household_invitations(token_hash);
create index idx_invitations_status on household_invitations(status);
create index idx_invitations_expires on household_invitations(expires_at);

-- Solo una invitación "pending" activa por email+hogar a la vez (evita
-- duplicados; reenviar debe revocar la anterior antes de crear una nueva).
create unique index idx_invitations_one_pending_per_email
  on household_invitations(household_id, lower(invited_email))
  where status = 'pending';

alter table household_invitations enable row level security;

-- Solo miembros del hogar pueden ver las invitaciones de SU hogar (nunca de
-- otro, y nunca un usuario externo).
create policy "ver invitaciones de mi hogar"
  on household_invitations for select to authenticated
  using (is_household_member(household_id));

-- La creación, aceptación y revocación pasan siempre por Edge Functions
-- (SECURITY DEFINER) — a propósito no hay policies de insert/update/delete
-- para household_invitations, igual que ya se hacía con households.

-- ============================================================================
-- Rate limiting: máximo 5 invitaciones/reenvíos por usuario y hora
-- ============================================================================
create table invitation_rate_limits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index idx_rate_limits_user_time on invitation_rate_limits(user_id, created_at);
alter table invitation_rate_limits enable row level security;
-- Sin policies: solo lo toca la Edge Function con service_role.

create or replace function public.check_invitation_rate_limit(p_user_id uuid)
returns boolean
language sql security definer stable set search_path = public
as $$
  select count(*) < 5
  from invitation_rate_limits
  where user_id = p_user_id and created_at > now() - interval '1 hour';
$$;

-- ============================================================================
-- Limpieza: invitaciones caducadas pasan a 'expired' automáticamente al
-- consultarlas (no hace falta un cron aparte solo para esto).
-- ============================================================================
create or replace function public.expire_stale_invitations()
returns void
language sql security definer set search_path = public
as $$
  update household_invitations
  set status = 'expired', updated_at = now()
  where status = 'pending' and expires_at < now();
$$;

-- ============================================================================
-- Aceptar invitación — atómica (una sola función = una sola transacción, así
-- que si dos dispositivos aceptan la misma invitación a la vez, solo uno
-- gana; el otro recibe YA_UTILIZADA). Nunca confía en el email que diga el
-- cliente: lee siempre profiles.email, la copia que ya guardamos de verdad
-- de Google en el momento del login.
-- ============================================================================
create or replace function public.accept_household_invitation(p_token_hash text)
returns json
language plpgsql security definer set search_path = public
as $$
declare
  v_invitation household_invitations;
  v_user_id uuid := auth.uid();
  v_user_email text;
begin
  if v_user_id is null then
    return json_build_object('error', 'NO_AUTORIZADO');
  end if;

  select email into v_user_email from profiles where id = v_user_id;
  if v_user_email is null then
    return json_build_object('error', 'NECESITAS_GOOGLE');
  end if;

  -- Reclama la invitación: esta UPDATE es la operación atómica que decide
  -- quién gana en caso de dos aceptaciones simultáneas.
  update household_invitations
  set status = 'accepted', accepted_at = now(), accepted_by = v_user_id, updated_at = now()
  where token_hash = p_token_hash and status = 'pending' and expires_at > now()
  returning * into v_invitation;

  if v_invitation is null then
    select * into v_invitation from household_invitations where token_hash = p_token_hash;
    if v_invitation is null then
      return json_build_object('error', 'TOKEN_INVALIDO');
    elsif v_invitation.expires_at < now() then
      update household_invitations set status = 'expired', updated_at = now() where id = v_invitation.id and status = 'pending';
      return json_build_object('error', 'CADUCADA');
    elsif v_invitation.status = 'revoked' then
      return json_build_object('error', 'REVOCADA');
    else
      return json_build_object('error', 'YA_UTILIZADA');
    end if;
  end if;

  if lower(v_invitation.invited_email) <> lower(v_user_email) then
    update household_invitations set status = 'pending', accepted_at = null, accepted_by = null, updated_at = now()
    where id = v_invitation.id;
    return json_build_object('error', 'EMAIL_NO_COINCIDE', 'invited_email', v_invitation.invited_email);
  end if;

  if exists (select 1 from household_members where user_id = v_user_id) then
    update household_invitations set status = 'pending', accepted_at = null, accepted_by = null, updated_at = now()
    where id = v_invitation.id;
    return json_build_object('error', 'YA_TIENES_HOGAR');
  end if;

  insert into household_members (household_id, user_id, role) values (v_invitation.household_id, v_user_id, 'member');

  return json_build_object('ok', true, 'household_id', v_invitation.household_id);
end;
$$;

-- ============================================================================
-- Revocar invitación — solo el propietario del hogar correspondiente.
-- ============================================================================
create or replace function public.revoke_household_invitation(p_invitation_id uuid)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  v_household_id uuid;
begin
  select household_id into v_household_id from household_invitations where id = p_invitation_id;
  if v_household_id is null or not is_household_owner(v_household_id) then
    raise exception 'NO_AUTORIZADO' using errcode = 'P0001';
  end if;
  update household_invitations set status = 'revoked', revoked_at = now(), updated_at = now()
  where id = p_invitation_id and status = 'pending';
end;
$$;
