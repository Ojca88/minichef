// supabase/functions/delete-account/index.ts
//
// Único lugar de todo el proyecto que usa la service_role key — y solo
// aquí, en un servidor de Supabase, nunca en el navegador (ver punto 11.3
// del documento de seguridad). El frontend nunca ve ni puede ver esta clave.
//
// Qué hace, en orden:
//   1. Valida quién es el usuario a partir de su propio token (no se fía de
//      nada que mande el cliente en el body para decidir identidad).
//   2. Mira de qué hogares es "owner". Para cada uno:
//        - Si es el único miembro -> borra el hogar entero (no tiene
//          sentido dejar un hogar vacío para siempre).
//        - Si hay más miembros y el cliente no ha dicho qué hacer ->
//          responde 409 REQUIERE_DECISION (el frontend debe preguntar:
//          ¿transferir a alguien, o borrar el hogar entero?).
//        - Si el cliente indicó transferTo o deleteHousehold, lo aplica.
//   3. Borra el usuario de auth.users. Los ON DELETE CASCADE de profiles y
//      household_members hacen el resto automáticamente.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'NO_AUTORIZADO' }, 401);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Cliente "de usuario": solo sirve para averiguar quién hace la
    // petición, validando su token de verdad contra Supabase Auth.
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) return json({ error: 'NO_AUTORIZADO' }, 401);

    // Cliente "admin": el único que puede borrar usuarios de auth.users.
    const admin = createClient(supabaseUrl, serviceKey);

    const body = await req.json().catch(() => ({}));
    const transferTo = typeof body?.transferTo === 'string' ? body.transferTo : null;
    const alsoDeleteHousehold = body?.deleteHousehold === true;

    const { data: memberships } = await admin
      .from('household_members')
      .select('household_id, role')
      .eq('user_id', user.id);

    for (const m of memberships ?? []) {
      if (m.role !== 'owner') continue;

      const { data: others } = await admin
        .from('household_members')
        .select('user_id')
        .eq('household_id', m.household_id)
        .neq('user_id', user.id);

      const hasOtherMembers = (others ?? []).length > 0;

      if (!hasOtherMembers) {
        // Único miembro: el hogar se queda vacío para siempre si no se borra.
        await admin.from('households').delete().eq('id', m.household_id);
        continue;
      }

      if (transferTo) {
        const isRealMember = (others ?? []).some((o) => o.user_id === transferTo);
        if (!isRealMember) return json({ error: 'DESTINO_NO_ES_MIEMBRO' }, 400);
        await admin.from('household_members').update({ role: 'member' })
          .eq('household_id', m.household_id).eq('user_id', user.id);
        await admin.from('household_members').update({ role: 'owner' })
          .eq('household_id', m.household_id).eq('user_id', transferTo);
      } else if (alsoDeleteHousehold) {
        await admin.from('households').delete().eq('id', m.household_id);
      } else {
        return json({ error: 'REQUIERE_DECISION', householdId: m.household_id }, 409);
      }
    }

    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
    if (deleteError) return json({ error: deleteError.message }, 500);

    return json({ ok: true });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
