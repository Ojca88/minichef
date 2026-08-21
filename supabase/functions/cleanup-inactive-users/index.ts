// supabase/functions/cleanup-inactive-users/index.ts
//
// Borrado automático por inactividad (punto 7 del documento). La dispara un
// cron interno de Supabase (pg_cron, ver migración SQL), no un usuario — por
// eso no valida un JWT de usuario, sino una cabecera secreta compartida
// (CRON_SECRET) para asegurarse de que solo el propio cron puede invocarla.
//
// Alcance: solo cuentas de Google (no anónimas). Las sesiones anónimas no
// tienen datos personales identificables (sin email, sin nombre real) más
// allá de lo que ya vive dentro del hogar, así que el motivo de privacidad
// que justifica este borrado automático (RGPD, retención de datos
// personales) no aplica de la misma forma — y borrarlas automáticamente
// además destruiría el acceso a hogares que sí pueden seguir en uso desde
// otro dispositivo. Esta decisión de alcance queda documentada aquí y en la
// política de privacidad.
//
// Usa auth.users.last_sign_in_at (campo fiable que ya mantiene Supabase
// Auth solo) en vez de inventar un campo propio, tal como pide el documento.
//
// Es idempotente: cada ejecución vuelve a consultar auth.users en vivo, así
// que un usuario ya borrado en una ejecución anterior simplemente no
// aparece en la siguiente — no hace falta guardar ningún estado propio de
// "ya procesado".

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { offboardUserFromHouseholds } from '../_shared/household-cleanup.ts';

const TWO_YEARS_MS = 2 * 365 * 24 * 60 * 60 * 1000;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  const cronSecret = Deno.env.get('CRON_SECRET');
  const providedSecret = req.headers.get('x-cron-secret');
  if (!cronSecret || providedSecret !== cronSecret) {
    return json({ error: 'NO_AUTORIZADO' }, 401);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const admin = createClient(supabaseUrl, serviceKey);

  const cutoff = new Date(Date.now() - TWO_YEARS_MS).toISOString();
  let usersDeleted = 0;
  let householdsDeleted = 0;
  const errors: string[] = [];

  try {
    // listUsers pagina de 1000 en 1000; para un proyecto de este tamaño de
    // sobra, pero se pagina igualmente por si crece.
    let page = 1;
    // deno-lint-ignore no-explicit-any
    let candidates: any[] = [];
    for (;;) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
      if (error) { errors.push(error.message); break; }
      const inactive = data.users.filter((u) =>
        !u.is_anonymous &&
        u.last_sign_in_at &&
        new Date(u.last_sign_in_at).toISOString() < cutoff
      );
      candidates = candidates.concat(inactive);
      if (data.users.length < 1000) break;
      page += 1;
    }

    for (const u of candidates) {
      try {
        const result = await offboardUserFromHouseholds(admin, u.id, null);
        householdsDeleted += result.householdsDeleted;
        // requiresDecision no debería poder pasar aquí (transferTo=null
        // implica auto-transferencia siempre que haya a quién), pero si
        // ocurriera, no forzamos nada automáticamente: lo saltamos y queda
        // para revisión manual en vez de arriesgarnos a un borrado ambiguo.
        if (result.requiresDecision) { continue; }

        const { error: deleteError } = await admin.auth.admin.deleteUser(u.id);
        if (deleteError) { errors.push(deleteError.message); continue; }
        usersDeleted += 1;
      } catch (e) {
        errors.push(String(e));
      }
    }

    // Registro sin datos personales: solo contadores y la fecha de la
    // ejecución (punto 7 del documento: "sin almacenar información
    // personal innecesaria").
    await admin.from('cleanup_log').insert({
      users_deleted: usersDeleted,
      households_deleted: householdsDeleted,
      errors_count: errors.length,
    });

    return json({ ok: true, usersDeleted, householdsDeleted, errorsCount: errors.length });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
