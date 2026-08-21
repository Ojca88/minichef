-- ============================================================================
-- MiniChef — conservación y borrado automático tras 2 años de inactividad
-- ============================================================================
-- Ejecuta esto en Supabase: Project -> SQL Editor -> New query -> Run
-- Requiere haber desplegado antes la función cleanup-inactive-users
-- (supabase functions deploy cleanup-inactive-users) y haber configurado su
-- secreto CRON_SECRET (ver instrucciones al final de este archivo).
-- ============================================================================

-- Registro de cada ejecución de la limpieza automática. Solo contadores,
-- nunca datos personales (nombres, emails, ids de usuario...).
create table if not exists cleanup_log (
  id uuid primary key default gen_random_uuid(),
  run_at timestamptz not null default now(),
  users_deleted int not null default 0,
  households_deleted int not null default 0,
  errors_count int not null default 0
);

alter table cleanup_log enable row level security;
-- Nadie del cliente necesita leer esto nunca (ni falta que hace tampoco
-- escribir desde el cliente: solo lo hace la Edge Function, con
-- service_role, que salta RLS). No se crea ninguna policy a propósito: por
-- defecto, sin policies, ni siquiera un usuario autenticado puede leer ni
-- escribir esta tabla.

-- Habilita las extensiones necesarias para programar la llamada HTTP
-- periódica (suelen venir ya activadas en proyectos nuevos de Supabase,
-- pero por si acaso).
create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

-- Programa la limpieza a diario a las 03:00 UTC. Sustituye
-- TU_PROJECT_REF y TU_CRON_SECRET antes de ejecutar este bloque (los dos
-- últimos valores del archivo, ver instrucciones abajo).
select cron.schedule(
  'minichef-cleanup-inactive-users',
  '0 3 * * *',
  $$
  select net.http_post(
    url := 'https://TU_PROJECT_REF.supabase.co/functions/v1/cleanup-inactive-users',
    headers := jsonb_build_object('x-cron-secret', 'TU_CRON_SECRET'),
    body := '{}'::jsonb
  );
  $$
);

-- ============================================================================
-- Cómo terminar de configurar esto (fuera de este SQL):
--
-- 1. Genera un secreto aleatorio largo tú mismo (por ejemplo, con
--    `openssl rand -hex 32` en una terminal, o cualquier generador de
--    contraseñas de al menos 32 caracteres).
--
-- 2. Guárdalo como variable de entorno de la Edge Function:
--      npx supabase secrets set CRON_SECRET=el_secreto_que_generaste
--
-- 3. Sustituye TU_PROJECT_REF (el id de tu proyecto, el mismo que usas en
--    `supabase link --project-ref ...`) y TU_CRON_SECRET (el mismo secreto
--    del paso 1) en el bloque `cron.schedule` de arriba, y ejecuta ESTE
--    archivo completo en el SQL Editor.
--
-- 4. Para comprobar que quedó programado:
--      select * from cron.job;
--
-- 5. Para forzar una ejecución de prueba sin esperar al cron:
--      select net.http_post(
--        url := 'https://TU_PROJECT_REF.supabase.co/functions/v1/cleanup-inactive-users',
--        headers := jsonb_build_object('x-cron-secret', 'TU_CRON_SECRET'),
--        body := '{}'::jsonb
--      );
--    y después: select * from cleanup_log order by run_at desc limit 5;
-- ============================================================================
