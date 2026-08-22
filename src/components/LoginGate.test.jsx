import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoginGate from './LoginGate';

let mockCloud;
vi.mock('../CloudSyncContext', () => ({ useCloud: () => mockCloud }));

describe('LoginGate', () => {
  it('muestra "Cargando" mientras se resuelve la sesión', () => {
    mockCloud = { isSupabaseConfigured: true, authLoading: true, user: null };
    render(<LoginGate><p>App real</p></LoginGate>);
    expect(screen.getByText('Cargando…')).toBeInTheDocument();
    expect(screen.queryByText('App real')).not.toBeInTheDocument();
  });

  it('sin usuario, muestra el botón de Google y NO el contenido', () => {
    mockCloud = { isSupabaseConfigured: true, authLoading: false, user: null, signInWithGoogle: vi.fn() };
    render(<LoginGate><p>App real</p></LoginGate>);
    expect(screen.getByText('Continuar con Google')).toBeInTheDocument();
    expect(screen.queryByText('App real')).not.toBeInTheDocument();
  });

  it('con sesión anónima (heredada), sigue sin dejar pasar, con texto distinto', () => {
    mockCloud = { isSupabaseConfigured: true, authLoading: false, user: { isAnonymous: true }, signInWithGoogle: vi.fn() };
    render(<LoginGate><p>App real</p></LoginGate>);
    expect(screen.getByText(/vincula tu cuenta de Google/i)).toBeInTheDocument();
    expect(screen.queryByText('App real')).not.toBeInTheDocument();
  });

  it('con una cuenta de Google real, muestra el contenido', () => {
    mockCloud = { isSupabaseConfigured: true, authLoading: false, user: { isAnonymous: false, id: 'u1' } };
    render(<LoginGate><p>App real</p></LoginGate>);
    expect(screen.getByText('App real')).toBeInTheDocument();
  });
});
