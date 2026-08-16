import { useCallback, useState } from 'react';
import { usePersistedState } from './usePersistedState';
import { generateWeek, type Plan } from '../lib/planner';
import { getRecipe, keyOf, type MealKey, type Recipe } from '../data/recipes';

export type Tab = 'inicio' | 'plan' | 'recetario' | 'seguimiento' | 'compra';
export type Status = 'probada' | 'gusto' | 'no_gusto';
export type Textura = 'todas' | 'pure' | 'trocitos' | 'finger';
export type Tiempo = 'todos' | '15' | '30';
export type AlergenoFilter = 'todos' | 'ninguno' | 'gluten' | 'lacteos' | 'huevo' | 'pescado';

export interface RecFilters {
  ageIdx: number;
  textura: Textura;
  tiempo: Tiempo;
  alergeno: AlergenoFilter;
}

export interface FixPicker {
  open: boolean;
  week: number;
  day: number;
  meal: MealKey;
}

export interface CustomShoppingItem {
  id: string;
  name: string;
}

export interface WeekState {
  plan: Plan;
  fixed: Record<string, boolean>;
  statuses: Record<string, Status | null>;
}

const DEFAULT_AGE_IDX = 1;
const WEEK_COUNT = 4;

function freshWeek(recipes: Recipe[], ageIdx: number): WeekState {
  return { plan: generateWeek(recipes, ageIdx, {}), fixed: {}, statuses: {} };
}

/** Builds the initial 4-week plan, migrating a pre-4-week single plan saved by
 * an earlier version of the app into week 1 so existing users don't lose it. */
function initialWeeks(recipes: Recipe[], ageIdx: number): WeekState[] {
  try {
    const oldPlanRaw = localStorage.getItem('baby-food-app:plan');
    if (oldPlanRaw) {
      const first: WeekState = {
        plan: JSON.parse(oldPlanRaw),
        fixed: JSON.parse(localStorage.getItem('baby-food-app:fixed') || '{}'),
        statuses: JSON.parse(localStorage.getItem('baby-food-app:statuses') || '{}'),
      };
      return [first, ...Array.from({ length: WEEK_COUNT - 1 }, () => freshWeek(recipes, ageIdx))];
    }
  } catch {
    // fall through to a fresh plan
  }
  return Array.from({ length: WEEK_COUNT }, () => freshWeek(recipes, ageIdx));
}

export function useAppState(recipes: Recipe[]) {
  const [activeTab, setActiveTab] = useState<Tab>('inicio');
  const [ageIdx, setAgeIdxState] = usePersistedState<number>('ageIdx', DEFAULT_AGE_IDX);
  const [selectedDay, setSelectedDay] = usePersistedState<number>('selectedDay', 0);
  const [selectedWeek, setSelectedWeek] = usePersistedState<number>('selectedWeek', 0);
  const [weeks, setWeeks] = usePersistedState<WeekState[]>('weeks', () => initialWeeks(recipes, DEFAULT_AGE_IDX));
  const [recFilters, setRecFiltersState] = usePersistedState<RecFilters>('recFilters', {
    ageIdx: DEFAULT_AGE_IDX, textura: 'todas', tiempo: 'todos', alergeno: 'todos',
  });
  const [trackingView, setTrackingView] = usePersistedState<'semana' | 'mes'>('trackingView', 'semana');
  const [shoppingChecked, setShoppingChecked] = usePersistedState<Record<string, boolean>>('shoppingChecked', {});
  const [customItems, setCustomItems] = usePersistedState<CustomShoppingItem[]>('customShoppingItems', []);

  const [fixPicker, setFixPicker] = useState<FixPicker>({ open: false, week: 0, day: 0, meal: 'comida' });
  const [recipeDetailId, setRecipeDetailId] = useState<string | null>(null);
  const [quickOpen, setQuickOpen] = useState(false);
  const [quickRecipeId, setQuickRecipeId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const currentWeek = weeks[selectedWeek] ?? weeks[0];
  const { plan, fixed, statuses } = currentWeek;

  const updateWeek = useCallback((idx: number, updater: (w: WeekState) => WeekState) => {
    setWeeks((ws) => ws.map((w, i) => (i === idx ? updater(w) : w)));
  }, [setWeeks]);

  const setAge = useCallback((idx: number) => {
    setAgeIdxState(idx);
    setWeeks(Array.from({ length: WEEK_COUNT }, () => freshWeek(recipes, idx)));
  }, [recipes, setAgeIdxState, setWeeks]);

  const regenerateSlot = useCallback((day: number, meal: MealKey) => {
    updateWeek(selectedWeek, (w) => {
      const key = keyOf(day, meal);
      const current = w.plan[key];
      const pool = recipes.filter((r) => r.mealTypes.includes(meal) && r.minAgeIdx <= ageIdx);
      const usedElsewhere = new Set(Object.entries(w.plan).filter(([k]) => k !== key).map(([, v]) => v));
      let candidates = pool.filter((r) => r.id !== current && !usedElsewhere.has(r.id));
      if (!candidates.length) candidates = pool.filter((r) => r.id !== current);
      if (!candidates.length) candidates = pool;
      const pick = candidates[Math.floor(Math.random() * candidates.length)];
      const nextFixed = { ...w.fixed }; delete nextFixed[key];
      const nextStatuses = { ...w.statuses }; delete nextStatuses[key];
      return { plan: { ...w.plan, [key]: pick.id }, fixed: nextFixed, statuses: nextStatuses };
    });
  }, [ageIdx, recipes, selectedWeek, updateWeek]);

  const regenerateWeek = useCallback(() => {
    updateWeek(selectedWeek, (w) => {
      const fixedSlots: Plan = {};
      Object.keys(w.fixed).forEach((k) => { if (w.fixed[k]) fixedSlots[k] = w.plan[k]; });
      return { plan: generateWeek(recipes, ageIdx, fixedSlots), fixed: w.fixed, statuses: {} };
    });
  }, [ageIdx, recipes, selectedWeek, updateWeek]);

  const openFixPicker = useCallback((day: number, meal: MealKey) => setFixPicker({ open: true, week: selectedWeek, day, meal }), [selectedWeek]);
  const closeFixPicker = useCallback(() => setFixPicker({ open: false, week: 0, day: 0, meal: 'comida' }), []);
  const chooseFixed = useCallback((recipeId: string) => {
    const { week, day, meal } = fixPicker;
    const key = keyOf(day, meal);
    updateWeek(week, (w) => ({ ...w, plan: { ...w.plan, [key]: recipeId }, fixed: { ...w.fixed, [key]: true } }));
    setFixPicker({ open: false, week: 0, day: 0, meal: 'comida' });
  }, [fixPicker, updateWeek]);

  const setStatus = useCallback((day: number, meal: MealKey, status: Status) => {
    const key = keyOf(day, meal);
    updateWeek(selectedWeek, (w) => ({ ...w, statuses: { ...w.statuses, [key]: w.statuses[key] === status ? null : status } }));
  }, [selectedWeek, updateWeek]);

  const openRecipeDetail = useCallback((id: string) => setRecipeDetailId(id), []);
  const closeRecipeDetail = useCallback(() => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setRecipeDetailId(null);
    setSpeakingId(null);
  }, []);

  const toggleSpeak = useCallback(() => {
    const id = recipeDetailId;
    if (!id || !window.speechSynthesis) return;
    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const r = getRecipe(recipes, id);
    if (!r) return;
    const ingredientsText = r.ingredients.map((ing) => `${ing.quantity} de ${ing.name}`).join(', ');
    const stepsText = r.steps.map((st, i) => `Paso ${i + 1}: ${st}`).join(' ');
    const tipsText = r.tips.length ? ` Consejos: ${r.tips.join(' ')}` : '';
    const utter = new SpeechSynthesisUtterance(
      `${r.name}. Ingredientes: ${ingredientsText}. ${stepsText}.${tipsText}`,
    );
    utter.lang = 'es-ES';
    utter.onend = () => setSpeakingId((cur) => (cur === id ? null : cur));
    window.speechSynthesis.speak(utter);
    setSpeakingId(id);
  }, [recipeDetailId, recipes, speakingId]);

  const generateQuickSuggestion = useCallback(() => {
    const used = new Set(Object.values(plan));
    const pool = recipes.filter((r) => r.mealTypes.includes('comida') && r.minAgeIdx <= ageIdx);
    const avail = pool.filter((r) => !used.has(r.id));
    const list = avail.length ? avail : pool;
    const pick = list[Math.floor(Math.random() * list.length)];
    setQuickRecipeId(pick.id);
    setQuickOpen(true);
  }, [plan, ageIdx, recipes]);
  const closeQuick = useCallback(() => setQuickOpen(false), []);
  const viewQuickDetail = useCallback(() => {
    setQuickOpen(false);
    setRecipeDetailId(quickRecipeId);
  }, [quickRecipeId]);

  const toggleShoppingItem = useCallback((key: string) => {
    setShoppingChecked((s) => ({ ...s, [key]: !s[key] }));
  }, [setShoppingChecked]);

  const addCustomItem = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setCustomItems((items) => [...items, { id, name: trimmed }]);
  }, [setCustomItems]);

  const removeCustomItem = useCallback((id: string) => {
    setCustomItems((items) => items.filter((it) => it.id !== id));
    setShoppingChecked((s) => { const next = { ...s }; delete next[`custom:${id}`]; return next; });
  }, [setCustomItems, setShoppingChecked]);

  const setRecFilter = useCallback(<K extends keyof RecFilters>(key: K, val: RecFilters[K]) => {
    setRecFiltersState((f) => ({ ...f, [key]: val }));
  }, [setRecFiltersState]);

  return {
    recipes,
    activeTab, setActiveTab,
    ageIdx, setAge,
    selectedDay, setSelectedDay,
    selectedWeek, setSelectedWeek, weekCount: WEEK_COUNT,
    weeks,
    plan, fixed, statuses, setStatus,
    regenerateSlot, regenerateWeek,
    fixPicker, openFixPicker, closeFixPicker, chooseFixed,
    recipeDetailId, openRecipeDetail, closeRecipeDetail,
    speakingId, toggleSpeak,
    quickOpen, quickRecipeId, generateQuickSuggestion, closeQuick, viewQuickDetail,
    trackingView, setTrackingView,
    shoppingChecked, toggleShoppingItem,
    customItems, addCustomItem, removeCustomItem,
    recFilters, setRecFilter,
  };
}

export type AppState = ReturnType<typeof useAppState>;
