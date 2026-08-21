// supabase/functions/delete-account/index.ts
//
// Único lugar de todo el proyecto que usa la service_role key — y solo
// aquí, en un servidor de Supabase, nunca en el navegador (ver punto 11.3
// del documento de seguridad). El frontend nunca ve ni puede ver esta clave.
//
// Baja voluntaria: el usuario decide él mismo (transferir propiedad, o
// borrar el hogar) cuando hace falta una decisión — ver
// offboardUserFromHouseholds en _shared/household-cleanup.ts, compartido
// con el borrado automático por inactividad.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { offboardUserFromHouseholds } from '../_shared/household-cleanup.ts';

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

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) return json({ error: 'NO_AUTORIZADO' }, 401);

    const admin = createClient(supabaseUrl, serviceKey);

    const body = await req.json().catch(() => ({}));
    const transferTo = typeof body?.transferTo === 'string' ? body.transferTo : null;
    const alsoDeleteHousehold = body?.deleteHousehold === true;

    // Si el usuario pide explícitamente borrar el hogar (en vez de
    // transferirlo), lo hacemos aparte antes de llamar al offboarding
    // genérico, que si no siempre intenta transferir cuando hay más gente.
    if (alsoDeleteHousehold && !transferTo) {
      const { data: memberships } = await admin
        .from('household_members')
        .select('household_id, role')
        .eq('user_id', user.id)
        .eq('role', 'owner');
      for (const m of memberships ?? []) {
        await admin.from('households').delete().eq('id', m.household_id);
      }
    }

    const result = await offboardUserFromHouseholds(admin, user.id, transferTo);
    if (result.requiresDecision) {
      return json({ error: 'REQUIERE_DECISION', householdId: result.requiresDecision }, 409);
    }

    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
    if (deleteError) return json({ error: deleteError.message }, 500);

    return json({ ok: true });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
