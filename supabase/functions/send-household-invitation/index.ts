// supabase/functions/send-household-invitation/index.ts
//
// Único punto de todo el sistema de invitaciones que toca un secreto de
// verdad (RESEND_API_KEY) — por eso es una Edge Function y no una función
// RPC de Postgres (que no puede hacer peticiones HTTP a un proveedor de
// email externo).
//
// También hace de "reenviar": si ya existe una invitación pendiente para el
// mismo email en el mismo hogar, la revoca y crea una nueva con un token
// distinto (nunca hay dos tokens válidos a la vez para el mismo destino).
//
// Decisión de permisos: solo el propietario del hogar puede invitar (igual
// que ya ocurre con regenerar código, transferir propiedad o borrar el
// hogar) — por coherencia con el resto del modelo de permisos ya
// implementado, documentado aquí tal como pide el punto 22/TEST 14 del
// documento.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ALLOWED_ORIGINS = [
  'https://minichef-ojca.vercel.app',
  'http://localhost:5173',
];

function corsHeadersFor(req: Request) {
  const origin = req.headers.get('Origin') ?? '';
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Vary': 'Origin',
  };
}

function json(body: unknown, status: number, corsHeaders: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function randomToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  // base64url, sin relleno — seguro para ir en una URL
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

Deno.serve(async (req) => {
  const corsHeaders = corsHeadersFor(req);
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'NO_AUTORIZADO' }, 401, corsHeaders);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const emailFrom = Deno.env.get('EMAIL_FROM') || 'MiniChef <onboarding@resend.dev>';

    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) return json({ error: 'NO_AUTORIZADO' }, 401, corsHeaders);

    const body = await req.json().catch(() => ({}));
    const invitedEmail = String(body?.email || '').trim().toLowerCase();
    if (!isValidEmail(invitedEmail)) return json({ error: 'EMAIL_INVALIDO' }, 400, corsHeaders);

    const admin = createClient(supabaseUrl, serviceKey);

    // El invitador debe pertenecer a un hogar y ser su propietario.
    const { data: membership } = await admin
      .from('household_members')
      .select('household_id, role')
      .eq('user_id', user.id)
      .maybeSingle();
    if (!membership) return json({ error: 'SIN_HOGAR' }, 400, corsHeaders);
    if (membership.role !== 'owner') return json({ error: 'SOLO_EL_PROPIETARIO_PUEDE_INVITAR' }, 403, corsHeaders);

    // Límite de invitaciones/reenvíos: 5 por usuario y hora.
    const { data: withinLimit } = await admin.rpc('check_invitation_rate_limit', { p_user_id: user.id });
    if (!withinLimit) return json({ error: 'DEMASIADAS_INVITACIONES' }, 429, corsHeaders);

    // ¿Ese email ya pertenece a alguien del hogar?
    const { data: existingMembers } = await admin
      .from('household_members')
      .select('user_id, profiles(email)')
      .eq('household_id', membership.household_id);
    const alreadyMember = (existingMembers ?? []).some(
      (m: { profiles?: { email?: string } }) => m.profiles?.email?.toLowerCase() === invitedEmail
    );
    if (alreadyMember) return json({ error: 'YA_ES_MIEMBRO' }, 400, corsHeaders);

    // Reenvío: si ya hay una invitación pendiente para este email en este
    // hogar, la revocamos antes de crear la nueva (nunca dos tokens vivos).
    await admin.from('household_invitations')
      .update({ status: 'revoked', revoked_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('household_id', membership.household_id)
      .eq('invited_email', invitedEmail)
      .eq('status', 'pending');

    const token = randomToken();
    const tokenHash = await sha256Hex(token);
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

    const { error: insertError } = await admin.from('household_invitations').insert({
      household_id: membership.household_id,
      invited_email: invitedEmail,
      invited_by: user.id,
      token_hash: tokenHash,
      expires_at: expiresAt,
    });
    if (insertError) return json({ error: 'NO_SE_PUDO_CREAR' }, 500, corsHeaders);

    await admin.from('invitation_rate_limits').insert({ user_id: user.id });

    // Nombre del hogar e invitador, para el texto del email.
    const { data: household } = await admin.from('households').select('name').eq('id', membership.household_id).maybeSingle();
    const { data: inviterProfile } = await admin.from('profiles').select('display_name, email').eq('id', user.id).maybeSingle();

    const origin = req.headers.get('Origin') && ALLOWED_ORIGINS.includes(req.headers.get('Origin')!)
      ? req.headers.get('Origin')!
      : ALLOWED_ORIGINS[0];
    const inviteLink = `${origin}/#/invite/${token}`;

    if (resendApiKey) {
      const inviterName = inviterProfile?.display_name || inviterProfile?.email || 'Alguien';
      const expiresLabel = new Date(expiresAt).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const emailResp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: emailFrom,
          to: [invitedEmail],
          subject: 'Te han invitado a unirte a un hogar en MiniChef',
          html: `
            <p>Hola,</p>
            <p><strong>${escapeHtml(inviterName)}</strong> (${escapeHtml(inviterProfile?.email || '')}) te ha invitado a participar en su hogar "${escapeHtml(household?.name || 'MiniChef')}".</p>
            <p><a href="${inviteLink}">Unirme a MiniChef</a></p>
            <p>Al acceder tendrás que iniciar sesión con Google utilizando esta misma dirección de correo electrónico: ${escapeHtml(invitedEmail)}.</p>
            <p>La invitación caduca el ${expiresLabel}.</p>
            <p>Si no esperabas esta invitación, puedes ignorar este correo.</p>
            <p>Un saludo,<br/>MiniChef</p>
          `,
        }),
      });
      if (!emailResp.ok) {
        // La invitación ya está creada en la base de datos aunque el envío
        // falle — se puede reenviar. No revertimos la creación por un fallo
        // de email, para no perder el token generado si el problema es
        // puntual del proveedor. Pero SÍ devolvemos el motivo real de
        // Resend (p. ej. clave inválida, dominio no verificado...), en vez
        // de un simple "emailSent: false" que no dice nada de por qué.
        const resendBody = await emailResp.text().catch(() => '');
        return json({ ok: true, emailSent: false, emailError: `Resend ${emailResp.status}: ${resendBody.slice(0, 300)}`, inviteLink }, 200, corsHeaders);
      }
    } else {
      return json({ ok: true, emailSent: false, emailError: 'RESEND_API_KEY no está configurado en esta función', inviteLink }, 200, corsHeaders);
    }

    return json({ ok: true, emailSent: true, inviteLink }, 200, corsHeaders);
  } catch (e) {
    return json({ error: String(e) }, 500, corsHeadersFor(req));
  }
});

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
