import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCloud } from '../CloudSyncContext';

// Se muestra tras el login de Google cuando el usuario todavía no pertenece
// a ningún hogar: crear uno nuevo, o pegar un enlace/token de invitación que
// ya tenga (la vía principal sigue siendo pulsar el enlace del email
// directamente, esto es solo un atajo de repuesto).
export default function HouseholdGate({ children }) {
  const cloud = useCloud();
  const navigate = useNavigate();
  const [nameInput, setNameInput] = useState('');
  const [tokenInput, setTokenInput] = useState('');
  const [showTokenBox, setShowTokenBox] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!cloud.isSupabaseConfigured) return children;
  if (cloud.status === 'loading' || cloud.status === 'authenticating') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--ink-muted)', fontSize: 13 }}>Cargando…</p>
      </div>
    );
  }
  if (cloud.household) return children;

  async function handleCreate() {
    setBusy(true);
    setError('');
    const result = await cloud.createHousehold(nameInput.trim() || 'Mi hogar');
    setBusy(false);
    if (result?.error) setError('No se pudo crear el hogar. Inténtalo de nuevo.');
  }

  async function handleUseToken() {
    const raw = tokenInput.trim();
    if (!raw) return;
    // Admite pegar la URL completa del email, o solo el token suelto.
    const match = raw.match(/invite\/([^/?#]+)/);
    const token = match ? match[1] : raw;
    setBusy(true);
    setError('');
    const result = await cloud.acceptInvitation(token);
    setBusy(false);
    if (result?.error) {
      setError(inviteErrorMessage(result.error, result.invitedEmail));
    } else {
      navigate('/');
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center',
      alignItems: 'center', padding: '32px 24px', background: 'var(--cream)', textAlign: 'center',
    }}>
      <h1 style={{ fontSize: 20, fontFamily: 'var(--font-display)', marginBottom: 6 }}>Bienvenido a MiniChef</h1>
      <p style={{ fontSize: 14, color: 'var(--ink-muted)', marginBottom: 26, maxWidth: 320 }}>
        No perteneces todavía a ningún hogar.
      </p>

      <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input
          type="text"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          placeholder="Nombre del hogar (ej. Familia García)"
          style={{ fontSize: 13, padding: '11px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)' }}
        />
        <button
          onClick={handleCreate}
          disabled={busy}
          className="pressable"
          style={{
            padding: '13px 0', borderRadius: 'var(--radius-md)', border: 'none',
            background: 'var(--sage)', color: 'white', fontSize: 14, fontWeight: 600, opacity: busy ? 0.6 : 1,
          }}
        >
          Crear mi hogar
        </button>

        <div style={{ fontSize: 12, color: 'var(--ink-muted)', margin: '8px 0' }}>— o —</div>

        {!showTokenBox ? (
          <button
            onClick={() => setShowTokenBox(true)}
            style={{ fontSize: 13, color: 'var(--sage-dark)', background: 'none', border: 'none', textDecoration: 'underline' }}
          >
            Tengo una invitación
          </button>
        ) : (
          <>
            <p style={{ fontSize: 12, color: 'var(--ink-muted)' }}>
              Normalmente basta con pulsar el enlace del email. Si lo prefieres, pégalo aquí:
            </p>
            <input
              type="text"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Enlace o código de la invitación"
              style={{ fontSize: 13, padding: '11px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)' }}
            />
            <button
              onClick={handleUseToken}
              disabled={busy}
              className="pressable"
              style={{
                padding: '11px 0', borderRadius: 'var(--radius-md)', border: '1px solid var(--sage)',
                background: 'var(--white)', color: 'var(--sage-dark)', fontSize: 13, fontWeight: 600,
              }}
            >
              Unirme con esta invitación
            </button>
          </>
        )}

        {error && <p style={{ fontSize: 12, color: '#C4302B' }}>{error}</p>}
      </div>
    </div>
  );
}

export function inviteErrorMessage(code, invitedEmail) {
  switch (code) {
    case 'TOKEN_INVALIDO': return 'Ese enlace de invitación no es válido.';
    case 'CADUCADA': return 'Esta invitación ha caducado. Pide al propietario del hogar que envíe una nueva.';
    case 'REVOCADA': return 'Esta invitación fue cancelada por el propietario del hogar.';
    case 'YA_UTILIZADA': return 'Esta invitación ya se usó antes.';
    case 'EMAIL_NO_COINCIDE': return `Esta invitación está dirigida a otra cuenta de Google${invitedEmail ? ` (${invitedEmail})` : ''}. Cierra sesión y entra con esa cuenta para aceptarla.`;
    case 'YA_TIENES_HOGAR': return 'Tu cuenta ya pertenece a otro hogar.';
    case 'NECESITAS_GOOGLE': return 'Necesitas iniciar sesión con Google para aceptar una invitación.';
    default: return 'No se pudo aceptar la invitación. Inténtalo de nuevo.';
  }
}
