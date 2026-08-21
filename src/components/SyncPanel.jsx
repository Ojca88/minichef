import { useState } from 'react';
import { useCloud } from '../CloudSyncContext';

const STATUS_LABEL = {
  offline: 'Guardado solo en este dispositivo',
  'no-household': 'Sin hogar todavía',
  authenticating: 'Conectando...',
  loading: 'Cargando...',
  synced: 'Sincronizado',
  error: 'Error al sincronizar',
};

const STATUS_COLOR = {
  offline: 'var(--ink-muted)',
  'no-household': 'var(--ink-muted)',
  authenticating: 'var(--apricot)',
  loading: 'var(--apricot)',
  synced: 'var(--sage-dark)',
  error: '#C4302B',
};

export default function SyncPanel() {
  const cloud = useCloud();
  const [nameInput, setNameInput] = useState('');
  const [joinInput, setJoinInput] = useState('');
  const [joinError, setJoinError] = useState('');
  const [createError, setCreateError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState('');
  const [showDeleteBox, setShowDeleteBox] = useState(false);

  // --- Eliminar mi cuenta -------------------------------------------------
  const [accountStep, setAccountStep] = useState(null); // null | 'confirm' | 'decide'
  const [accountConfirmText, setAccountConfirmText] = useState('');
  const [accountError, setAccountError] = useState('');
  const [transferChoice, setTransferChoice] = useState('');
  const [showDeleteHouseholdInstead, setShowDeleteHouseholdInstead] = useState(false);

  async function handleCreate() {
    setCreateError('');
    const result = await cloud.createHousehold(nameInput.trim() || 'Mi hogar');
    if (result?.error) {
      setCreateError(result.error);
      return;
    }
    setNameInput('');
  }

  async function handleJoin() {
    if (!joinInput.trim()) return;
    setJoinError('');
    const result = await cloud.joinHousehold(joinInput);
    if (result?.error) {
      setJoinError(result.error === 'CODIGO_INVALIDO' ? 'Ese código no existe. Revísalo e inténtalo de nuevo.' : 'No se pudo unir. Inténtalo de nuevo.');
      return;
    }
    setJoinInput('');
  }

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
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6.5 16.5A4.5 4.5 0 0 1 7 7.6a6 6 0 0 1 11.4 2A4 4 0 0 1 17.5 17H7c-.2 0-.3 0-.5-.1Z" fill="none" stroke="var(--sage-dark)" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600 }}>
          {cloud.household ? cloud.household.name : 'Mi hogar'}
        </span>
      </div>

      {!cloud.isSupabaseConfigured && (
        <p style={{ fontSize: 12, color: 'var(--ink-muted)', lineHeight: 1.5 }}>
          La sincronización en la nube aún no está configurada en este despliegue. Todo se guarda solo en este dispositivo por ahora.
        </p>
      )}

      {cloud.isSupabaseConfigured && !cloud.authLoading && (
        cloud.user && !cloud.user.isAnonymous ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              {cloud.user.avatar ? (
                <img src={cloud.user.avatar} alt="" width={28} height={28} style={{ borderRadius: '50%', flexShrink: 0 }} />
              ) : (
                <span style={{
                  width: 28, height: 28, borderRadius: '50%', background: 'var(--sage-light)', color: 'var(--sage-dark)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0,
                }}>
                  {cloud.user.name.charAt(0).toUpperCase()}
                </span>
              )}
              <span style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {cloud.user.name}
              </span>
            </div>
            <button
              onClick={cloud.signOut}
              style={{ fontSize: 12, color: 'var(--ink-muted)', background: 'none', border: 'none', textDecoration: 'underline', flexShrink: 0 }}
            >
              Cerrar sesión
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={cloud.signInWithGoogle}
              className="pressable"
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                padding: '10px 0', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)',
                background: 'var(--white)', fontSize: 13, fontWeight: 600, color: 'var(--ink)',
              }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M23.5 12.3c0-.85-.08-1.66-.22-2.45H12v4.63h6.46c-.28 1.5-1.13 2.77-2.4 3.62v3h3.88c2.27-2.09 3.56-5.17 3.56-8.8Z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.9l-3.88-3c-1.08.72-2.45 1.15-4.06 1.15-3.13 0-5.78-2.11-6.73-4.96H1.26v3.1C3.24 21.3 7.3 24 12 24Z" />
                <path fill="#FBBC05" d="M5.27 14.29A7.2 7.2 0 0 1 4.89 12c0-.8.14-1.57.38-2.29v-3.1H1.26A11.98 11.98 0 0 0 0 12c0 1.93.47 3.76 1.26 5.39l4.01-3.1Z" />
                <path fill="#EA4335" d="M12 4.75c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0 7.3 0 3.24 2.7 1.26 6.61l4.01 3.1C6.22 6.86 8.87 4.75 12 4.75Z" />
              </svg>
              Continuar con Google
            </button>
            {cloud.household && (
              <p style={{ fontSize: 11, color: 'var(--ink-muted)', lineHeight: 1.5 }}>
                Vincula tu cuenta de Google para entrar directamente en este hogar la próxima vez, sin escribir el código.
              </p>
            )}
          </>
        )
      )}

      {cloud.isSupabaseConfigured && !cloud.household && cloud.status !== 'authenticating' && (
        <>
          <p style={{ fontSize: 12, color: 'var(--ink-muted)', lineHeight: 1.5 }}>
            Crea un hogar para tu familia y comparte su código, o introduce uno que ya tengas.
          </p>
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Nombre del hogar (ej. Familia García)"
            style={{
              fontSize: 13, padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)',
            }}
          />
          <button
            onClick={handleCreate}
            className="pressable"
            style={{
              width: '100%', padding: '11px 0', borderRadius: 'var(--radius-md)', border: 'none',
              background: 'var(--gradient-sage)', color: 'var(--white)', fontSize: 13, fontWeight: 600,
              boxShadow: 'var(--shadow-sage)',
            }}
          >
            Crear mi hogar
          </button>
          {createError && <p style={{ fontSize: 12, color: '#C4302B' }}>{createError}</p>}
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={joinInput}
              onChange={(e) => { setJoinInput(e.target.value.toUpperCase()); setJoinError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              placeholder="Código de 6 letras"
              maxLength={6}
              style={{
                flex: 1, fontSize: 14, padding: '10px 12px', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--line)', letterSpacing: 2, textTransform: 'uppercase',
              }}
            />
            <button
              onClick={handleJoin}
              className="pressable"
              style={{
                padding: '0 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--sage)',
                background: 'var(--white)', color: 'var(--sage-dark)', fontSize: 13, fontWeight: 600,
              }}
            >
              Unirme
            </button>
          </div>
          {joinError && <p style={{ fontSize: 12, color: '#C4302B' }}>{joinError}</p>}
        </>
      )}

      {cloud.isSupabaseConfigured && cloud.household && (
        <>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'var(--gradient-sage)', borderRadius: 'var(--radius-md)', padding: '12px 14px',
            boxShadow: 'var(--shadow-sage)',
          }}>
            <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: 3, color: 'var(--white)' }}>
              {cloud.code}
            </span>
            <button
              onClick={handleCopy}
              aria-label="Copiar código"
              className="pressable"
              style={{
                width: 34, height: 34, borderRadius: '50%', border: 'none', background: 'var(--white)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
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
            Este código sirve para unirse una vez — a partir de ahí, cada persona ya forma parte del hogar aunque el código cambie.
          </p>

          <button
            onClick={() => setShowMembers((v) => !v)}
            style={{ fontSize: 12, color: 'var(--sage-dark)', background: 'none', border: 'none', textAlign: 'left', fontWeight: 600 }}
          >
            {showMembers ? '▾' : '▸'} Miembros ({cloud.members.length})
          </button>
          {showMembers && (
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
                  <span style={{ flex: 1 }}>{m.profiles?.display_name || 'Invitado'}</span>
                  {m.role === 'owner' && <span style={{ color: 'var(--ink-muted)' }}>· propietario</span>}
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
          )}

          {isOwner && (
            <button
              onClick={cloud.regenerateCode}
              style={{ fontSize: 12, color: 'var(--ink-muted)', background: 'none', border: 'none', textAlign: 'left', textDecoration: 'underline' }}
            >
              Regenerar código (el actual dejará de funcionar)
            </button>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: STATUS_COLOR[cloud.status] }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: STATUS_COLOR[cloud.status] }} />
              {STATUS_LABEL[cloud.status]}
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
        </>
      )}

      {cloud.isSupabaseConfigured && cloud.user && !cloud.user.isAnonymous && (
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
                asociada a ella y dejarás de tener acceso a MiniChef mediante esta cuenta.
                {cloud.household && ' Los datos compartidos del hogar pueden mantenerse para el resto de miembros del hogar.'}
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
      )}
    </div>
  );
}
