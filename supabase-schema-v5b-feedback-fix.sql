-- ============================================================================
-- MiniChef — corrección: separar el límite de envíos de feedback de la
-- política RLS de inserción.
-- ============================================================================
-- Por qué: cuando el límite de 10/día vivía DENTRO de la condición de la
-- policy de INSERT (junto con "user_id = auth.uid()"), Postgres devuelve el
-- mismo código de error genérico (42501, "row-level security policy
-- violation") sin importar CUÁL de las dos condiciones fallara. Eso hacía
-- que el frontend mostrara "demasiados comentarios hoy" ante CUALQUIER
-- fallo de permisos, aunque fuera por otro motivo — como acabó pasando en
-- la primera prueba real.
--
-- Ahora el límite se comprueba explícitamente ANTES de intentar guardar
-- nada (desde el frontend, llamando a check_feedback_rate_limit como RPC),
-- así el mensaje que ve el usuario corresponde de verdad al motivo real.
--
-- Ejecuta esto en Supabase: Project -> SQL Editor -> New query -> Run

drop policy if exists "crear mi propio feedback" on feedback;

create policy "crear mi propio feedback"
  on feedback for insert to authenticated
  with check (user_id = auth.uid());
