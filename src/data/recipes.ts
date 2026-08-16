export type MealKey = 'comida' | 'merienda' | 'cena';
export type Texture = 'pure' | 'trocitos' | 'finger';
export type Allergen = 'gluten' | 'lacteos' | 'huevo' | 'pescado';
export type FoodGroup = 'verduras' | 'frutas' | 'cereales' | 'legumbres' | 'proteina' | 'lacteos' | 'grasas';

export interface Day {
  key: number;
  short: string;
  full: string;
}

export interface Meal {
  key: MealKey;
  label: string;
}

export interface AgeGroup {
  idx: number;
  label: string;
}

export interface FoodGroupInfo {
  key: FoodGroup;
  label: string;
}

export interface RecipeIngredient {
  name: string;
  quantity: string;
}

export interface Recipe {
  id: string;
  name: string;
  mealTypes: MealKey[];
  minAgeIdx: number;
  allergens: Allergen[];
  time: number;
  texture: Texture;
  foodGroups: FoodGroup[];
  ingredients: RecipeIngredient[];
  utensils: string[];
  steps: string[];
  tips: string[];
  videoUrl?: string;
  videoTitle?: string;
}

export const DAYS: Day[] = [
  { key: 0, short: 'Lun', full: 'Lunes' },
  { key: 1, short: 'Mar', full: 'Martes' },
  { key: 2, short: 'Mié', full: 'Miércoles' },
  { key: 3, short: 'Jue', full: 'Jueves' },
  { key: 4, short: 'Vie', full: 'Viernes' },
  { key: 5, short: 'Sáb', full: 'Sábado' },
  { key: 6, short: 'Dom', full: 'Domingo' },
];

export const MEALS: Meal[] = [
  { key: 'comida', label: 'Comida' },
  { key: 'merienda', label: 'Merienda' },
  { key: 'cena', label: 'Cena' },
];

export const AGE_GROUPS: AgeGroup[] = [
  { idx: 0, label: '12-18m' },
  { idx: 1, label: '18-24m' },
  { idx: 2, label: '2-3a' },
  { idx: 3, label: '3-4a' },
];

export const FOOD_GROUPS_LIST: FoodGroupInfo[] = [
  { key: 'verduras', label: 'Verduras' },
  { key: 'frutas', label: 'Frutas' },
  { key: 'cereales', label: 'Cereales' },
  { key: 'legumbres', label: 'Legumbres' },
  { key: 'proteina', label: 'Proteína' },
  { key: 'lacteos', label: 'Lácteos' },
  { key: 'grasas', label: 'Grasas saludables' },
];

export const TEXTURE_LABELS: Record<Texture, string> = {
  pure: 'Puré',
  trocitos: 'Trocitos',
  finger: 'Finger food',
};

export const ALLERGEN_LABELS: Record<Allergen, string> = {
  gluten: 'Gluten',
  lacteos: 'Lácteos',
  huevo: 'Huevo',
  pescado: 'Pescado',
};

export const MEAL_LABEL: Record<MealKey, string> = {
  comida: 'Comida',
  merienda: 'Merienda',
  cena: 'Cena',
};

const INGREDIENT_CATEGORY: Record<string, string> = {
  calabaza: 'Verduras y frutas', patata: 'Verduras y frutas', calabacín: 'Verduras y frutas', zanahoria: 'Verduras y frutas',
  puerro: 'Verduras y frutas', brócoli: 'Verduras y frutas', boniato: 'Verduras y frutas', guisantes: 'Verduras y frutas',
  plátano: 'Verduras y frutas', manzana: 'Verduras y frutas', pera: 'Verduras y frutas', melocotón: 'Verduras y frutas',
  aguacate: 'Verduras y frutas', tomate: 'Verduras y frutas', chirivía: 'Verduras y frutas', coliflor: 'Verduras y frutas',
  'judía verde': 'Verduras y frutas', espinaca: 'Verduras y frutas', remolacha: 'Verduras y frutas', pimiento: 'Verduras y frutas',
  mango: 'Verduras y frutas', papaya: 'Verduras y frutas', kiwi: 'Verduras y frutas', arándano: 'Verduras y frutas',
  fresa: 'Verduras y frutas', sandía: 'Verduras y frutas', ciruela: 'Verduras y frutas', albaricoque: 'Verduras y frutas',
  lentejas: 'Legumbres y cereales', garbanzos: 'Legumbres y cereales', arroz: 'Legumbres y cereales', avena: 'Legumbres y cereales',
  pan: 'Legumbres y cereales', fideos: 'Legumbres y cereales', 'judías blancas': 'Legumbres y cereales',
  quinoa: 'Legumbres y cereales', cuscús: 'Legumbres y cereales',
  pollo: 'Carne, pescado y huevo', pavo: 'Carne, pescado y huevo', ternera: 'Carne, pescado y huevo', merluza: 'Carne, pescado y huevo',
  pescado: 'Carne, pescado y huevo', salmón: 'Carne, pescado y huevo', huevo: 'Carne, pescado y huevo',
  yogur: 'Lácteos', queso: 'Lácteos', aceite: 'Otros',
};

export function categoryFor(name: string): string {
  const n = name.toLowerCase();
  for (const key in INGREDIENT_CATEGORY) {
    if (n.includes(key)) return INGREDIENT_CATEGORY[key];
  }
  return 'Otros';
}

export function getRecipe(recipes: Recipe[], id: string | null | undefined): Recipe | undefined {
  return recipes.find((r) => r.id === id);
}

export function keyOf(day: number, meal: MealKey): string {
  return `${day}_${meal}`;
}
