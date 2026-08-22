import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import HouseholdGate, { inviteErrorMessage } from './HouseholdGate';

let mockCloud;
vi.mock('../CloudSyncContext', () => ({ useCloud: () => mockCloud }));

function renderGate() {
  return render(
    <MemoryRouter>
      <HouseholdGate><p>App real</p></HouseholdGate>
    </MemoryRouter>
  );
}

beforeEach(() => {
  mockCloud = {
    isSupabaseConfigured: true, status: 'no-household', household: null,
    createHousehold: vi.fn().mockResolvedValue({ household: { id: 'h1' } }),
    acceptInvitation: vi.fn(),
  };
});

describe('HouseholdGate', () => {
  it('con hogar, deja pasar directamente', () => {
    mockCloud.household = { id: 'h1', name: 'Mi hogar' };
    renderGate();
    expect(screen.getByText('App real')).toBeInTheDocument();
  });

  it('sin hogar, muestra "crear hogar" y NO el contenido', () => {
    renderGate();
    expect(screen.getByText('Crear mi hogar')).toBeInTheDocument();
    expect(screen.queryByText('App real')).not.toBeInTheDocument();
  });

  it('crear hogar llama a createHousehold con el nombre escrito', async () => {
    const user = userEvent.setup();
    renderGate();
    await user.type(screen.getByPlaceholderText(/Nombre del hogar/), 'Familia García');
    await user.click(screen.getByText('Crear mi hogar'));
    expect(mockCloud.createHousehold).toHaveBeenCalledWith('Familia García');
  });

  it('"Tengo una invitación" extrae el token de una URL completa pegada', async () => {
    mockCloud.acceptInvitation.mockResolvedValue({ ok: true });
    const user = userEvent.setup();
    renderGate();
    await user.click(screen.getByText('Tengo una invitación'));
    await user.type(screen.getByPlaceholderText(/Enlace o código/), 'https://minichef-ojca.vercel.app/#/invite/ABC123xyz');
    await user.click(screen.getByText('Unirme con esta invitación'));
    expect(mockCloud.acceptInvitation).toHaveBeenCalledWith('ABC123xyz');
  });

  it('un token suelto (sin URL) también funciona', async () => {
    mockCloud.acceptInvitation.mockResolvedValue({ ok: true });
    const user = userEvent.setup();
    renderGate();
    await user.click(screen.getByText('Tengo una invitación'));
    await user.type(screen.getByPlaceholderText(/Enlace o código/), 'soloUnToken');
    await user.click(screen.getByText('Unirme con esta invitación'));
    expect(mockCloud.acceptInvitation).toHaveBeenCalledWith('soloUnToken');
  });
});

describe('inviteErrorMessage', () => {
  it('devuelve un mensaje legible para cada código de error conocido', () => {
    expect(inviteErrorMessage('CADUCADA')).toMatch(/caducado/i);
    expect(inviteErrorMessage('EMAIL_NO_COINCIDE', 'maria@gmail.com')).toContain('maria@gmail.com');
    expect(inviteErrorMessage('YA_TIENES_HOGAR')).toMatch(/ya pertenece/i);
  });

  it('para un código desconocido, devuelve un mensaje genérico sin romper', () => {
    expect(inviteErrorMessage('ALGO_RARO')).toBeTruthy();
  });
});
