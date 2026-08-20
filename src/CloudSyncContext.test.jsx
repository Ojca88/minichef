import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CloudSyncProvider, useCloud } from './CloudSyncContext';

// ---------------------------------------------------------------------------
// Mock completo del cliente de Supabase: no hablamos con una base de datos
// real (eso lo comprobamos aparte, con las consultas SQL manuales de
// supabase-schema-v2-households.sql), pero sí verificamos que nuestro
// contexto llama a las funciones correctas, en el orden correcto, y
// reacciona bien a sus respuestas (incluidos los errores).
// ---------------------------------------------------------------------------
const { mockAuth, mockRpc, mockFrom, mockChannel } = vi.hoisted(() => ({
  mockAuth: {
    getSession: vi.fn(),
    signInAnonymously: vi.fn(),
    onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    signOut: vi.fn(),
    linkIdentity: vi.fn(),
    signInWithOAuth: vi.fn(),
  },
  mockRpc: vi.fn(),
  mockFrom: vi.fn(),
  mockChannel: vi.fn(() => ({ on: vi.fn().mockReturnThis(), subscribe: vi.fn().mockReturnThis() })),
}));

vi.mock('./supabaseClient', () => ({
  isSupabaseConfigured: true,
  supabase: {
    auth: mockAuth,
    rpc: (...args) => mockRpc(...args),
    from: (...args) => mockFrom(...args),
    channel: (...args) => mockChannel(...args),
    removeChannel: vi.fn(),
  },
}));

function anonSession() {
  return {
    user: {
      id: 'anon-user-1',
      is_anonymous: true,
      user_metadata: {},
      email: null,
    },
  };
}

function TestConsumer() {
  const cloud = useCloud();
  return (
    <div>
      <span data-testid="status">{cloud.status}</span>
      <span data-testid="user-id">{cloud.user?.id || 'sin-usuario'}</span>
      <span data-testid="is-anon">{String(cloud.user?.isAnonymous)}</span>
      <span data-testid="household">{cloud.household?.invite_code || 'sin-hogar'}</span>
      <button onClick={() => cloud.createHousehold('Familia Test')}>crear</button>
      <button onClick={async () => {
        const r = await cloud.joinHousehold('MALCOD');
        window.__lastJoinResult = r;
      }}>unirme</button>
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
    update: vi.fn().mockReturnThis(),
    then: undefined,
  });
});

describe('CloudSyncContext — sesión anónima automática', () => {
  it('si no hay ninguna sesión, crea una anónima automáticamente al arrancar', async () => {
    mockAuth.getSession
      .mockResolvedValueOnce({ data: { session: null } }) // primera comprobación: no hay sesión
      .mockResolvedValueOnce({ data: { session: anonSession() } }); // tras signInAnonymously
    mockAuth.signInAnonymously.mockResolvedValue({ data: {}, error: null });

    renderCloud();

    await waitFor(() => expect(mockAuth.signInAnonymously).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.getByTestId('user-id')).toHaveTextContent('anon-user-1'));
    expect(screen.getByTestId('is-anon')).toHaveTextContent('true');
  });

  it('si ya hay sesión (aunque sea anónima), no vuelve a crear otra', async () => {
    mockAuth.getSession.mockResolvedValue({ data: { session: anonSession() } });

    renderCloud();

    await waitFor(() => expect(screen.getByTestId('user-id')).toHaveTextContent('anon-user-1'));
    expect(mockAuth.signInAnonymously).not.toHaveBeenCalled();
  });

  it('sin hogar todavía, el estado pasa a "no-household"', async () => {
    mockAuth.getSession.mockResolvedValue({ data: { session: anonSession() } });
    mockRpc.mockImplementation((fn) => {
      if (fn === 'my_household') return { maybeSingle: () => Promise.resolve({ data: null, error: null }) };
      return Promise.resolve({ data: null, error: null });
    });

    renderCloud();

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('no-household'));
    expect(screen.getByTestId('household')).toHaveTextContent('sin-hogar');
  });
});

describe('CloudSyncContext — crear hogar', () => {
  it('createHousehold llama al RPC create_household y guarda el hogar devuelto', async () => {
    mockAuth.getSession.mockResolvedValue({ data: { session: anonSession() } });
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

describe('CloudSyncContext — unirse a un hogar', () => {
  it('un código inválido devuelve un error legible, sin romper la app', async () => {
    mockAuth.getSession.mockResolvedValue({ data: { session: anonSession() } });
    mockRpc.mockImplementation((fn) => {
      if (fn === 'my_household') return { maybeSingle: () => Promise.resolve({ data: null, error: null }) };
      if (fn === 'join_household') return Promise.resolve({ data: null, error: { message: 'CODIGO_INVALIDO' } });
      return Promise.resolve({ data: null, error: null });
    });

    const user = userEvent.setup();
    renderCloud();
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('no-household'));

    await user.click(screen.getByText('unirme'));

    await waitFor(() => expect(window.__lastJoinResult).toEqual({ error: 'CODIGO_INVALIDO' }));
    // La app no debe quedarse en un hogar a medias tras un código inválido.
    expect(screen.getByTestId('household')).toHaveTextContent('sin-hogar');
  });
});
