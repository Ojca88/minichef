import { useState } from 'react';
import { useCloud } from '../CloudSyncContext';

const STATUS_LABEL = {
  offline: 'Guardado solo en este dispositivo',
  'no-code': 'Sin sincronizar todavía',
  loading: 'Cargando...',
  synced: 'Sincronizado',
  error: 'Error al sincronizar',
};

const STATUS_COLOR = {
  offline: 'var(--ink-muted)',
  'no-code': 'var(--ink-muted)',
  loading: 'var(--apricot)',
  synced: 'var(--sage-dark)',
  error: '#C4302B',
};

export default function SyncPanel() {
  const cloud = useCloud();
  const [joinInput, setJoinInput] = useState('');
  const [copied, setCopied] = useState(false);

  async function handleCreate() {
    await cloud.createHousehold();
  }

  function handleJoin() {
    if (!joinInput.trim()) return;
    cloud.joinHousehold(joinInput);
    setJoinInput('');
  }

  function handleCopy() {
    if (!cloud.code) return;
    navigator.clipboard?.writeText(cloud.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div style={{
      background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)',
      padding: '16px', display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6.5 16.5A4.5 4.5 0 0 1 7 7.6a6 6 0 0 1 11.4 2A4 4 0 0 1 17.5 17H7c-.2 0-.3 0-.5-.1Z" fill="none" stroke="var(--sage-dark)" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600 }}>
          Sincronización familiar
        </span>
      </div>

      {!cloud.isSupabaseConfigured && (
        <p style={{ fontSize: 12, color: 'var(--ink-muted)', lineHeight: 1.5 }}>
          La sincronización en la nube aún no está configurada en este despliegue. Todo se guarda solo en este dispositivo por ahora.
        </p>
      )}

      {cloud.isSupabaseConfigured && !cloud.code && (
        <>
          <p style={{ fontSize: 12, color: 'var(--ink-muted)', lineHeight: 1.5 }}>
            Crea un código para tu familia y compártelo en otro dispositivo, o introduce uno que ya tengas.
          </p>
          <button
            onClick={handleCreate}
            style={{
              width: '100%', padding: '11px 0', borderRadius: 'var(--radius-md)', border: 'none',
              background: 'var(--sage)', color: 'var(--white)', fontSize: 13, fontWeight: 600,
            }}
          >
            Crear código para mi familia
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={joinInput}
              onChange={(e) => setJoinInput(e.target.value.toUpperCase())}
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
              style={{
                padding: '0 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--sage)',
                background: 'var(--white)', color: 'var(--sage-dark)', fontSize: 13, fontWeight: 600,
              }}
            >
              Unirme
            </button>
          </div>
        </>
      )}

      {cloud.isSupabaseConfigured && cloud.code && (
        <>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'var(--sage-light)', borderRadius: 'var(--radius-md)', padding: '12px 14px',
          }}>
            <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: 3, color: 'var(--sage-dark)' }}>
              {cloud.code}
            </span>
            <button
              onClick={handleCopy}
              aria-label="Copiar código"
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
            Introduce este código en la app desde otro dispositivo para compartir el menú, la lista de la compra y el seguimiento.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: STATUS_COLOR[cloud.status] }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: STATUS_COLOR[cloud.status] }} />
              {STATUS_LABEL[cloud.status]}
            </span>
            <button
              onClick={cloud.leaveHousehold}
              style={{ fontSize: 12, color: 'var(--ink-muted)', background: 'none', border: 'none', textDecoration: 'underline' }}
            >
              Salir de este código
            </button>
          </div>
        </>
      )}
    </div>
  );
}
