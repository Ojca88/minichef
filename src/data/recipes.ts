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

export interface Recipe {
  id: string;
  name: string;
  mealTypes: MealKey[];
  minAgeIdx: number;
  allergens: Allergen[];
  time: number;
  texture: Texture;
  foodGroups: FoodGroup[];
  ingredients: string[];
  steps: string[];
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

export const RECIPES: Recipe[] = [
  { id: 'r1', name: 'Puré de calabaza y patata', mealTypes: ['comida'], minAgeIdx: 0, allergens: [], time: 20, texture: 'pure', foodGroups: ['verduras'], ingredients: ['Calabaza', 'Patata', 'Aceite de oliva virgen extra'], steps: ['Pelar y cortar la calabaza y la patata en trozos.', 'Cocer 15 minutos en agua sin sal.', 'Triturar con un chorrito de aceite hasta obtener una crema fina.'] },
  { id: 'r2', name: 'Lentejas con verduras', mealTypes: ['comida'], minAgeIdx: 1, allergens: [], time: 35, texture: 'pure', foodGroups: ['legumbres', 'verduras'], ingredients: ['Lentejas', 'Zanahoria', 'Puerro', 'Patata', 'Aceite de oliva virgen extra'], steps: ['Lavar las lentejas y las verduras.', 'Cocer todo junto 30 minutos en agua.', 'Triturar o chafar según la textura que tolere el bebé.'] },
  { id: 'r3', name: 'Crema de calabacín y pollo', mealTypes: ['comida'], minAgeIdx: 0, allergens: [], time: 25, texture: 'pure', foodGroups: ['verduras', 'proteina'], ingredients: ['Calabacín', 'Pechuga de pollo', 'Aceite de oliva virgen extra'], steps: ['Cocer el calabacín y el pollo troceados 20 minutos.', 'Escurrir y triturar con un poco del caldo de cocción.', 'Añadir un chorrito de aceite antes de servir.'] },
  { id: 'r4', name: 'Arroz con verduras y pollo', mealTypes: ['comida'], minAgeIdx: 2, allergens: [], time: 30, texture: 'trocitos', foodGroups: ['cereales', 'verduras', 'proteina'], ingredients: ['Arroz', 'Zanahoria', 'Guisantes', 'Pechuga de pollo'], steps: ['Cocer el arroz según el tiempo del paquete.', 'Saltear el pollo y las verduras troceadas finas.', 'Mezclar todo y servir en trocitos pequeños.'] },
  { id: 'r5', name: 'Puré de garbanzos y zanahoria', mealTypes: ['comida'], minAgeIdx: 1, allergens: [], time: 35, texture: 'pure', foodGroups: ['legumbres', 'verduras'], ingredients: ['Garbanzos cocidos', 'Zanahoria', 'Aceite de oliva virgen extra'], steps: ['Cocer la zanahoria hasta que esté blanda.', 'Añadir los garbanzos ya cocidos y calentar juntos.', 'Triturar con aceite hasta lograr una crema suave.'] },
  { id: 'r6', name: 'Merluza con puré de patata y brócoli', mealTypes: ['comida'], minAgeIdx: 1, allergens: ['pescado'], time: 25, texture: 'pure', foodGroups: ['proteina', 'verduras'], ingredients: ['Merluza', 'Patata', 'Brócoli', 'Aceite de oliva virgen extra'], steps: ['Cocer al vapor la merluza retirando bien las espinas.', 'Cocer la patata y el brócoli.', 'Triturar todo junto con un poco de aceite.'] },
  { id: 'r7', name: 'Ternera guisada con verduras', mealTypes: ['comida'], minAgeIdx: 2, allergens: [], time: 40, texture: 'trocitos', foodGroups: ['proteina', 'verduras'], ingredients: ['Ternera', 'Zanahoria', 'Tomate', 'Patata'], steps: ['Sofreír la ternera troceada muy fina.', 'Añadir las verduras y cubrir con agua.', 'Cocer a fuego lento 30 minutos hasta que esté tierna.'] },
  { id: 'r8', name: 'Tortilla de calabacín', mealTypes: ['comida'], minAgeIdx: 2, allergens: ['huevo'], time: 15, texture: 'finger', foodGroups: ['proteina', 'verduras'], ingredients: ['Huevo', 'Calabacín', 'Aceite de oliva virgen extra'], steps: ['Rallar el calabacín y mezclar con el huevo batido.', 'Cuajar en una sartén a fuego suave por ambos lados.', 'Cortar en tiras blandas para que el bebé la sujete.'] },
  { id: 'r9', name: 'Puré de lentejas rojas con calabaza', mealTypes: ['comida'], minAgeIdx: 0, allergens: [], time: 25, texture: 'pure', foodGroups: ['legumbres', 'verduras'], ingredients: ['Lentejas rojas', 'Calabaza', 'Aceite de oliva virgen extra'], steps: ['Cocer la calabaza y las lentejas rojas juntas 20 minutos.', 'Comprobar que las lentejas están bien tiernas.', 'Triturar con un poco de aceite hasta que quede cremoso.'] },
  { id: 'r10', name: 'Plátano chafado con copos de avena', mealTypes: ['merienda'], minAgeIdx: 0, allergens: [], time: 5, texture: 'pure', foodGroups: ['frutas', 'cereales'], ingredients: ['Plátano', 'Copos de avena finos'], steps: ['Chafar el plátano maduro con un tenedor.', 'Mezclar con los copos de avena hasta integrar.', 'Dejar reposar un par de minutos antes de servir.'] },
  { id: 'r11', name: 'Yogur natural con fruta', mealTypes: ['merienda'], minAgeIdx: 1, allergens: ['lacteos'], time: 5, texture: 'trocitos', foodGroups: ['lacteos', 'frutas'], ingredients: ['Yogur natural sin azúcar', 'Pera o manzana'], steps: ['Cortar la fruta en trozos muy pequeños y blandos.', 'Mezclar con el yogur natural.', 'Servir a temperatura ambiente.'] },
  { id: 'r12', name: 'Tortitas de avena y plátano', mealTypes: ['merienda'], minAgeIdx: 2, allergens: ['huevo'], time: 15, texture: 'finger', foodGroups: ['cereales', 'frutas'], ingredients: ['Avena', 'Plátano', 'Huevo'], steps: ['Triturar la avena con el plátano y el huevo.', 'Cocinar pequeñas tortitas en sartén antiadherente sin aceite.', 'Dejar enfriar y cortar en tiras.'] },
  { id: 'r13', name: 'Puré de manzana y pera', mealTypes: ['merienda'], minAgeIdx: 0, allergens: [], time: 15, texture: 'pure', foodGroups: ['frutas'], ingredients: ['Manzana', 'Pera'], steps: ['Pelar y cortar la fruta en trozos.', 'Cocer al vapor 10 minutos hasta que esté blanda.', 'Triturar hasta conseguir una compota fina.'] },
  { id: 'r14', name: 'Palitos de pan con aguacate', mealTypes: ['merienda'], minAgeIdx: 2, allergens: ['gluten'], time: 5, texture: 'finger', foodGroups: ['cereales', 'grasas'], ingredients: ['Pan tierno', 'Aguacate'], steps: ['Cortar el pan en palitos blandos.', 'Machacar el aguacate hasta obtener una crema.', 'Untar los palitos y servir.'] },
  { id: 'r15', name: 'Compota de melocotón', mealTypes: ['merienda'], minAgeIdx: 0, allergens: [], time: 15, texture: 'pure', foodGroups: ['frutas'], ingredients: ['Melocotón'], steps: ['Pelar y cortar el melocotón en trozos.', 'Cocer 10 minutos con un poco de agua.', 'Triturar hasta obtener una compota suave.'] },
  { id: 'r16', name: 'Crema de puerro y patata', mealTypes: ['cena'], minAgeIdx: 0, allergens: [], time: 25, texture: 'pure', foodGroups: ['verduras'], ingredients: ['Puerro', 'Patata', 'Aceite de oliva virgen extra'], steps: ['Cocer el puerro y la patata troceados 20 minutos.', 'Triturar con un poco del caldo de cocción.', 'Añadir un chorrito de aceite antes de servir.'] },
  { id: 'r17', name: 'Puré de brócoli y pescado blanco', mealTypes: ['cena'], minAgeIdx: 1, allergens: ['pescado'], time: 20, texture: 'pure', foodGroups: ['verduras', 'proteina'], ingredients: ['Brócoli', 'Pescado blanco', 'Aceite de oliva virgen extra'], steps: ['Cocer al vapor el brócoli y el pescado sin espinas.', 'Triturar ambos juntos hasta lograr una crema.', 'Añadir un poco de aceite antes de servir.'] },
  { id: 'r18', name: 'Sopa de fideos con verduras', mealTypes: ['cena'], minAgeIdx: 2, allergens: ['gluten'], time: 20, texture: 'trocitos', foodGroups: ['cereales', 'verduras'], ingredients: ['Fideos finos', 'Zanahoria', 'Calabacín'], steps: ['Cocer las verduras troceadas muy pequeñas en agua o caldo.', 'Añadir los fideos los últimos 5 minutos.', 'Servir templado comprobando que no queme.'] },
  { id: 'r19', name: 'Tortilla francesa con calabacín', mealTypes: ['cena'], minAgeIdx: 2, allergens: ['huevo'], time: 10, texture: 'finger', foodGroups: ['proteina', 'verduras'], ingredients: ['Huevo', 'Calabacín'], steps: ['Rallar el calabacín y escurrir bien el agua.', 'Mezclar con el huevo batido.', 'Cuajar en sartén a fuego suave y cortar en tiras.'] },
  { id: 'r20', name: 'Puré de boniato y guisantes', mealTypes: ['cena'], minAgeIdx: 0, allergens: [], time: 25, texture: 'pure', foodGroups: ['verduras', 'legumbres'], ingredients: ['Boniato', 'Guisantes', 'Aceite de oliva virgen extra'], steps: ['Cocer el boniato y los guisantes 20 minutos.', 'Triturar juntos hasta conseguir una crema homogénea.', 'Añadir un chorrito de aceite antes de servir.'] },
  { id: 'r21', name: 'Pollo desmenuzado con puré de zanahoria', mealTypes: ['cena'], minAgeIdx: 1, allergens: [], time: 30, texture: 'trocitos', foodGroups: ['proteina', 'verduras'], ingredients: ['Pechuga de pollo', 'Zanahoria', 'Aceite de oliva virgen extra'], steps: ['Cocer la pechuga de pollo hasta que esté muy tierna.', 'Desmenuzar en hilos finos con las manos.', 'Servir junto a un puré suave de zanahoria.'] },
];

const INGREDIENT_CATEGORY: Record<string, string> = {
  calabaza: 'Verduras y frutas', patata: 'Verduras y frutas', calabacín: 'Verduras y frutas', zanahoria: 'Verduras y frutas',
  puerro: 'Verduras y frutas', brócoli: 'Verduras y frutas', boniato: 'Verduras y frutas', guisantes: 'Verduras y frutas',
  plátano: 'Verduras y frutas', manzana: 'Verduras y frutas', pera: 'Verduras y frutas', melocotón: 'Verduras y frutas',
  aguacate: 'Verduras y frutas', tomate: 'Verduras y frutas',
  lentejas: 'Legumbres y cereales', garbanzos: 'Legumbres y cereales', arroz: 'Legumbres y cereales', avena: 'Legumbres y cereales',
  pan: 'Legumbres y cereales', fideos: 'Legumbres y cereales',
  pollo: 'Carne, pescado y huevo', ternera: 'Carne, pescado y huevo', merluza: 'Carne, pescado y huevo', pescado: 'Carne, pescado y huevo', huevo: 'Carne, pescado y huevo',
  yogur: 'Lácteos', aceite: 'Otros',
};

export function categoryFor(name: string): string {
  const n = name.toLowerCase();
  for (const key in INGREDIENT_CATEGORY) {
    if (n.includes(key)) return INGREDIENT_CATEGORY[key];
  }
  return 'Otros';
}

export function getRecipe(id: string | null | undefined): Recipe | undefined {
  return RECIPES.find((r) => r.id === id);
}

export function keyOf(day: number, meal: MealKey): string {
  return `${day}_${meal}`;
}
