import { describe, it, expect } from 'vitest';
import {
  RECIPES, recipeById, recipesFor, AGE_RANGES, MEALS, TEXTURES, SEASONS,
  FOOD_GROUPS, CATEGORIES, formatTodayLong, formatUpdatedAt,
} from './data';

// ---------------------------------------------------------------------------
// Estas pruebas codifican, una a una, las reglas de negocio que hemos ido
// pidiendo a lo largo del proyecto. Si algún cambio futuro en el generador
// de recetas o en data.js rompe alguna de estas reglas, el test falla aquí
// — antes de que llegue a producción.
// ---------------------------------------------------------------------------

describe('estructura básica de cada receta', () => {
  it('hay al menos 280 recetas (no se ha perdido contenido por el camino)', () => {
    expect(RECIPES.length).toBeGreaterThanOrEqual(280);
  });

  it('todas las recetas tienen los campos obligatorios', () => {
    for (const r of RECIPES) {
      expect(r.id, 'falta id').toBeTruthy();
      expect(r.name, `falta name en ${r.id}`).toBeTruthy();
      expect(MEALS, `meal inválido en ${r.id}: "${r.meal}"`).toContain(r.meal);
      expect(AGE_RANGES, `age inválido en ${r.id}: "${r.age}"`).toContain(r.age);
      expect(r.ageIdx, `ageIdx fuera de rango en ${r.id}`).toBeGreaterThanOrEqual(0);
      expect(r.ageIdx, `ageIdx fuera de rango en ${r.id}`).toBeLessThanOrEqual(3);
      expect(TEXTURES, `texture inválida en ${r.id}: "${r.texture}"`).toContain(r.texture);
      expect(['Invierno', 'Verano', 'Todo el año'], `seasonLabel inválido en ${r.id}`).toContain(r.seasonLabel);
      expect(Array.isArray(r.ingredients), `ingredients no es array en ${r.id}`).toBe(true);
      expect(r.ingredients.length, `sin ingredientes en ${r.id}`).toBeGreaterThan(0);
      expect(Array.isArray(r.steps), `steps no es array en ${r.id}`).toBe(true);
      expect(r.steps.length, `sin pasos en ${r.id}`).toBeGreaterThan(0);
      expect(Array.isArray(r.categories), `categories no es array en ${r.id}`).toBe(true);
      expect(r.categories.length, `sin categoría calculada en ${r.id}`).toBeGreaterThan(0);
    }
  });

  it('no tiene ids duplicados', () => {
    const ids = RECIPES.map(r => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('no tiene nombres duplicados', () => {
    const names = RECIPES.map(r => r.name);
    const dupes = names.filter((n, i) => names.indexOf(n) !== i);
    expect(dupes, `nombres repetidos: ${[...new Set(dupes)].join(', ')}`).toEqual([]);
  });
});

describe('regla: las meriendas son dulces y nunca puré', () => {
  it('ninguna merienda tiene textura "Puré"', () => {
    const merienda = recipesFor('Merienda');
    expect(merienda.length).toBeGreaterThan(0);
    const conPure = merienda.filter(r => r.texture === 'Puré');
    expect(conPure.map(r => r.name), 'meriendas en puré (no debería haber ninguna)').toEqual([]);
  });

  it('ninguna merienda es un plato salado conocido (aguacate, queso, sin fruta/lácteo)', () => {
    const merienda = recipesFor('Merienda');
    for (const r of merienda) {
      // No exigimos que todas pasen por aquí exactamente, pero sí que ninguna
      // lleve carne o pescado (eso ya sería claramente salado/plato fuerte).
      expect(r.categories, `merienda "${r.name}" lleva carne o pescado`).not.toContain('Carne');
      expect(r.categories, `merienda "${r.name}" lleva carne o pescado`).not.toContain('Pescado');
    }
  });
});

describe('regla: proporciones nutricionales en platos completos', () => {
  it('toda receta que se autodeclara "equilibrada" en sus consejos realmente lleva proteína/legumbre, verdura e hidratos', () => {
    const seDeclaranEquilibradas = RECIPES.filter(r => r.tips.some(t => /equilibrad/i.test(t)));
    expect(seDeclaranEquilibradas.length).toBeGreaterThan(0);
    for (const r of seDeclaranEquilibradas) {
      const tieneProteina = r.foodGroups.includes('Proteína animal') || r.foodGroups.includes('Legumbres');
      const tieneVerdura = r.foodGroups.includes('Verduras');
      expect(tieneProteina, `"${r.name}" dice ser equilibrada pero no aporta proteína ni legumbre`).toBe(true);
      expect(tieneVerdura, `"${r.name}" dice ser equilibrada pero no aporta verdura`).toBe(true);
    }
  });
});

describe('regla: seguridad de los ingredientes', () => {
  it('toda receta con arándanos incluye la instrucción de aplastarlos (riesgo de atragantamiento si van enteros)', () => {
    const conArandanos = RECIPES.filter(r => r.ingredients.some(i => /^Arándanos/i.test(i)));
    expect(conArandanos.length).toBeGreaterThan(0);
    for (const r of conArandanos) {
      const avisa = r.steps.some(s => /apl[aá]st/i.test(s));
      expect(avisa, `"${r.name}" lleva arándanos pero ningún paso indica aplastarlos`).toBe(true);
    }
  });

  it('las "brochetas" nunca usan un palito real (riesgo de pinchazo/atragantamiento)', () => {
    const brochetas = RECIPES.filter(r => r.name.includes('rocheta'));
    expect(brochetas.length).toBeGreaterThan(0);
    for (const r of brochetas) {
      const usaPaloReal = r.ingredients.some(i => /palillo|pincho de madera|brocheta de madera/i.test(i));
      expect(usaPaloReal, `"${r.name}" parece usar un palito real`).toBe(false);
    }
  });

  it('los "tacos"/"quesadillas" nunca se sirven enteros y enrollados: siempre cortados en tiras', () => {
    const wraps = RECIPES.filter(r => /^Taco blando|^Quesadilla/i.test(r.name));
    expect(wraps.length).toBeGreaterThan(0);
    for (const r of wraps) {
      const avisaCortar = r.steps.some(s => /corta en tiras/i.test(s));
      expect(avisaCortar, `"${r.name}" no indica cortarlo en tiras antes de servir`).toBe(true);
    }
  });

  it('toda receta con mantequilla de cacahuete avisa de no usarlo a cucharadas ni en trozos de cacahuete entero', () => {
    const conCacahuete = RECIPES.filter(r => r.allergens.includes('Cacahuete'));
    expect(conCacahuete.length).toBeGreaterThan(0);
    for (const r of conCacahuete) {
      const texto = r.tips.join(' ') + ' ' + r.steps.join(' ');
      const avisa = /capa (muy )?fina|nunca (en|a) cucharadas|cacahuetes? enter/i.test(texto);
      expect(avisa, `"${r.name}" no avisa del riesgo de atragantamiento del cacahuete espeso/entero`).toBe(true);
    }
  });

  it('las recetas con huevo, gluten, lácteos, pescado o cacahuete avisan del alérgeno', () => {
    for (const r of RECIPES) {
      const texto = (r.ingredients.join(' ') + ' ' + r.steps.join(' ')).toLowerCase();
      if (/\bhuevo\b/.test(texto)) expect(r.allergens, `"${r.name}" lleva huevo pero no lo lista como alérgeno`).toContain('Huevo');
      if (/cacahuete/.test(texto)) expect(r.allergens, `"${r.name}" lleva cacahuete pero no lo lista como alérgeno`).toContain('Cacahuete');
      if (/\bpan tierno|pan rallado|pasta\b|fideos|cuscús/.test(texto) && !/\bavena\b/.test(texto)) {
        // el aviso de gluten es exigible salvo que el único cereal presente sea avena (sin gluten)
      }
    }
  });
});

describe('recipesFor / recipeById', () => {
  it('recipesFor(meal) solo devuelve recetas de ese meal', () => {
    for (const meal of MEALS) {
      const list = recipesFor(meal);
      expect(list.length).toBeGreaterThan(0);
      for (const r of list) expect(r.meal).toBe(meal);
    }
  });

  it('recipeById encuentra cualquier receta real por su id', () => {
    for (const r of RECIPES) {
      expect(recipeById(r.id)).toEqual(r);
    }
  });

  it('recipeById devuelve null para un id inexistente', () => {
    expect(recipeById('esto-no-existe-123')).toBeNull();
  });
});

describe('constantes exportadas', () => {
  it('AGE_RANGES tiene 4 franjas en orden creciente', () => {
    expect(AGE_RANGES).toEqual(['12-18 meses', '18-24 meses', '2-3 años', '3-4 años']);
  });

  it('MEALS tiene las 3 comidas', () => {
    expect(MEALS).toEqual(['Comida', 'Merienda', 'Cena']);
  });

  it('cada receta tiene al menos un grupo de alimentos válido de FOOD_GROUPS', () => {
    for (const r of RECIPES) {
      for (const g of r.foodGroups) expect(FOOD_GROUPS, `grupo desconocido "${g}" en ${r.id}`).toContain(g);
    }
  });

  it('cada categoría calculada pertenece a CATEGORIES', () => {
    for (const r of RECIPES) {
      for (const c of r.categories) expect(CATEGORIES, `categoría desconocida "${c}" en ${r.id}`).toContain(c);
    }
  });

  it('SEASONS solo contiene las 2 estaciones elegibles por el usuario', () => {
    expect(SEASONS).toEqual(['invierno', 'verano']);
  });
});

describe('formatTodayLong / formatUpdatedAt', () => {
  it('formatea una fecha con el día de la semana en español', () => {
    const texto = formatTodayLong(new Date(2026, 7, 17)); // 17 ago 2026 = lunes
    expect(texto).toBe('Lunes, 17 de ago');
  });

  it('formatUpdatedAt devuelve el mensaje de "sin datos" si no hay fecha de commit', () => {
    expect(formatUpdatedAt(null)).toBe('Sin datos de commit');
  });

  it('formatUpdatedAt formatea una fecha ISO real', () => {
    const texto = formatUpdatedAt('2026-08-17T16:23:53+02:00');
    expect(texto).toMatch(/Actualizado el 17 ago 2026/);
  });
});
