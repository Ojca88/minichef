import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Allergens from './Allergens';
import { ALLERGENS_TO_INTRODUCE } from '../data';

let mockCloud;
const mockSave = vi.fn((updater) => {
  mockCloud.data = typeof updater === 'function' ? updater(mockCloud.data) : { ...mockCloud.data, ...updater };
});
vi.mock('../CloudSyncContext', () => ({ useCloud: () => mockCloud }));

function renderAllergens() {
  return render(
    <MemoryRouter>
      <Allergens />
    </MemoryRouter>
  );
}

beforeEach(() => {
  mockCloud = { data: {}, save: mockSave, user: { id: 'u1', name: 'Ana', avatar: null } };
  mockSave.mockClear();
});

describe('Allergens — lista de los 14 alérgenos oficiales', () => {
  it('muestra los 14 alérgenos de declaración obligatoria de la UE', () => {
    renderAllergens();
    expect(ALLERGENS_TO_INTRODUCE).toHaveLength(14);
    ALLERGENS_TO_INTRODUCE.forEach((a) => {
      expect(screen.getByText(a.label)).toBeInTheDocument();
    });
  });

  it('el contador empieza en "0 de 14 introducidos"', () => {
    renderAllergens();
    expect(screen.getByText('0 de 14 introducidos')).toBeInTheDocument();
  });
});

describe('Allergens — marcar como introducido', () => {
  it('al abrir un alérgeno sin introducir, aparece el botón de marcarlo', async () => {
    const user = userEvent.setup();
    renderAllergens();
    await user.click(screen.getByText('Gluten (cereales)'));
    expect(screen.getByText('Marcar como introducido hoy')).toBeInTheDocument();
  });

  it('al marcarlo, guarda la fecha de hoy y quién lo hizo', async () => {
    const user = userEvent.setup();
    renderAllergens();
    await user.click(screen.getByText('Gluten (cereales)'));
    await user.click(screen.getByText('Marcar como introducido hoy'));

    expect(mockCloud.data.allergenLog.gluten.introduced).toBe(true);
    expect(mockCloud.data.allergenLog.gluten.by).toEqual({ userId: 'u1', name: 'Ana', avatar: null });
    expect(mockCloud.data.allergenLog.gluten.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('Allergens — reacciones', () => {
  beforeEach(() => {
    mockCloud.data = { allergenLog: { huevo: { introduced: true, date: '2026-08-01' } } };
  });

  it('se puede elegir cómo le sentó', async () => {
    const user = userEvent.setup();
    renderAllergens();
    await user.click(screen.getByText('Huevo'));
    await user.click(screen.getByLabelText('Le encantó'));
    expect(mockCloud.data.allergenLog.huevo.reaction).toBe('loved');
  });

  it('marcar que hubo una reacción muestra el selector de tipo y el aviso de consultar al pediatra', async () => {
    mockCloud.data = { allergenLog: { huevo: { introduced: true, date: '2026-08-01', hasReaction: true } } };
    const user = userEvent.setup();
    renderAllergens();
    await user.click(screen.getByText('Huevo'));
    expect(screen.getByText(/Tipo de reacción/)).toBeInTheDocument();
    expect(screen.getByText(/consulta con el pediatra/i)).toBeInTheDocument();
  });

  it('desmarcar como introducido limpia también la reacción', async () => {
    const user = userEvent.setup();
    renderAllergens();
    await user.click(screen.getByText('Huevo'));
    await user.click(screen.getByText('Desmarcar como introducido'));
    expect(mockCloud.data.allergenLog.huevo.introduced).toBe(false);
    expect(mockCloud.data.allergenLog.huevo.reaction).toBeNull();
  });
});
