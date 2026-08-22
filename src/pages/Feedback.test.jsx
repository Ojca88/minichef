import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Feedback from './Feedback';

let mockCloud;
vi.mock('../CloudSyncContext', () => ({ useCloud: () => mockCloud }));

const { mockFrom, mockStorageFrom, mockInvoke } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  mockStorageFrom: vi.fn(),
  mockInvoke: vi.fn(),
}));

vi.mock('../supabaseClient', () => ({
  isSupabaseConfigured: true,
  supabase: {
    from: (...args) => mockFrom(...args),
    storage: { from: (...args) => mockStorageFrom(...args) },
    functions: { invoke: (...args) => mockInvoke(...args) },
  },
}));

function renderFeedback() {
  return render(
    <MemoryRouter>
      <Feedback />
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mockCloud = { user: { id: 'u1', email: 'ana@gmail.com' }, household: { id: 'h1' } };
  mockInvoke.mockResolvedValue({ data: { ok: true }, error: null });
});

describe('Feedback — selección de categoría', () => {
  it('el formulario no aparece hasta elegir una categoría', () => {
    renderFeedback();
    expect(screen.queryByPlaceholderText('Escribe aquí tu comentario...')).not.toBeInTheDocument();
  });

  it('al elegir "He encontrado un problema" aparecen los campos extra de bug', async () => {
    const user = userEvent.setup();
    renderFeedback();
    await user.click(screen.getByText('He encontrado un problema'));
    expect(screen.getByPlaceholderText(/estaba intentando crear una receta/i)).toBeInTheDocument();
  });

  it('con "Tengo una sugerencia" NO aparecen los campos de bug', async () => {
    const user = userEvent.setup();
    renderFeedback();
    await user.click(screen.getByText('Tengo una sugerencia'));
    expect(screen.queryByPlaceholderText(/estaba intentando crear una receta/i)).not.toBeInTheDocument();
  });
});

describe('Feedback — validación del comentario', () => {
  it('el botón de enviar empieza deshabilitado (sin texto)', async () => {
    const user = userEvent.setup();
    renderFeedback();
    await user.click(screen.getByText('Otro comentario'));
    expect(screen.getByText('Enviar comentario')).toBeDisabled();
  });

  it('el contador de caracteres refleja lo escrito, hasta el límite de 2000', async () => {
    const user = userEvent.setup();
    renderFeedback();
    await user.click(screen.getByText('Otro comentario'));
    await user.type(screen.getByPlaceholderText('Escribe aquí tu comentario...'), 'Hola');
    expect(screen.getByText('4 / 2000')).toBeInTheDocument();
  });
});

describe('Feedback — envío', () => {
  it('inserta el feedback con los datos del usuario y avisa por email', async () => {
    const mockSingle = vi.fn().mockResolvedValue({ data: { id: 'fb1' }, error: null });
    const mockSelect = vi.fn(() => ({ single: mockSingle }));
    const mockInsert = vi.fn(() => ({ select: mockSelect }));
    mockFrom.mockReturnValue({ insert: mockInsert });

    const user = userEvent.setup();
    renderFeedback();
    await user.click(screen.getByText('Tengo una sugerencia'));
    await user.type(screen.getByPlaceholderText('Escribe aquí tu comentario...'), 'Me gustaría más recetas de pescado');
    await user.click(screen.getByText('Enviar comentario'));

    await waitFor(() => expect(mockInsert).toHaveBeenCalled());
    const payload = mockInsert.mock.calls[0][0];
    expect(payload.user_id).toBe('u1');
    expect(payload.household_id).toBe('h1');
    expect(payload.type).toBe('suggestion');
    expect(payload.message).toBe('Me gustaría más recetas de pescado');

    await waitFor(() => expect(mockInvoke).toHaveBeenCalledWith('send-feedback-notification', { body: { feedbackId: 'fb1' } }));
    await waitFor(() => expect(screen.getByText('Gracias por ayudarnos a mejorar MiniChef')).toBeInTheDocument());
  });

  it('muestra el mensaje de confirmación específico según el tipo', async () => {
    const mockSingle = vi.fn().mockResolvedValue({ data: { id: 'fb1' }, error: null });
    mockFrom.mockReturnValue({ insert: () => ({ select: () => ({ single: mockSingle }) }) });

    const user = userEvent.setup();
    renderFeedback();
    await user.click(screen.getByText('He encontrado un problema'));
    await user.type(screen.getByPlaceholderText('Escribe aquí tu comentario...'), 'La app se cierra sola');
    await user.click(screen.getByText('Enviar comentario'));

    await waitFor(() => expect(screen.getByText('Gracias por avisarnos. Revisaremos el problema.')).toBeInTheDocument());
  });

  it('si falla la inserción, muestra un error y no rompe la pantalla', async () => {
    mockFrom.mockReturnValue({ insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: { message: 'boom' } }) }) }) });

    const user = userEvent.setup();
    renderFeedback();
    await user.click(screen.getByText('Otro comentario'));
    await user.type(screen.getByPlaceholderText('Escribe aquí tu comentario...'), 'Algo');
    await user.click(screen.getByText('Enviar comentario'));

    await waitFor(() => expect(screen.getByText(/No se pudo enviar/i)).toBeInTheDocument());
  });
});
