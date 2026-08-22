import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CloudSyncProvider, useCloud } from './CloudSyncContext';

// ---------------------------------------------------------------------------
// Mock completo del cliente de Supabase — comprobamos que el contexto llama
// a las funciones correctas y reacciona bien a sus respuestas, incluidos los
// errores. La comprobación de RLS real vive aparte, en
// SEGURIDAD-RLS-tests-manuales.md, contra un Supabase de verdad.
// ---------------------------------------------------------------------------
const { mockAuth, mockRpc, mockFrom, mockChannel, mockInvoke } = vi.hoisted(() => ({
  mockAuth: {
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    signOut: vi.fn(),
    linkIdentity: vi.fn(),
    signInWithOAuth: vi.fn(),
  },
  mockRpc: vi.fn(),
  mockFrom: vi.fn(),
  mockChannel: vi.fn(() => ({ on: vi.fn().mockReturnThis(), subscribe: vi.fn().mockReturnThis() })),
  mockInvoke: vi.fn(),
}));

vi.mock('./supabaseClient', () => ({
  isSupabaseConfigured: true,
  supabase: {
    auth: mockAuth,
    rpc: (...args) => mockRpc(...args),
    from: (...args) => mockFrom(...args),
    channel: (...args) => mockChannel(...args),
    removeChannel: vi.fn(),
    functions: { invoke: (...args) => mockInvoke(...args) },
  },
}));

function googleSession() {
  return {
    user: {
      id: 'google-user-1',
      is_anonymous: false,
      email: 'ana@gmail.com',
      user_metadata: { full_name: 'Ana', avatar_url: null },
    },
  };
}

function anonSession() {
  return { user: { id: 'anon-1', is_anonymous: true, email: null, user_metadata: {} } };
}

function TestConsumer() {
  const cloud = useCloud();
  return (
    <div>
      <span data-testid="status">{cloud.status}</span>
      <span data-testid="user-id">{cloud.user?.id || 'sin-usuario'}</span>
      <span data-testid="is-anon">{String(cloud.user?.isAnonymous)}</span>
      <span data-testid="household">{cloud.household?.invite_code || 'sin-hogar'}</span>
      <span data-testid="invitations-count">{cloud.invitations.length}</span>
      <button onClick={() => cloud.createHousehold('Familia Test')}>crear</button>
      <button onClick={async () => { window.__lastRemoveResult = await cloud.removeMember('otro-user'); }}>expulsar</button>
      <button onClick={async () => { window.__lastDeleteAccountResult = await cloud.deleteMyAccount({}); }}>eliminar-cuenta</button>
      <button onClick={async () => { window.__lastInviteResult = await cloud.sendInvitation('maria@gmail.com'); }}>invitar</button>
      <button onClick={async () => { window.__lastAcceptResult = await cloud.acceptInvitation('token-de-prueba'); }}>aceptar-invitacion</button>
    </div>
  );
}

function renderCloud() {
  return render(
    <CloudSyncProvider>
      <TestConsumer />
    </CloudSyncProvider>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mockRpc.mockImplementation((fn) => {
    if (fn === 'my_household') return { maybeSingle: () => Promise.resolve({ data: null, error: null }) };
    return Promise.resolve({ data: null, error: null });
  });
  mockFrom.mockReturnValue({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    then: undefined,
  });
});

describe('CloudSyncContext — ya no hay sesión anónima automática', () => {
  it('sin ninguna sesión, no crea ninguna automáticamente (status "logged-out")', async () => {
    mockAuth.getSession.mockResolvedValue({ data: { session: null } });
    renderCloud();
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('logged-out'));
    expect(screen.getByTestId('user-id')).toHaveTextContent('sin-usuario');
  });

  it('una sesión anónima heredada de antes NO cuenta como "logueado" (status "logged-out")', async () => {
    mockAuth.getSession.mockResolvedValue({ data: { session: anonSession() } });
    renderCloud();
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('logged-out'));
    expect(screen.getByTestId('is-anon')).toHaveTextContent('true');
    // Nunca debe intentar cargar un hogar para una sesión anónima.
    expect(mockRpc).not.toHaveBeenCalledWith('my_household');
  });

  it('con una sesión de Google real, sí carga el hogar (o "no-household" si no tiene)', async () => {
    mockAuth.getSession.mockResolvedValue({ data: { session: googleSession() } });
    renderCloud();
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('no-household'));
    expect(screen.getByTestId('is-anon')).toHaveTextContent('false');
  });
});

describe('CloudSyncContext — crear hogar', () => {
  it('createHousehold llama al RPC y guarda el hogar devuelto', async () => {
    mockAuth.getSession.mockResolvedValue({ data: { session: googleSession() } });
    mockRpc.mockImplementation((fn, args) => {
      if (fn === 'my_household') return { maybeSingle: () => Promise.resolve({ data: null, error: null }) };
      if (fn === 'create_household') {
        expect(args).toEqual({ household_name: 'Familia Test' });
        return Promise.resolve({ data: { id: 'h1', invite_code: 'K7P4XM', name: 'Familia Test', data: {} }, error: null });
      }
      return Promise.resolve({ data: null, error: null });
    });
    mockFrom.mockReturnValue({ select: vi.fn().mockReturnThis(), eq: vi.fn().mockResolvedValue({ data: [] }) });

    const user = userEvent.setup();
    renderCloud();
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('no-household'));

    await user.click(screen.getByText('crear'));

    await waitFor(() => expect(screen.getByTestId('household')).toHaveTextContent('K7P4XM'));
  });
});

describe('CloudSyncContext — invitar a alguien', () => {
  it('sendInvitation llama a la Edge Function con el email y refresca invitaciones', async () => {
    mockAuth.getSession.mockResolvedValue({ data: { session: googleSession() } });
    mockRpc.mockImplementation((fn) => {
      if (fn === 'my_household') return { maybeSingle: () => Promise.resolve({ data: { id: 'h1', invite_code: 'K7P4XM' }, error: null }) };
      if (fn === 'expire_stale_invitations') return Promise.resolve({ data: null, error: null });
      return Promise.resolve({ data: null, error: null });
    });
    mockFrom.mockImplementation((table) => {
      if (table === 'household_members') return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockResolvedValue({ data: [] }) };
      if (table === 'household_invitations') {
        return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), order: vi.fn().mockResolvedValue({ data: [{ id: 'inv1', invited_email: 'maria@gmail.com', status: 'pending' }] }) };
      }
      return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis() };
    });
    mockInvoke.mockResolvedValue({ data: { ok: true, emailSent: true }, error: null });

    const user = userEvent.setup();
    renderCloud();
    await waitFor(() => expect(screen.getByTestId('household')).toHaveTextContent('K7P4XM'));

    await user.click(screen.getByText('invitar'));

    await waitFor(() => expect(mockInvoke).toHaveBeenCalledWith('send-household-invitation', { body: { email: 'maria@gmail.com' } }));
    await waitFor(() => expect(window.__lastInviteResult).toEqual({ ok: true, emailSent: true, inviteLink: undefined }));
  });

  it('si el backend responde con un error de negocio, lo devuelve tal cual', async () => {
    mockAuth.getSession.mockResolvedValue({ data: { session: googleSession() } });
    mockRpc.mockImplementation((fn) => {
      if (fn === 'my_household') return { maybeSingle: () => Promise.resolve({ data: { id: 'h1', invite_code: 'K7P4XM' }, error: null }) };
      return Promise.resolve({ data: null, error: null });
    });
    mockFrom.mockReturnValue({ select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), order: vi.fn().mockResolvedValue({ data: [] }) });
    mockInvoke.mockResolvedValue({ data: { error: 'SOLO_EL_PROPIETARIO_PUEDE_INVITAR' }, error: null });

    const user = userEvent.setup();
    renderCloud();
    await waitFor(() => expect(screen.getByTestId('household')).toHaveTextContent('K7P4XM'));

    await user.click(screen.getByText('invitar'));

    await waitFor(() => expect(window.__lastInviteResult).toEqual({ error: 'SOLO_EL_PROPIETARIO_PUEDE_INVITAR' }));
  });
});

describe('CloudSyncContext — aceptar invitación', () => {
  it('hashea el token y llama al RPC atómico, luego recarga el hogar', async () => {
    mockAuth.getSession.mockResolvedValue({ data: { session: googleSession() } });
    let acceptCalledWith = null;
    mockRpc.mockImplementation((fn, args) => {
      if (fn === 'my_household') return { maybeSingle: () => Promise.resolve({ data: null, error: null }) };
      if (fn === 'accept_household_invitation') {
        acceptCalledWith = args;
        return Promise.resolve({ data: { ok: true, household_id: 'h1' }, error: null });
      }
      return Promise.resolve({ data: null, error: null });
    });

    const user = userEvent.setup();
    renderCloud();
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('no-household'));

    await user.click(screen.getByText('aceptar-invitacion'));

    await waitFor(() => expect(window.__lastAcceptResult).toEqual({ ok: true }));
    // El token nunca viaja en claro al backend: se manda su hash SHA-256.
    expect(acceptCalledWith.p_token_hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('si el email no coincide, devuelve el error con el email invitado', async () => {
    mockAuth.getSession.mockResolvedValue({ data: { session: googleSession() } });
    mockRpc.mockImplementation((fn) => {
      if (fn === 'my_household') return { maybeSingle: () => Promise.resolve({ data: null, error: null }) };
      if (fn === 'accept_household_invitation') {
        return Promise.resolve({ data: { error: 'EMAIL_NO_COINCIDE', invited_email: 'otra@gmail.com' }, error: null });
      }
      return Promise.resolve({ data: null, error: null });
    });

    const user = userEvent.setup();
    renderCloud();
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('no-household'));

    await user.click(screen.getByText('aceptar-invitacion'));

    await waitFor(() => expect(window.__lastAcceptResult).toEqual({ error: 'EMAIL_NO_COINCIDE', invitedEmail: 'otra@gmail.com' }));
  });
});

describe('CloudSyncContext — expulsar a un miembro', () => {
  it('borra la fila de household_members del miembro indicado', async () => {
    const mockDelete = vi.fn().mockReturnThis();
    mockAuth.getSession.mockResolvedValue({ data: { session: googleSession() } });
    mockRpc.mockImplementation((fn) => {
      if (fn === 'my_household') return { maybeSingle: () => Promise.resolve({ data: { id: 'h1', invite_code: 'K7P4XM' }, error: null }) };
      return Promise.resolve({ data: null, error: null });
    });
    mockFrom.mockImplementation((table) => {
      if (table === 'household_members') {
        return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), delete: mockDelete, then: (cb) => cb({ data: [] }) };
      }
      return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), order: vi.fn().mockResolvedValue({ data: [] }) };
    });

    const user = userEvent.setup();
    renderCloud();
    await waitFor(() => expect(screen.getByTestId('household')).toHaveTextContent('K7P4XM'));

    await user.click(screen.getByText('expulsar'));

    await waitFor(() => expect(mockDelete).toHaveBeenCalled());
    await waitFor(() => expect(window.__lastRemoveResult).toBe(true));
  });
});

describe('CloudSyncContext — eliminar mi cuenta', () => {
  it('llama a la Edge Function delete-account y, si va bien, cierra sesión', async () => {
    mockAuth.getSession.mockResolvedValue({ data: { session: googleSession() } });
    mockAuth.signOut.mockResolvedValue({ error: null });
    mockInvoke.mockResolvedValue({ data: { ok: true }, error: null });

    const user = userEvent.setup();
    renderCloud();
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('no-household'));

    await user.click(screen.getByText('eliminar-cuenta'));

    await waitFor(() => expect(mockInvoke).toHaveBeenCalledWith('delete-account', { body: {} }));
    await waitFor(() => expect(window.__lastDeleteAccountResult).toEqual({ ok: true }));
    expect(mockAuth.signOut).toHaveBeenCalled();
  });

  it('si es propietario con más miembros, devuelve REQUIERE_DECISION sin cerrar sesión', async () => {
    mockAuth.getSession.mockResolvedValue({ data: { session: googleSession() } });
    mockInvoke.mockResolvedValue({ data: { error: 'REQUIERE_DECISION', householdId: 'h1' }, error: null });

    const user = userEvent.setup();
    renderCloud();
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('no-household'));

    await user.click(screen.getByText('eliminar-cuenta'));

    await waitFor(() => expect(window.__lastDeleteAccountResult).toEqual({ error: 'REQUIERE_DECISION', householdId: 'h1' }));
    expect(mockAuth.signOut).not.toHaveBeenCalled();
  });
});
