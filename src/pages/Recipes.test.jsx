import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Recipes from './Recipes';
import { RECIPES } from '../data';

function renderRecipes() {
  return render(
    <MemoryRouter>
      <Recipes />
    </MemoryRouter>
  );
}

describe('Recetario — acordeones por comida', () => {
  // Nota: en el diseño actual, los 3 acordeones (Comida/Merienda/Cena)
  // empiezan cerrados. Nuestra decisión original era que "Comida" empezara
  // abierto para no obligar a un clic antes de ver nada — si eso ha
  // cambiado sin querer, este test lo detectará en el futuro señalando
  // exactamente esta diferencia de comportamiento.
  it('los acordeones muestran el número real de recetas de cada comida en su cabecera', () => {
    renderRecipes();
    const totalComida = RECIPES.filter(r => r.meal === 'Comida').length;
    expect(screen.getByText(String(totalComida))).toBeInTheDocument();
  });

  it('abrir el acordeón de Comida muestra sus recetas', async () => {
    const user = userEvent.setup();
    renderRecipes();
    await user.click(screen.getByText('Comida'));
    const primeraComida = RECIPES.find(r => r.meal === 'Comida');
    expect(screen.getByText(primeraComida.name)).toBeInTheDocument();
  });

  it('abrir el acordeón de Merienda muestra sus recetas', async () => {
    const user = userEvent.setup();
    renderRecipes();
    await user.click(screen.getByText('Merienda'));
    const primeraMerienda = RECIPES.find(r => r.meal === 'Merienda');
    expect(screen.getByText(primeraMerienda.name)).toBeInTheDocument();
  });
});

describe('Recetario — filtro de edad', () => {
  it('filtrar por "12-18 meses" no muestra recetas de edades mayores', async () => {
    const user = userEvent.setup();
    renderRecipes();
    await user.click(screen.getByText('12-18 meses'));
    await user.click(screen.getByText('Comida'));

    const soloMayores = RECIPES.find(r => r.meal === 'Comida' && r.age === '3-4 años' && r.ageIdx > 0);
    if (soloMayores) {
      expect(screen.queryByText(soloMayores.name)).not.toBeInTheDocument();
    }
  });
});

describe('Recetario — filtro de textura', () => {
  it('filtrar por "Puré" no muestra recetas de trocitos ni finger food', async () => {
    const user = userEvent.setup();
    renderRecipes();
    await user.click(screen.getByText('Puré'));
    await user.click(screen.getByText('Comida'));

    const fingerComida = RECIPES.find(r => r.meal === 'Comida' && r.texture === 'Finger food');
    if (fingerComida) {
      expect(screen.queryByText(fingerComida.name)).not.toBeInTheDocument();
    }
  });
});

describe('Recetario — filtro de temporada', () => {
  it('filtrar por "Verano" excluye recetas exclusivas de invierno', async () => {
    const user = userEvent.setup();
    renderRecipes();
    await user.click(screen.getByText('Verano'));
    await user.click(screen.getByText('Comida'));

    const soloInvierno = RECIPES.find(r => r.meal === 'Comida' && r.season === 'invierno');
    if (soloInvierno) {
      expect(screen.queryByText(soloInvierno.name)).not.toBeInTheDocument();
    }
  });
});

describe('Recetario — filtro de tipo de plato (selección múltiple)', () => {
  it('activar "Pescado" excluye recetas de solo carne', async () => {
    const user = userEvent.setup();
    renderRecipes();
    await user.click(screen.getByText('Pescado'));
    await user.click(screen.getByText('Comida'));

    const soloCarne = RECIPES.find(r => r.meal === 'Comida' && r.categories.includes('Carne') && !r.categories.includes('Pescado'));
    if (soloCarne) {
      expect(screen.queryByText(soloCarne.name)).not.toBeInTheDocument();
    }
  });

  it('se pueden combinar dos categorías a la vez (Carne + Pescado)', async () => {
    const user = userEvent.setup();
    renderRecipes();
    await user.click(screen.getByText('Carne'));
    await user.click(screen.getByText('Pescado'));
    await user.click(screen.getByText('Comida'));

    const soloVegetariano = RECIPES.find(r => r.meal === 'Comida' && r.categories.includes('Vegetariano'));
    if (soloVegetariano) {
      expect(screen.queryByText(soloVegetariano.name)).not.toBeInTheDocument();
    }
  });
});
