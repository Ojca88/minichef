import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FoodDisclaimerGate from './FoodDisclaimerGate';

beforeEach(() => {
  localStorage.clear();
});

describe('FoodDisclaimerGate', () => {
  it('muestra el aviso y NO el contenido si todavía no se ha aceptado', () => {
    render(
      <FoodDisclaimerGate>
        <p>Contenido de recetas</p>
      </FoodDisclaimerGate>
    );
    expect(screen.getByText('Información importante')).toBeInTheDocument();
    expect(screen.queryByText('Contenido de recetas')).not.toBeInTheDocument();
  });

  it('el botón "Continuar" empieza deshabilitado hasta marcar la casilla', () => {
    render(
      <FoodDisclaimerGate>
        <p>Contenido de recetas</p>
      </FoodDisclaimerGate>
    );
    expect(screen.getByText('Continuar')).toBeDisabled();
  });

  it('tras marcar la casilla y pulsar Continuar, se muestra el contenido y se recuerda', async () => {
    const user = userEvent.setup();
    render(
      <FoodDisclaimerGate>
        <p>Contenido de recetas</p>
      </FoodDisclaimerGate>
    );

    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByText('Continuar'));

    expect(screen.getByText('Contenido de recetas')).toBeInTheDocument();
    expect(screen.queryByText('Información importante')).not.toBeInTheDocument();
  });

  it('si ya se había aceptado antes (localStorage), no vuelve a mostrar el aviso', () => {
    localStorage.setItem('minichef:food-disclaimer-accepted-v1', 'true');
    render(
      <FoodDisclaimerGate>
        <p>Contenido de recetas</p>
      </FoodDisclaimerGate>
    );
    expect(screen.getByText('Contenido de recetas')).toBeInTheDocument();
  });
});
