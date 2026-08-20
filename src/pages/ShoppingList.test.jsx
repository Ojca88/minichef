import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ShoppingList from './ShoppingList';

// Mockeamos useCloud para no depender de Supabase real: simulamos un estado
// en memoria con la misma forma que usa la app de verdad (save = actualizador
// funcional, igual que el hook real).
let mockData;
const mockSave = vi.fn((updater) => {
  mockData = typeof updater === 'function' ? updater(mockData) : { ...mockData, ...updater };
});

vi.mock('../CloudSyncContext', () => ({
  useCloud: () => ({ data: mockData, save: mockSave }),
}));

beforeEach(() => {
  mockData = { shoppingItems: [] };
  mockSave.mockClear();
});

describe('ShoppingList — añadir y quitar artículos a mano', () => {
  it('añade un artículo escrito a mano a la lista', async () => {
    const user = userEvent.setup();
    render(<ShoppingList />);

    const input = screen.getByPlaceholderText(/Añadir artículo/i);
    await user.type(input, 'Pañales');
    await user.click(screen.getByLabelText('Añadir a la lista'));

    expect(screen.getByText('Pañales')).toBeInTheDocument();
    expect(mockSave).toHaveBeenCalled();
  });

  it('añade un artículo al pulsar Enter, sin necesidad del botón', async () => {
    const user = userEvent.setup();
    render(<ShoppingList />);

    const input = screen.getByPlaceholderText(/Añadir artículo/i);
    await user.type(input, 'Aceite de oliva{Enter}');

    expect(screen.getByText('Aceite de oliva')).toBeInTheDocument();
  });

  it('no añade nada si el campo está vacío', async () => {
    const user = userEvent.setup();
    render(<ShoppingList />);
    await user.click(screen.getByLabelText('Añadir a la lista'));
    expect(mockSave).not.toHaveBeenCalled();
  });

  it('quita un artículo al pulsar su botón de eliminar', async () => {
    mockData = { shoppingItems: [{ id: 'x1', name: 'Yogures', checked: false, manual: true }] };
    const user = userEvent.setup();
    render(<ShoppingList />);

    expect(screen.getByText('Yogures')).toBeInTheDocument();
    await user.click(screen.getByLabelText('Quitar Yogures de la lista'));
    expect(mockSave).toHaveBeenCalled();
  });

  it('marca y desmarca un artículo como comprado', async () => {
    mockData = { shoppingItems: [{ id: 'x2', name: 'Plátanos', checked: false, manual: true }] };
    render(<ShoppingList />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
    fireEvent.click(checkbox);
    expect(mockSave).toHaveBeenCalled();
  });
});

describe('ShoppingList — acordeones', () => {
  it('separa lo añadido a mano de lo generado desde el menú, en grupos distintos', () => {
    mockData = {
      shoppingItems: [
        { id: 'm1', name: 'Champú', checked: false, manual: true },
        { id: 'g1', name: 'Zanahoria — 1 unidad', checked: false, manual: false },
      ],
    };
    render(<ShoppingList />);
    expect(screen.getByText('Añadidos por mí')).toBeInTheDocument();
    expect(screen.getByText('Del menú semanal')).toBeInTheDocument();
  });

  it('el botón "Revertir" solo aparece si hay artículos del menú', () => {
    mockData = { shoppingItems: [{ id: 'm1', name: 'Champú', checked: false, manual: true }] };
    render(<ShoppingList />);
    expect(screen.queryByText('Revertir')).not.toBeInTheDocument();
  });

  it('"Revertir" elimina los artículos del menú sin tocar los añadidos a mano', async () => {
    mockData = {
      shoppingItems: [
        { id: 'm1', name: 'Champú', checked: false, manual: true },
        { id: 'g1', name: 'Zanahoria', checked: false, manual: false },
      ],
    };
    const user = userEvent.setup();
    render(<ShoppingList />);
    await user.click(screen.getByText('Revertir'));
    const [updater] = mockSave.mock.calls.at(-1);
    const result = updater(mockData);
    expect(result.shoppingItems).toEqual([{ id: 'm1', name: 'Champú', checked: false, manual: true }]);
  });
});

describe('ShoppingList — selector de semanas del mes', () => {
  it('el botón de añadir empieza deshabilitado (sin semana seleccionada)', () => {
    render(<ShoppingList />);
    const addButton = screen.getByText(/^Añadir/);
    expect(addButton.closest('button')).toBeDisabled();
  });

  it('seleccionar una semana habilita el botón de añadir', async () => {
    const user = userEvent.setup();
    render(<ShoppingList />);
    await user.click(screen.getByText(/Semana 1/));
    const addButton = screen.getByText(/^Añadir/);
    expect(addButton.closest('button')).not.toBeDisabled();
  });

  it('"Todo el mes" selecciona todas las semanas a la vez', async () => {
    const user = userEvent.setup();
    render(<ShoppingList />);
    await user.click(screen.getByText('Todo el mes'));
    // Con todas las semanas activas, el botón debe indicar más de una semana.
    expect(screen.getByText(/^Añadir \(\d+ semanas?\)/)).toBeInTheDocument();
  });
});
