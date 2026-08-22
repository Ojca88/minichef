-- ============================================================================
-- MiniChef — feedback de usuarios (errores, sugerencias, comentarios)
-- ============================================================================
-- Ejecuta esto en Supabase: Project -> SQL Editor -> New query -> Run

create table feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete set null,
  household_id uuid references households(id) on delete set null,
  email text,
  type text not null check (type in ('bug', 'suggestion', 'positive', 'other')),
  message text not null,
  steps_to_reproduce text,
  expected_behavior text,
  actual_behavior text,
  page_url text,
  app_version text,
  device_type text,
  browser text,
  os text,
  attachment_path text,
  status text not null default 'new' check (status in ('new', 'reviewing', 'planned', 'resolved', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_feedback_user on feedback(user_id);
create index idx_feedback_status on feedback(status);
create index idx_feedback_type on feedback(type);
create index idx_feedback_created on feedback(created_at);

alter table feedback enable row level security;

-- ============================================================================
-- Límite de envíos: máximo 10 comentarios por usuario y día. Se define
-- primero la función, porque la policy de INSERT la usa directamente en su
-- condición — así el límite se aplica en el propio servidor, sin que el
-- cliente tenga que comprobarlo aparte antes de enviar.
-- ============================================================================
create or replace function public.check_feedback_rate_limit(p_user_id uuid)
returns boolean
language sql security definer stable set search_path = public
as $$
  select count(*) < 10
  from feedback
  where user_id = p_user_id and created_at > now() - interval '1 day';
$$;

-- Un usuario puede crear su propio feedback, siempre que no haya superado
-- el límite de 10 al día...
create policy "crear mi propio feedback"
  on feedback for insert to authenticated
  with check (user_id = auth.uid() and check_feedback_rate_limit(auth.uid()));

-- ...pero NO puede leer, modificar ni borrar feedback de nadie (ni el suyo
-- propio siquiera: una vez enviado, es una vía de un solo sentido hacia el
-- responsable de la app — a propósito, así lo pedía el documento). Sin
-- policies de select/update/delete para el rol "authenticated": por
-- defecto, sin policy, esas operaciones quedan bloqueadas para todo el
-- mundo salvo quien use la service_role key (el responsable, vía el panel
-- de Supabase directamente).

-- ============================================================================
-- Storage privado para las capturas adjuntas
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('feedback-attachments', 'feedback-attachments', false)
on conflict (id) do nothing;

-- Cada archivo se sube con la ruta "<user_id>/<nombre>", así la policy
-- puede comprobar de quién es solo mirando el primer segmento de la ruta —
-- sin necesitar una tabla aparte para saberlo.
create policy "subir mis propias capturas"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'feedback-attachments' and (storage.foldername(name))[1] = auth.uid()::text);

-- Nadie (ni el propio usuario) puede leer las capturas directamente desde
-- el cliente — a propósito. El responsable las consulta con la
-- service_role key o generando una URL firmada desde un contexto de
-- servidor, nunca con acceso público permanente.
