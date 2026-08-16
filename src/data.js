export const AGE_RANGES = ['12-18 meses', '18-24 meses', '2-3 años', '3-4 años'];

export const RECIPES = [
  {
    id: 'r1', name: 'Puré de calabacín y pollo', meal: 'Comida', age: '12-18 meses',
    time: '15 min', texture: 'Puré', allergens: [],
    ingredients: ['1 calabacín', '100g pechuga de pollo', '1 patata pequeña', 'Aceite de oliva'],
    steps: ['Cuece el calabacín y la patata 15 min.', 'Cuece el pollo aparte hasta que esté hecho.', 'Tritura todo junto con un chorrito de aceite.'],
  },
  {
    id: 'r2', name: 'Arroz con verduras', meal: 'Comida', age: '18-24 meses',
    time: '25 min', texture: 'Trocitos', allergens: [],
    ingredients: ['80g arroz', 'Zanahoria', 'Guisantes', 'Cebolla'],
    steps: ['Rehoga la verdura picada fina.', 'Añade el arroz y el doble de agua.', 'Cuece 18 min a fuego bajo.'],
  },
  {
    id: 'r3', name: 'Lentejas suaves', meal: 'Comida', age: '2-3 años',
    time: '35 min', texture: 'Trocitos', allergens: [],
    ingredients: ['Lentejas', 'Zanahoria', 'Tomate', 'Patata'],
    steps: ['Sofríe la verdura.', 'Añade las lentejas y cubre de agua.', 'Cuece 30 min y aplasta un poco.'],
  },
  {
    id: 'r4', name: 'Plátano chafado', meal: 'Merienda', age: '12-18 meses',
    time: '5 min', texture: 'Puré', allergens: [],
    ingredients: ['1 plátano maduro'],
    steps: ['Chafa el plátano con un tenedor hasta la textura deseada.'],
  },
  {
    id: 'r5', name: 'Yogur con fruta', meal: 'Merienda', age: '18-24 meses',
    time: '5 min', texture: 'Trocitos', allergens: ['Lácteos'],
    ingredients: ['Yogur natural', 'Fruta de temporada'],
    steps: ['Corta la fruta en trozos pequeños.', 'Mezcla con el yogur.'],
  },
  {
    id: 'r6', name: 'Crema de calabaza', meal: 'Cena', age: '12-18 meses',
    time: '20 min', texture: 'Puré', allergens: [],
    ingredients: ['Calabaza', 'Puerro', 'Patata'],
    steps: ['Cuece todas las verduras 18 min.', 'Tritura hasta obtener una crema fina.'],
  },
  {
    id: 'r7', name: 'Tortilla francesa suave', meal: 'Cena', age: '2-3 años',
    time: '10 min', texture: 'Trocitos', allergens: ['Huevo'],
    ingredients: ['2 huevos', 'Aceite de oliva'],
    steps: ['Bate el huevo.', 'Cuaja en la sartén a fuego suave por ambos lados.'],
  },
  {
    id: 'r8', name: 'Puré de guisantes', meal: 'Cena', age: '18-24 meses',
    time: '15 min', texture: 'Puré', allergens: [],
    ingredients: ['Guisantes', 'Patata', 'Menta (opcional)'],
    steps: ['Cuece los guisantes y la patata.', 'Tritura hasta lograr una crema homogénea.'],
  },
];

export const MEALS = ['Comida', 'Merienda', 'Cena'];
export const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export function recipesFor(meal) {
  return RECIPES.filter(r => r.meal === meal);
}

export function seededRandom(seed) {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function pickForSeed(meal, seed) {
  const pool = recipesFor(meal);
  const idx = Math.floor(seededRandom(seed) * pool.length);
  return pool[idx];
}

export function buildMonthPlan(year, month) {
  const plan = {};
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    plan[key] = {};
    MEALS.forEach((meal, mi) => {
      plan[key][meal] = pickForSeed(meal, year * 1000 + month * 40 + d * 3 + mi);
    });
  }
  return plan;
}

export function youtubeSearchUrl(query) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query + ' bebé receta')}`;
}
