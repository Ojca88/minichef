import { useCloud } from '../CloudSyncContext';

// Envuelve las pantallas principales de MiniChef: mientras no haya una
// sesión de Google real, muestra la pantalla de bienvenida en vez del
// contenido — ya no existe ningún camino para usar la app solo con un
// código o de forma anónima (ver documento "código deja de dar acceso").
export default function LoginGate({ children }) {
  const cloud = useCloud();

  if (!cloud.isSupabaseConfigured) return children; // entorno sin Supabase configurado: no se puede exigir login

  if (cloud.authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--ink-muted)', fontSize: 13 }}>Cargando…</p>
      </div>
    );
  }

  if (cloud.user && !cloud.user.isAnonymous) return children;

  // Si hay una sesión anónima heredada de una versión anterior de la app,
  // vincularla con Google conserva su hogar automáticamente — por eso el
  // botón es el mismo en ambos casos, solo cambia el texto de apoyo.
  const isReturningAnonymous = Boolean(cloud.user?.isAnonymous);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center',
      alignItems: 'center', padding: '32px 24px', background: 'var(--cream)', textAlign: 'center',
    }}>
      <h1 style={{ fontSize: 22, fontFamily: 'var(--font-display)', marginBottom: 10 }}>Bienvenido a MiniChef</h1>
      <p style={{ fontSize: 14, color: 'var(--ink-muted)', marginBottom: 24, maxWidth: 320, lineHeight: 1.5 }}>
        {isReturningAnonymous
          ? 'Para seguir usando MiniChef y conservar tu hogar, vincula tu cuenta de Google.'
          : 'Necesitas una cuenta de Google para acceder a MiniChef.'}
      </p>
      <button
        onClick={cloud.signInWithGoogle}
        className="pressable"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          padding: '12px 22px', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)',
          background: 'var(--white)', fontSize: 14, fontWeight: 600, color: 'var(--ink)',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M23.5 12.3c0-.85-.08-1.66-.22-2.45H12v4.63h6.46c-.28 1.5-1.13 2.77-2.4 3.62v3h3.88c2.27-2.09 3.56-5.17 3.56-8.8Z" />
          <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.9l-3.88-3c-1.08.72-2.45 1.15-4.06 1.15-3.13 0-5.78-2.11-6.73-4.96H1.26v3.1C3.24 21.3 7.3 24 12 24Z" />
          <path fill="#FBBC05" d="M5.27 14.29A7.2 7.2 0 0 1 4.89 12c0-.8.14-1.57.38-2.29v-3.1H1.26A11.98 11.98 0 0 0 0 12c0 1.93.47 3.76 1.26 5.39l4.01-3.1Z" />
          <path fill="#EA4335" d="M12 4.75c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0 7.3 0 3.24 2.7 1.26 6.61l4.01 3.1C6.22 6.86 8.87 4.75 12 4.75Z" />
        </svg>
        Continuar con Google
      </button>
    </div>
  );
}
