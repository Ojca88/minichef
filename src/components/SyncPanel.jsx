import { useState } from 'react';
import { useCloud } from '../CloudSyncContext';

// Por el momento en que este panel se muestra (dentro de LoginGate +
// HouseholdGate), siempre hay una sesión de Google real y un hogar — ya no
// hace falta ninguna de las pantallas de "inicia sesión" o "crea/únete",
// esas las gestionan los gates antes de llegar aquí.

const STATUS_LABEL = {
  loading: 'Cargando...',
  synced: 'Sincronizado',
  error: 'Error al sincronizar',
};

const STATUS_COLOR = {
  loading: 'var(--apricot)',
  synced: 'var(--sage-dark)',
  error: '#C4302B',
};

export default function SyncPanel() {
  const cloud = useCloud();
  const [copied, setCopied] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState('');
  const [showDeleteBox, setShowDeleteBox] = useState(false);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteBusy, setInviteBusy] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [inviteOk, setInviteOk] = useState('');

  const [accountStep, setAccountStep] = useState(null); // null | 'confirm' | 'decide'
  const [accountConfirmText, setAccountConfirmText] = useState('');
  const [accountError, setAccountError] = useState('');
  const [transferChoice, setTransferChoice] = useState('');
  const [showDeleteHouseholdInstead, setShowDeleteHouseholdInstead] = useState(false);

  if (!cloud.household) return null;

  function handleCopy() {
    if (!cloud.code) return;
    navigator.clipboard?.writeText(cloud.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  async function handleDelete() {
    const ok = await cloud.deleteHousehold(confirmDelete);
    if (ok) { setShowDeleteBox(false); setConfirmDelete(''); }
  }

  async function handleInvite() {
    const email = inviteEmail.trim();
    if (!email) return;
    setInviteBusy(true);
    setInviteError('');
    setInviteOk('');
    const result = await cloud.sendInvitation(email);
    setInviteBusy(false);
    if (result?.error) {
      setInviteError(sendErrorMessage(result.error));
      return;
    }
    setInviteOk(result.emailSent ? `Invitación enviada a ${email}.` : `Invitación creada, pero el envío de email no está configurado todavía (enlace: ${result.inviteLink}).`);
    setInviteEmail('');
  }

  async function handleDeleteAccount() {
    setAccountError('');
    const result = await cloud.deleteMyAccount({});
    if (result?.ok) { setAccountStep(null); return; }
    if (result?.error === 'REQUIERE_DECISION') { setAccountStep('decide'); return; }
    setAccountError('No se pudo eliminar la cuenta. Inténtalo de nuevo en unos minutos.');
  }

  async function handleTransferAndDelete() {
    if (!transferChoice) return;
    setAccountError('');
    const result = await cloud.deleteMyAccount({ transferTo: transferChoice });
    if (result?.ok) { setAccountStep(null); return; }
    setAccountError('No se pudo completar la transferencia. Inténtalo de nuevo.');
  }

  async function handleDeleteHouseholdAndAccount() {
    setAccountError('');
    const result = await cloud.deleteMyAccount({ deleteHousehold: true });
    if (result?.ok) { setAccountStep(null); return; }
    setAccountError('No se pudo eliminar. Inténtalo de nuevo.');
  }

  const isOwner = cloud.members.find((m) => m.user_id === cloud.user?.id)?.role === 'owner';

  return (
    <div className="card" style={{
      background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)',
      padding: '16px', display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600 }}>{cloud.household.name}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {cloud.user.avatar ? (
            <img src={cloud.user.avatar} alt="" width={24} height={24} style={{ borderRadius: '50%' }} />
          ) : (
            <span style={{
              width: 24, height: 24, borderRadius: '50%', background: 'var(--sage-light)', color: 'var(--sage-dark)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700,
            }}>
              {cloud.user.name.charAt(0).toUpperCase()}
            </span>
          )}
          <button onClick={cloud.signOut} style={{ fontSize: 12, color: 'var(--ink-muted)', background: 'none', border: 'none', textDecoration: 'underline' }}>
            Cerrar sesión
          </button>
        </div>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'var(--gradient-sage)', borderRadius: 'var(--radius-md)', padding: '12px 14px',
        boxShadow: 'var(--shadow-sage)',
      }}>
        <div>
          <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: 3, color: 'var(--white)' }}>{cloud.code}</span>
          <p style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>Identificador de tu hogar</p>
        </div>
        <button
          onClick={handleCopy}
          aria-label="Copiar código"
          className="pressable"
          style={{ width: 34, height: 34, borderRadius: '50%', border: 'none', background: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {copied ? (
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12l5 5L20 7" fill="none" stroke="var(--sage-dark)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">
              <rect x="8" y="8" width="12" height="12" rx="2" fill="none" stroke="var(--sage-dark)" strokeWidth="1.8" />
              <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" fill="none" stroke="var(--sage-dark)" strokeWidth="1.8" />
            </svg>
          )}
        </button>
      </div>
      <p style={{ fontSize: 12, color: 'var(--ink-muted)', lineHeight: 1.5 }}>
        Este es el código identificador de tu hogar. Ya no sirve para entrar por sí solo — para
        invitar a alguien, usa "Invitar a alguien" con su email.
      </p>

      <button
        onClick={() => setShowMembers((v) => !v)}
        style={{ fontSize: 12, color: 'var(--sage-dark)', background: 'none', border: 'none', textAlign: 'left', fontWeight: 600 }}
      >
        {showMembers ? '▾' : '▸'} Miembros ({cloud.members.length}){cloud.invitations.length > 0 ? ` · ${cloud.invitations.length} invitación${cloud.invitations.length > 1 ? 'es' : ''} pendiente${cloud.invitations.length > 1 ? 's' : ''}` : ''}
      </button>

      {showMembers && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {cloud.members.map((m) => (
              <div key={m.user_id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                {m.profiles?.avatar_url ? (
                  <img src={m.profiles.avatar_url} alt="" width={20} height={20} style={{ borderRadius: '50%' }} />
                ) : (
                  <span style={{
                    width: 20, height: 20, borderRadius: '50%', background: 'var(--sage-light)', color: 'var(--sage-dark)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700,
                  }}>
                    {(m.profiles?.display_name || '?').charAt(0).toUpperCase()}
                  </span>
                )}
                <span style={{ flex: 1 }}>
                  {m.profiles?.display_name || 'Invitado'}
                  {m.profiles?.email && <span style={{ color: 'var(--ink-muted)' }}> · {m.profiles.email}</span>}
                </span>
                {m.role === 'owner' && <span style={{ color: 'var(--ink-muted)' }}>Propietario</span>}
                {isOwner && m.user_id !== cloud.user?.id && (
                  <button
                    onClick={() => { if (confirm(`¿Expulsar a ${m.profiles?.display_name || 'esta persona'} del hogar?`)) cloud.removeMember(m.user_id); }}
                    aria-label={`Expulsar a ${m.profiles?.display_name || 'esta persona'}`}
                    style={{ fontSize: 11, color: '#C4302B', background: 'none', border: 'none', textDecoration: 'underline' }}
                  >
                    Expulsar
                  </button>
                )}
              </div>
            ))}
          </div>

          {cloud.invitations.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <p style={{ fontSize: 11, color: 'var(--ink-muted)', fontWeight: 600 }}>Invitaciones pendientes</p>
              {cloud.invitations.map((inv) => (
                <div key={inv.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                  <span style={{ flex: 1 }}>{inv.invited_email}</span>
                  <span style={{ fontSize: 10.5, color: 'var(--ink-muted)' }}>
                    Expira: {new Date(inv.expires_at).toLocaleDateString('es-ES')}
                  </span>
                  {isOwner && (
                    <button
                      onClick={() => cloud.revokeInvitation(inv.id)}
                      style={{ fontSize: 11, color: '#C4302B', background: 'none', border: 'none', textDecoration: 'underline' }}
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {isOwner && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, borderTop: '1px solid var(--line)', paddingTop: 10 }}>
              <p style={{ fontSize: 11, color: 'var(--ink-muted)', fontWeight: 600 }}>Invitar a alguien</p>
              <p style={{ fontSize: 11.5, color: 'var(--ink-muted)', lineHeight: 1.5 }}>
                La persona recibirá un email con un enlace para unirse a tu hogar. Deberá acceder con
                la cuenta de Google asociada a ese mismo email.
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => { setInviteEmail(e.target.value); setInviteError(''); setInviteOk(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
                  placeholder="email@ejemplo.com"
                  style={{ flex: 1, fontSize: 13, padding: '9px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)' }}
                />
                <button
                  onClick={handleInvite}
                  disabled={inviteBusy || !inviteEmail.trim()}
                  className="pressable"
                  style={{
                    padding: '0 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sage)',
                    background: 'var(--white)', color: 'var(--sage-dark)', fontSize: 12, fontWeight: 600,
                    opacity: inviteBusy ? 0.6 : 1,
                  }}
                >
                  Enviar
                </button>
              </div>
              {inviteError && <p style={{ fontSize: 11.5, color: '#C4302B' }}>{inviteError}</p>}
              {inviteOk && <p style={{ fontSize: 11.5, color: 'var(--sage-dark)' }}>{inviteOk}</p>}
            </div>
          )}
        </div>
      )}

      {isOwner && (
        <button
          onClick={cloud.regenerateCode}
          style={{ fontSize: 12, color: 'var(--ink-muted)', background: 'none', border: 'none', textAlign: 'left', textDecoration: 'underline' }}
        >
          Regenerar código
        </button>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: STATUS_COLOR[cloud.status] || 'var(--ink-muted)' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: STATUS_COLOR[cloud.status] || 'var(--ink-muted)' }} />
          {STATUS_LABEL[cloud.status] || cloud.status}
        </span>
        <button
          onClick={cloud.leaveHousehold}
          style={{ fontSize: 12, color: 'var(--ink-muted)', background: 'none', border: 'none', textDecoration: 'underline' }}
        >
          Salir de este hogar
        </button>
      </div>

      {isOwner && (
        <div style={{ borderTop: '1px solid var(--line)', paddingTop: 10, marginTop: 4 }}>
          {!showDeleteBox ? (
            <button
              onClick={() => setShowDeleteBox(true)}
              style={{ fontSize: 12, color: '#C4302B', background: 'none', border: 'none', textDecoration: 'underline' }}
            >
              Eliminar este hogar
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <p style={{ fontSize: 12, color: '#9A5A20', lineHeight: 1.5 }}>
                Esto borra el menú, la lista de la compra y el seguimiento de todos los miembros, sin vuelta atrás.
                Escribe <strong>{cloud.household.name}</strong> para confirmar.
              </p>
              <input
                type="text"
                value={confirmDelete}
                onChange={(e) => setConfirmDelete(e.target.value)}
                placeholder={cloud.household.name}
                style={{ fontSize: 13, padding: '9px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)' }}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={handleDelete}
                  disabled={confirmDelete !== cloud.household.name}
                  style={{
                    flex: 1, fontSize: 12, fontWeight: 600, padding: '9px 0', borderRadius: 'var(--radius-sm)', border: 'none',
                    background: confirmDelete === cloud.household.name ? '#C4302B' : 'var(--line)',
                    color: 'white', opacity: confirmDelete === cloud.household.name ? 1 : 0.6,
                  }}
                >
                  Eliminar definitivamente
                </button>
                <button
                  onClick={() => { setShowDeleteBox(false); setConfirmDelete(''); }}
                  style={{ fontSize: 12, padding: '9px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'white' }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ borderTop: '1px solid var(--line)', paddingTop: 10, marginTop: 4 }}>
        {accountStep === null && (
          <button
            onClick={() => { setAccountStep('confirm'); setAccountConfirmText(''); setAccountError(''); setShowDeleteHouseholdInstead(false); }}
            style={{ fontSize: 12, color: '#C4302B', background: 'none', border: 'none', textDecoration: 'underline' }}
          >
            Eliminar mi cuenta
          </button>
        )}

        {accountStep === 'confirm' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p style={{ fontSize: 12, color: '#9A5A20', lineHeight: 1.5 }}>
              Esta acción es permanente. Al eliminar tu cuenta perderás la información personal
              asociada a ella y dejarás de tener acceso a MiniChef mediante esta cuenta. Los datos
              compartidos del hogar pueden mantenerse para el resto de miembros del hogar.
            </p>
            <p style={{ fontSize: 12, color: 'var(--ink-muted)' }}>Para confirmar, escribe: <strong>ELIMINAR</strong></p>
            <input
              type="text"
              value={accountConfirmText}
              onChange={(e) => setAccountConfirmText(e.target.value)}
              placeholder="ELIMINAR"
              style={{ fontSize: 13, padding: '9px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)' }}
            />
            {accountError && <p style={{ fontSize: 12, color: '#C4302B' }}>{accountError}</p>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleDeleteAccount}
                disabled={accountConfirmText !== 'ELIMINAR'}
                style={{
                  flex: 1, fontSize: 12, fontWeight: 600, padding: '9px 0', borderRadius: 'var(--radius-sm)', border: 'none',
                  background: accountConfirmText === 'ELIMINAR' ? '#C4302B' : 'var(--line)',
                  color: 'white', opacity: accountConfirmText === 'ELIMINAR' ? 1 : 0.6,
                }}
              >
                Eliminar definitivamente mi cuenta
              </button>
              <button
                onClick={() => setAccountStep(null)}
                style={{ fontSize: 12, padding: '9px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'white' }}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {accountStep === 'decide' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p style={{ fontSize: 12, color: '#9A5A20', lineHeight: 1.5 }}>
              Eres propietario de "{cloud.household?.name}" y hay más gente en el hogar. Antes de
              eliminar tu cuenta, transfiere la propiedad a otra persona del hogar.
            </p>
            <select
              value={transferChoice}
              onChange={(e) => setTransferChoice(e.target.value)}
              style={{ fontSize: 13, padding: '9px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)' }}
            >
              <option value="">Elige a quién transferir...</option>
              {cloud.members.filter((m) => m.user_id !== cloud.user?.id).map((m) => (
                <option key={m.user_id} value={m.user_id}>{m.profiles?.display_name || 'Invitado'}</option>
              ))}
            </select>
            {accountError && <p style={{ fontSize: 12, color: '#C4302B' }}>{accountError}</p>}
            <button
              onClick={handleTransferAndDelete}
              disabled={!transferChoice}
              style={{
                fontSize: 12, fontWeight: 600, padding: '9px 0', borderRadius: 'var(--radius-sm)', border: 'none',
                background: transferChoice ? '#C4302B' : 'var(--line)', color: 'white', opacity: transferChoice ? 1 : 0.6,
              }}
            >
              Transferir y eliminar mi cuenta
            </button>

            {!showDeleteHouseholdInstead ? (
              <button
                onClick={() => setShowDeleteHouseholdInstead(true)}
                style={{ fontSize: 11, color: 'var(--ink-muted)', background: 'none', border: 'none', textDecoration: 'underline', textAlign: 'left' }}
              >
                Prefiero eliminar el hogar entero en vez de transferirlo
              </button>
            ) : (
              <div style={{ background: 'var(--apricot-light)', borderRadius: 'var(--radius-sm)', padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <p style={{ fontSize: 11, color: '#9A5A20', lineHeight: 1.5 }}>
                  Esto borra el hogar entero (menú, compra, seguimiento) para <strong>todos</strong> los
                  miembros, no solo para ti. Sin vuelta atrás.
                </p>
                <button
                  onClick={handleDeleteHouseholdAndAccount}
                  style={{ fontSize: 12, fontWeight: 600, padding: '9px 0', borderRadius: 'var(--radius-sm)', border: 'none', background: '#C4302B', color: 'white' }}
                >
                  Eliminar el hogar de todos y mi cuenta
                </button>
              </div>
            )}

            <button
              onClick={() => setAccountStep(null)}
              style={{ fontSize: 12, padding: '9px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'white' }}
            >
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function sendErrorMessage(code) {
  switch (code) {
    case 'SOLO_EL_PROPIETARIO_PUEDE_INVITAR': return 'Solo el propietario del hogar puede invitar a alguien.';
    case 'YA_ES_MIEMBRO': return 'Esa persona ya pertenece a este hogar.';
    case 'EMAIL_INVALIDO': return 'Ese email no parece válido.';
    case 'DEMASIADAS_INVITACIONES': return 'Has enviado demasiadas invitaciones en poco tiempo. Espera un poco e inténtalo de nuevo.';
    case 'SIN_HOGAR': return 'No perteneces a ningún hogar todavía.';
    default: return 'No se pudo enviar la invitación. Inténtalo de nuevo.';
  }
}
