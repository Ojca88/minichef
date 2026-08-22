-- ============================================================================
-- MiniChef — corrección: permitir leer tu propio feedback (no el de otros)
-- ============================================================================
-- Por qué: la app hace `.insert(...).select()` para poder recuperar el id
-- de la fila recién creada (y así avisar por email). Eso requiere permiso
-- de LECTURA sobre esa fila, aunque sea solo un instante. Al no existir
-- ninguna política de SELECT, la operación fallaba entera (se deshacía el
-- insert también) con "row-level security policy violation" — el mensaje
-- era el mismo tanto si el problema era de INSERT como de SELECT, lo que lo
-- hizo difícil de diagnosticar a simple vista.
--
-- El documento original solo pedía que no se pudiera leer el feedback DE
-- OTROS usuarios — no prohibía leer el tuyo propio. Esta política respeta
-- esa regla exactamente: cada uno solo ve sus propias filas, nunca las de
-- nadie más.
--
-- Ejecuta esto en Supabase: Project -> SQL Editor -> New query -> Run

create policy "leer mi propio feedback"
  on feedback for select to authenticated
  using (user_id = auth.uid());
