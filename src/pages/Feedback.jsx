import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCloud } from '../CloudSyncContext';
import { supabase, isSupabaseConfigured } from '../supabaseClient';

const CATEGORIES = [
  { value: 'bug', emoji: '🐛', label: 'He encontrado un problema' },
  { value: 'suggestion', emoji: '💡', label: 'Tengo una sugerencia' },
  { value: 'positive', emoji: '❤️', label: 'Algo me gusta mucho' },
  { value: 'other', emoji: '💬', label: 'Otro comentario' },
];

const CONFIRM_MESSAGE = {
  bug: 'Gracias por avisarnos. Revisaremos el problema.',
  suggestion: 'Gracias por la sugerencia. La tendremos en cuenta para futuras mejoras.',
  positive: 'Gracias por compartirlo. Nos ayuda a saber qué funciona bien.',
  other: 'Gracias por tu comentario.',
};

const MAX_MESSAGE_LENGTH = 2000;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

function getDeviceInfo() {
  const ua = navigator.userAgent || '';
  return {
    device_type: /Mobi|Android/i.test(ua) ? 'mobile' : 'desktop',
    browser: ua.slice(0, 200),
    os: navigator.platform || null,
  };
}

export default function Feedback() {
  const navigate = useNavigate();
  const location = useLocation();
  const cloud = useCloud();

  const [type, setType] = useState(null);
  const [message, setMessage] = useState('');
  const [stepsToReproduce, setStepsToReproduce] = useState('');
  const [expectedBehavior, setExpectedBehavior] = useState('');
  const [actualBehavior, setActualBehavior] = useState('');
  const [image, setImage] = useState(null); // File
  const [imagePreview, setImagePreview] = useState(null);
  const [imageError, setImageError] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [done, setDone] = useState(false);

  const fromPage = location.state?.fromPage || '/';

  function handleImagePick(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageError('');
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setImageError('Solo se aceptan imágenes PNG, JPG o WEBP.');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError('La imagen no puede superar los 5 MB.');
      return;
    }
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function removeImage() {
    setImage(null);
    setImagePreview(null);
    setImageError('');
  }

  async function handleSubmit() {
    if (!message.trim() || sending) return;
    setSending(true);
    setSendError('');

    try {
      // Comprobamos el límite ANTES de intentar guardar nada — así, si
      // falla algo después (subir la imagen, guardar el comentario), sabemos
      // con certeza que no es por el límite, y podemos mostrar el motivo
      // real en vez de adivinarlo a partir de un código de error genérico.
      const { data: withinLimit, error: limitError } = await supabase.rpc('check_feedback_rate_limit', { p_user_id: cloud.user.id });
      if (!limitError && withinLimit === false) {
        setSendError('Has enviado demasiados comentarios hoy. Inténtalo de nuevo mañana.');
        return;
      }

      let attachmentPath = null;
      if (image && isSupabaseConfigured && cloud.user?.id) {
        const path = `${cloud.user.id}/${Date.now()}-${image.name}`;
        const { error: uploadError } = await supabase.storage.from('feedback-attachments').upload(path, image);
        if (uploadError) {
          setSendError(`No se pudo subir la imagen (${uploadError.message}). Puedes intentarlo sin imagen, o probar de nuevo.`);
          return;
        }
        attachmentPath = path;
      }

      const { browser, os, device_type } = getDeviceInfo();
      const { data: inserted, error: insertError } = await supabase
        .from('feedback')
        .insert({
          user_id: cloud.user.id,
          household_id: cloud.household?.id || null,
          email: cloud.user.email,
          type,
          message: message.trim(),
          steps_to_reproduce: stepsToReproduce.trim() || null,
          expected_behavior: expectedBehavior.trim() || null,
          actual_behavior: actualBehavior.trim() || null,
          page_url: fromPage,
          device_type,
          browser,
          os,
          attachment_path: attachmentPath,
        })
        .select('id')
        .single();

      if (insertError) {
        setSendError(`No se pudo enviar tu comentario (${insertError.message}). Inténtalo de nuevo.`);
        return;
      }

      // El aviso por email es "mejor esfuerzo": si falla, el feedback ya
      // está guardado igualmente, así que no bloqueamos la confirmación al
      // usuario por esto.
      supabase.functions.invoke('send-feedback-notification', { body: { feedbackId: inserted.id } }).catch(() => {});

      setDone(true);
    } catch (err) {
      setSendError(`No se pudo enviar tu comentario (${err?.message || 'error desconocido'}). Inténtalo de nuevo.`);
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '32px 24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 20, fontFamily: 'var(--font-display)', marginBottom: 8 }}>Gracias por ayudarnos a mejorar MiniChef</h1>
        <p style={{ fontSize: 14, color: 'var(--ink-muted)', marginBottom: 6 }}>Tu comentario se ha enviado correctamente.</p>
        <p style={{ fontSize: 14, color: 'var(--ink-muted)', marginBottom: 24 }}>{CONFIRM_MESSAGE[type]}</p>
        <button
          onClick={() => navigate(fromPage)}
          className="pressable"
          style={{ padding: '12px 22px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--sage)', color: 'white', fontSize: 14, fontWeight: 600 }}
        >
          Volver a MiniChef
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px 16px 90px' }}>
      <h1 style={{ fontSize: 20, fontFamily: 'var(--font-display)', marginBottom: 6 }}>💬 Ayúdanos a mejorar MiniChef</h1>
      <p style={{ fontSize: 13, color: 'var(--ink-muted)', marginBottom: 20, lineHeight: 1.5 }}>
        Tu opinión nos ayuda a mejorar MiniChef. Cuéntanos qué te gusta, qué cambiarías o si has encontrado algún problema.
      </p>

      <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>¿Qué quieres contarnos?</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 22 }}>
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => setType(c.value)}
            className="pressable"
            style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '13px 14px', textAlign: 'left',
              borderRadius: 'var(--radius-md)', border: '1.5px solid ' + (type === c.value ? 'var(--sage)' : 'var(--line)'),
              background: type === c.value ? 'var(--sage-light)' : 'var(--white)', fontSize: 14,
            }}
          >
            <span style={{ fontSize: 18 }}>{c.emoji}</span> {c.label}
          </button>
        ))}
      </div>

      {type && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Cuéntanos</p>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
              placeholder="Escribe aquí tu comentario..."
              rows={5}
              style={{ width: '100%', fontSize: 14, padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)', resize: 'vertical', fontFamily: 'inherit' }}
            />
            <p style={{ fontSize: 11, color: 'var(--ink-muted)', textAlign: 'right', marginTop: 4 }}>{message.length} / {MAX_MESSAGE_LENGTH}</p>
          </div>

          {type === 'bug' && (
            <>
              <LabeledField label="¿Qué estabas haciendo cuando ocurrió? (opcional)" value={stepsToReproduce} onChange={setStepsToReproduce} placeholder="Por ejemplo: estaba intentando crear una receta..." />
              <LabeledField label="¿Qué esperabas que ocurriera? (opcional)" value={expectedBehavior} onChange={setExpectedBehavior} />
              <LabeledField label="¿Qué ocurrió realmente? (opcional)" value={actualBehavior} onChange={setActualBehavior} />
            </>
          )}

          <div>
            <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>¿Quieres adjuntar una captura?</p>
            {!imagePreview ? (
              <label style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--sage-dark)',
                border: '1px solid var(--sage)', borderRadius: 'var(--radius-sm)', padding: '9px 14px', cursor: 'pointer',
              }}>
                📎 Añadir imagen
                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleImagePick} style={{ display: 'none' }} />
              </label>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <img src={imagePreview} alt="Vista previa" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)' }} />
                <button onClick={removeImage} style={{ fontSize: 12, color: '#C4302B', background: 'none', border: 'none', textDecoration: 'underline' }}>Quitar imagen</button>
              </div>
            )}
            {imageError && <p style={{ fontSize: 11.5, color: '#C4302B', marginTop: 6 }}>{imageError}</p>}
          </div>

          <p style={{ fontSize: 11, color: 'var(--ink-muted)', lineHeight: 1.5 }}>
            Por tu seguridad, no incluyas contraseñas, datos bancarios ni información médica o personal que no sea necesaria para explicar tu comentario.
          </p>

          {sendError && <p style={{ fontSize: 12.5, color: '#C4302B' }}>{sendError}</p>}

          <button
            onClick={handleSubmit}
            disabled={!message.trim() || sending}
            className="pressable"
            style={{
              padding: '13px 0', borderRadius: 'var(--radius-md)', border: 'none',
              background: message.trim() && !sending ? 'var(--sage)' : 'var(--line)', color: 'white',
              fontSize: 14, fontWeight: 600, opacity: message.trim() && !sending ? 1 : 0.6,
            }}
          >
            {sending ? 'Enviando...' : 'Enviar comentario'}
          </button>
        </div>
      )}
    </div>
  );
}

function LabeledField({ label, value, onChange, placeholder }) {
  return (
    <div>
      <p style={{ fontSize: 12.5, color: 'var(--ink-muted)', marginBottom: 6 }}>{label}</p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={2}
        style={{ width: '100%', fontSize: 13, padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', resize: 'vertical', fontFamily: 'inherit' }}
      />
    </div>
  );
}
