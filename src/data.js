import RAW_RECIPES from './recipes.json';

export const AGE_RANGES = ['12-18 meses', '18-24 meses', '2-3 años', '3-4 años'];
export const MEALS = ['Comida', 'Merienda', 'Cena'];
export const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const MEAL_LABELS = { comida: 'Comida', merienda: 'Merienda', cena: 'Cena' };
const TEXTURE_LABELS = { pure: 'Puré', trocitos: 'Trocitos', finger: 'Finger food' };
const ALLERGEN_LABELS = { huevo: 'Huevo', lacteos: 'Lácteos', gluten: 'Gluten', pescado: 'Pescado', frutosSecos: 'Frutos secos', cacahuete: 'Cacahuete' };

// Los 14 alérgenos de declaración obligatoria según la normativa de la UE
// (Reglamento 1169/2011) — es la lista de referencia que se usa en España
// para hablar de introducción de alérgenos, más completa que los 5 que
// aparecen realmente en los ingredientes de nuestras recetas (arriba).
export const ALLERGENS_TO_INTRODUCE = [
  { key: 'gluten', label: 'Gluten (cereales)' },
  { key: 'crustaceos', label: 'Crustáceos' },
  { key: 'huevo', label: 'Huevo' },
  { key: 'pescado', label: 'Pescado' },
  { key: 'cacahuetes', label: 'Cacahuetes' },
  { key: 'soja', label: 'Soja' },
  { key: 'leche', label: 'Leche / lácteos' },
  { key: 'frutosCascara', label: 'Frutos de cáscara (nueces, almendras...)' },
  { key: 'apio', label: 'Apio' },
  { key: 'mostaza', label: 'Mostaza' },
  { key: 'sesamo', label: 'Sésamo' },
  { key: 'sulfitos', label: 'Sulfitos' },
  { key: 'altramuces', label: 'Altramuces' },
  { key: 'moluscos', label: 'Moluscos' },
];
const FOOD_GROUP_LABELS = { verduras: 'Verduras', legumbres: 'Legumbres', proteina: 'Proteína animal', cereales: 'Cereales', frutas: 'Frutas', lacteos: 'Lácteos', grasas: 'Grasas saludables' };
export const FOOD_GROUPS = Object.values(FOOD_GROUP_LABELS);
export const TEXTURES = Object.values(TEXTURE_LABELS);
const SEASON_LABELS = { invierno: 'Invierno', verano: 'Verano', ambas: 'Todo el año' };
export const SEASONS = ['invierno', 'verano']; // opciones seleccionables por el usuario
const CATEGORY_LABELS = { carne: 'Carne', pescado: 'Pescado', huevo: 'Huevo', legumbres: 'Legumbres', lacteos: 'Lácteos', vegetariano: 'Vegetariano' };
export const CATEGORIES = Object.values(CATEGORY_LABELS);

// El dataset real (150 recetas) vive en recipes.json, generado por scripts/generate-recipes.mjs.
// Cada receta puede aplicar a varios tipos de comida; aquí se "desdobla" una fila por cada
// mealType para que el resto de la app (que espera un único `meal` por receta) siga funcionando igual.
export const RECIPES = RAW_RECIPES.flatMap((r) => r.mealTypes.map((mealType) => ({
  id: r.mealTypes.length > 1 ? `${r.id}-${mealType}` : r.id,
  name: r.name,
  meal: MEAL_LABELS[mealType] || mealType,
  age: AGE_RANGES[r.minAgeIdx] || AGE_RANGES[0],
  ageIdx: r.minAgeIdx,
  time: `${r.time} min`,
  texture: TEXTURE_LABELS[r.texture] || r.texture,
  season: r.season || 'ambas',
  seasonLabel: SEASON_LABELS[r.season] || 'Todo el año',
  categories: (r.categories || []).map((c) => CATEGORY_LABELS[c] || c),
  allergens: (r.allergens || []).map((a) => ALLERGEN_LABELS[a] || a),
  foodGroups: (r.foodGroups || []).map((g) => FOOD_GROUP_LABELS[g] || g),
  ingredients: r.ingredients.map((i) => `${i.name} — ${i.quantity}`),
  steps: r.steps,
  tips: r.tips || [],
  utensils: r.utensils || [],
  videoUrl: r.videoUrl || null,
  videoTitle: r.videoTitle || null,
})));

export function recipesFor(meal) {
  return RECIPES.filter(r => r.meal === meal);
}

const RECIPES_BY_ID = new Map(RECIPES.map(r => [r.id, r]));
export function recipeById(id) {
  return RECIPES_BY_ID.get(id) || null;
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

const DAY_NAMES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MONTH_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

export function formatTodayLong(date = new Date()) {
  const dayName = DAY_NAMES[date.getDay()];
  const capitalized = dayName.charAt(0).toUpperCase() + dayName.slice(1);
  return `${capitalized}, ${date.getDate()} de ${MONTH_SHORT[date.getMonth()]}`;
}

export function formatUpdatedAt(isoString) {
  if (!isoString) return 'Sin datos de commit';
  const d = new Date(isoString);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `Actualizado el ${d.getDate()} ${MONTH_SHORT[d.getMonth()]} ${d.getFullYear()} · ${hh}:${mm}`;
}
