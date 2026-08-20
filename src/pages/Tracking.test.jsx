import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Tracking from './Tracking';
import { RECIPES } from '../data';

let mockData;
vi.mock('../CloudSyncContext', () => ({
  useCloud: () => ({ data: mockData }),
}));

function mondayOfThisWeek() {
  const d = new Date();
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function keyFor(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

describe('Tracking — sin ninguna comida marcada', () => {
  it('muestra el aviso de que aún no se ha marcado nada, no datos falsos', () => {
    mockData = {};
    render(<Tracking />);
    expect(screen.getByText(/Aún no has marcado ninguna comida/)).toBeInTheDocument();
    expect(screen.getByText('Todavía no hay menú planificado')).toBeInTheDocument();
  });

  it('todos los grupos de alimentos aparecen como "Pendiente"', () => {
    mockData = {};
    render(<Tracking />);
    const pendientes = screen.getAllByText('Pendiente');
    expect(pendientes.length).toBeGreaterThan(0);
    expect(screen.queryByText('Comido')).not.toBeInTheDocument();
  });
});

describe('Tracking — con comidas marcadas (formato nuevo, con atribución)', () => {
  it('cuenta correctamente "X de Y comidas" y marca el grupo correspondiente como Comido', () => {
    const monday = mondayOfThisWeek();
    const comidaVeg = RECIPES.find(r => r.meal === 'Comida' && r.foodGroups.includes('Verduras'));
    const key = keyFor(monday);

    mockData = {
      plans: { [key]: { Comida: comidaVeg.id, Merienda: null, Cena: null } },
      eaten: { [key]: { Comida: { done: true, by: { name: 'Ana', avatar: null } } } },
    };
    render(<Tracking />);

    expect(screen.getByText('1 de 1 comidas marcadas como comidas esta semana')).toBeInTheDocument();
    // El grupo "Verduras" de esa receta debe figurar como Comido.
    const filaVerduras = screen.getByText('Verduras').closest('div');
    expect(filaVerduras).toHaveTextContent('Comido');
  });
});

describe('Tracking — compatibilidad con datos antiguos (boolean, sin atribución)', () => {
  it('un valor boolean "true" antiguo también cuenta como comido', () => {
    const monday = mondayOfThisWeek();
    const comidaVeg = RECIPES.find(r => r.meal === 'Comida' && r.foodGroups.includes('Verduras'));
    const key = keyFor(monday);

    mockData = {
      plans: { [key]: { Comida: comidaVeg.id } },
      eaten: { [key]: { Comida: true } }, // formato viejo, sin { done, by }
    };
    render(<Tracking />);

    expect(screen.getByText('1 de 1 comidas marcadas como comidas esta semana')).toBeInTheDocument();
  });

  it('un valor boolean "false" antiguo no cuenta como comido', () => {
    const monday = mondayOfThisWeek();
    const comidaVeg = RECIPES.find(r => r.meal === 'Comida');
    const key = keyFor(monday);

    mockData = {
      plans: { [key]: { Comida: comidaVeg.id } },
      eaten: { [key]: { Comida: false } },
    };
    render(<Tracking />);

    expect(screen.getByText('0 de 1 comidas marcadas como comidas esta semana')).toBeInTheDocument();
  });
});

describe('Tracking — platos puestos a mano', () => {
  it('un plato manual marcado como comido cuenta en el total, pero no aporta grupos de alimentos', () => {
    const monday = mondayOfThisWeek();
    const key = keyFor(monday);

    mockData = {
      plans: { [key]: { Comida: { manual: true, name: 'Comida en casa de la abuela' } } },
      eaten: { [key]: { Comida: { done: true, by: null } } },
    };
    render(<Tracking />);

    expect(screen.getByText('1 de 1 comidas marcadas como comidas esta semana')).toBeInTheDocument();
    // Como es un plato manual, no puede haber ningún grupo marcado "Comido" por su culpa.
    expect(screen.queryByText('Comido')).not.toBeInTheDocument();
  });
});
