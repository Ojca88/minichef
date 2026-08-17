import { describe, it, expect } from 'vitest';
import { RECIPES, recipeById, AGE_RANGES, MEALS } from './data';
import { seedFor, generateIdsFor, poolFor, pickForSeedAged } from './planLogic';

// Import interno solo para los tests de poolFor/pickForSeedAged, que no se
// exportan desde Planner.jsx pero sí desde planLogic.js.

function allDatesInYear(year) {
  const dates = [];
  for (let m = 0; m < 12; m++) {
    const daysInMonth = new Date(year, m + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      dates.push(new Date(year, m, day));
    }
  }
  return dates;
}

describe('datos de recetas', () => {
  it('no tiene ids de receta duplicados', () => {
    const ids = RECIPES.map(r => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('recipeById siempre devuelve la receta con ese id exacto', () => {
    for (const r of RECIPES) {
      expect(recipeById(r.id)?.id).toBe(r.id);
    }
  });
});

describe('seedFor (semilla de fecha+comida)', () => {
  it('no colisiona entre distintas fechas del mismo año', () => {
    // Bug real: la fórmula anterior (mes*40 + día*3 + turno) se solapaba
    // entre meses consecutivos y producía cientos de semillas repetidas
    // por año, correlacionando la asignación entre fechas independientes.
    const seen = new Map();
    let collisions = 0;
    for (const d of allDatesInYear(2026)) {
      for (let mi = 0; mi < MEALS.length; mi++) {
        const seed = seedFor(d, mi);
        const label = `${d.toISOString().slice(0, 10)} mi=${mi}`;
        if (seen.has(seed)) collisions++;
        else seen.set(seed, label);
      }
    }
    expect(collisions).toBe(0);
  });

  it('no colisiona entre el 31 de diciembre y el 1 de enero del año siguiente', () => {
    const a = seedFor(new Date(2026, 11, 31), 0);
    const b = seedFor(new Date(2027, 0, 1), 0);
    expect(a).not.toBe(b);
  });
});

describe('poolFor (criterios de edad y temporada)', () => {
  it('solo devuelve recetas del tipo de comida solicitado', () => {
    for (const meal of MEALS) {
      const pool = poolFor(meal, null, null);
      expect(pool.length).toBeGreaterThan(0);
      for (const r of pool) expect(r.meal).toBe(meal);
    }
  });

  it('respeta el filtro de edad cuando hay recetas suficientes', () => {
    const ageIdx = AGE_RANGES.indexOf('12-18 meses');
    for (const meal of MEALS) {
      const pool = poolFor(meal, ageIdx, null);
      const tooOld = pool.filter(r => r.ageIdx > ageIdx);
      // Si el pool filtrado por edad se queda vacío, poolFor cae de vuelta
      // al total sin filtrar (comportamiento esperado, no un fallo).
      const strict = RECIPES.filter(r => r.meal === meal && r.ageIdx <= ageIdx);
      if (strict.length > 0) expect(tooOld.length).toBe(0);
    }
  });

  it('respeta el filtro de temporada cuando hay recetas suficientes', () => {
    for (const meal of MEALS) {
      const pool = poolFor(meal, null, 'verano');
      const strict = RECIPES.filter(r => r.meal === meal && (r.season === 'verano' || r.season === 'ambas'));
      if (strict.length > 0) {
        for (const r of pool) expect(['verano', 'ambas']).toContain(r.season);
      }
    }
  });
});

describe('generateIdsFor (asignación real del plan)', () => {
  it('asigna a cada hueco una receta del tipo de comida correcto', () => {
    const dates = allDatesInYear(2026).slice(0, 60); // dos meses de muestra
    const patch = generateIdsFor(dates, null, null);
    for (const key of Object.keys(patch)) {
      for (const meal of MEALS) {
        const id = patch[key][meal];
        const recipe = recipeById(id);
        expect(recipe, `id "${id}" asignado a ${key}/${meal} no existe`).toBeTruthy();
        expect(recipe.meal, `receta asignada a ${key}/${meal} es en realidad de "${recipe.meal}"`).toBe(meal);
      }
    }
  });

  it('respeta la edad del bebé configurada, si hay recetas suficientes', () => {
    const ageIdx = AGE_RANGES.indexOf('12-18 meses');
    const dates = allDatesInYear(2026).slice(0, 30);
    const patch = generateIdsFor(dates, ageIdx, null);
    for (const key of Object.keys(patch)) {
      for (const meal of MEALS) {
        const recipe = recipeById(patch[key][meal]);
        const strictPoolExists = RECIPES.some(r => r.meal === meal && r.ageIdx <= ageIdx);
        if (strictPoolExists) expect(recipe.ageIdx).toBeLessThanOrEqual(ageIdx);
      }
    }
  });

  it('genera resultados deterministas para las mismas fechas y criterios', () => {
    const dates = allDatesInYear(2026).slice(0, 14);
    const a = generateIdsFor(dates, null, null);
    const b = generateIdsFor(dates, null, null);
    expect(a).toEqual(b);
  });
});

describe('pickForSeedAged', () => {
  it('nunca devuelve una receta de un tipo de comida distinto al pedido', () => {
    for (const meal of MEALS) {
      for (let seed = 0; seed < 50; seed++) {
        const recipe = pickForSeedAged(meal, seed, null, null);
        expect(recipe.meal).toBe(meal);
      }
    }
  });
});
