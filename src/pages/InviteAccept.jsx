import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCloud } from '../CloudSyncContext';
import { inviteErrorMessage } from '../components/HouseholdGate';

export default function InviteAccept() {
  const { token } = useParams();
  const navigate = useNavigate();
  const cloud = useCloud();
  const [status, setStatus] = useState('idle'); // idle | accepting | error | done
  const [error, setError] = useState('');

  const loggedIn = cloud.user && !cloud.user.isAnonymous;

  useEffect(() => {
    if (!loggedIn || !token || status !== 'idle') return;
    setStatus('accepting');
    cloud.acceptInvitation(token).then((result) => {
      if (result?.error) {
        setError(inviteErrorMessage(result.error, result.invitedEmail));
        setStatus('error');
      } else {
        setStatus('done');
        setTimeout(() => navigate('/'), 1200);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedIn, token, status]);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center',
      alignItems: 'center', padding: '32px 24px', background: 'var(--cream)', textAlign: 'center',
    }}>
      <h1 style={{ fontSize: 20, fontFamily: 'var(--font-display)', marginBottom: 10 }}>Te han invitado a MiniChef</h1>

      {!loggedIn && cloud.isSupabaseConfigured && !cloud.authLoading && (
        <>
          <p style={{ fontSize: 14, color: 'var(--ink-muted)', marginBottom: 22, maxWidth: 320 }}>
            Para aceptar esta invitación, inicia sesión con la cuenta de Google a la que fue enviada.
          </p>
          <button
            onClick={cloud.signInWithGoogle}
            className="pressable"
            style={{
              padding: '12px 22px', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)',
              background: 'var(--white)', fontSize: 14, fontWeight: 600, color: 'var(--ink)',
            }}
          >
            Continuar con Google
          </button>
        </>
      )}

      {loggedIn && status === 'accepting' && (
        <p style={{ fontSize: 14, color: 'var(--ink-muted)' }}>Comprobando tu invitación…</p>
      )}

      {status === 'done' && (
        <>
          <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Invitación aceptada</p>
          <p style={{ fontSize: 14, color: 'var(--ink-muted)' }}>Ya formas parte del hogar. Entrando…</p>
        </>
      )}

      {status === 'error' && (
        <>
          <p style={{ fontSize: 14, color: '#C4302B', maxWidth: 320, marginBottom: 16 }}>{error}</p>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '11px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)',
              background: 'var(--white)', fontSize: 13, fontWeight: 600,
            }}
          >
            Ir a MiniChef
          </button>
        </>
      )}
    </div>
  );
}
