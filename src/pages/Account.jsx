import { useNavigate } from 'react-router-dom';
import SyncPanel from '../components/SyncPanel';

export default function Account() {
  const navigate = useNavigate();
  return (
    <div style={{ paddingBottom: 90 }}>
      <header style={{
        padding: '22px 16px 26px', marginBottom: 20,
        background: 'var(--gradient-sage)',
        borderRadius: '0 0 var(--radius-xl) var(--radius-xl)',
        boxShadow: 'var(--shadow-sage)',
      }}>
        <button
          onClick={() => navigate('/')}
          aria-label="Volver"
          style={{
            display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12,
            background: 'none', border: 'none', color: 'var(--white)', fontSize: 13, fontWeight: 600, padding: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15 5 8 12l7 7" fill="none" stroke="var(--white)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Volver
        </button>
        <h1 style={{ fontSize: 22, color: 'var(--white)' }}>Mi cuenta</h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 4 }}>
          Tu hogar, invitaciones y ajustes de cuenta
        </p>
      </header>

      <div style={{ padding: '0 16px' }}>
        <SyncPanel />
      </div>
    </div>
  );
}
