// supabase/functions/send-feedback-notification/index.ts
//
// El usuario inserta su feedback directamente desde el cliente (protegido
// por RLS: solo puede crear su propia fila, nunca leer la de nadie). Esta
// función solo se encarga de avisar por email al responsable — reutiliza
// Resend, el mismo proveedor que ya usan las invitaciones, tal como pedía
// el documento ("no crear un segundo proveedor").

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

const TYPE_LABELS: Record<string, string> = {
  bug: 'Problema', suggestion: 'Sugerencia', positive: 'Comentario positivo', other: 'Otro comentario',
};

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
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
    const notifyEmail = Deno.env.get('FEEDBACK_NOTIFICATION_EMAIL');

    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) return json({ error: 'NO_AUTORIZADO' }, 401, corsHeaders);

    const body = await req.json().catch(() => ({}));
    const feedbackId = String(body?.feedbackId || '');
    if (!feedbackId) return json({ error: 'FALTA_FEEDBACK_ID' }, 400, corsHeaders);

    const admin = createClient(supabaseUrl, serviceKey);

    // Comprueba que el feedback existe y es realmente del usuario que llama
    // — aunque RLS ya impide leerlo desde el cliente, esta función usa
    // service_role internamente, así que revalidamos la propiedad aquí.
    const { data: fb } = await admin.from('feedback').select('*').eq('id', feedbackId).maybeSingle();
    if (!fb || fb.user_id !== user.id) return json({ error: 'NO_ENCONTRADO' }, 404, corsHeaders);

    if (!resendApiKey || !notifyEmail) {
      // Sin proveedor de email o sin destinatario configurado: el feedback
      // ya quedó guardado en la base de datos igualmente, solo no se avisa
      // por email. No es un error para el usuario.
      return json({ ok: true, emailSent: false }, 200, corsHeaders);
    }

    let attachmentLine = '';
    if (fb.attachment_path) {
      const { data: signed } = await admin.storage
        .from('feedback-attachments')
        .createSignedUrl(fb.attachment_path, 60 * 60 * 24 * 7); // 7 días
      attachmentLine = signed?.signedUrl
        ? `<p>El usuario ha adjuntado una imagen: <a href="${signed.signedUrl}">verla (enlace válido 7 días)</a>.</p>`
        : '<p>El usuario ha adjuntado una imagen.</p>';
    }

    const { data: profile } = await admin.from('profiles').select('display_name, email').eq('id', user.id).maybeSingle();
    const userLabel = `${profile?.display_name || 'Alguien'} (${profile?.email || fb.email || 'sin email'})`;
    const typeLabel = TYPE_LABELS[fb.type] || fb.type;

    const html = `
      <p>Nuevo feedback recibido</p>
      <p><strong>Tipo:</strong> ${escapeHtml(typeLabel)}</p>
      <p><strong>Usuario:</strong> ${escapeHtml(userLabel)}</p>
      <p><strong>Hogar:</strong> ${escapeHtml(fb.household_id || 'ninguno')}</p>
      <p><strong>Fecha:</strong> ${new Date(fb.created_at).toLocaleString('es-ES')}</p>
      <p><strong>Página:</strong> ${escapeHtml(fb.page_url || 'desconocida')}</p>
      <p><strong>Comentario:</strong><br/>${escapeHtml(fb.message)}</p>
      ${fb.steps_to_reproduce ? `<p><strong>Qué estaba haciendo:</strong><br/>${escapeHtml(fb.steps_to_reproduce)}</p>` : ''}
      ${fb.expected_behavior ? `<p><strong>Qué esperaba:</strong><br/>${escapeHtml(fb.expected_behavior)}</p>` : ''}
      ${fb.actual_behavior ? `<p><strong>Qué ocurrió:</strong><br/>${escapeHtml(fb.actual_behavior)}</p>` : ''}
      ${attachmentLine}
    `;

    const emailResp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: emailFrom,
        to: [notifyEmail],
        subject: `[MiniChef] Nuevo feedback — ${typeLabel}`,
        html,
      }),
    });

    return json({ ok: true, emailSent: emailResp.ok }, 200, corsHeaders);
  } catch (e) {
    return json({ error: String(e) }, 500, corsHeadersFor(req));
  }
});
