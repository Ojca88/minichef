import { useCallback, useState } from 'react';
import { usePersistedState } from './usePersistedState';
import { generateWeek, type Plan } from '../lib/planner';
import { RECIPES, getRecipe, keyOf, type MealKey } from '../data/recipes';

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
  day: number;
  meal: MealKey;
}

const DEFAULT_AGE_IDX = 1;

export function useAppState() {
  const [activeTab, setActiveTab] = useState<Tab>('inicio');
  const [ageIdx, setAgeIdxState] = usePersistedState<number>('ageIdx', DEFAULT_AGE_IDX);
  const [selectedDay, setSelectedDay] = usePersistedState<number>('selectedDay', 0);
  const [plan, setPlan] = usePersistedState<Plan>('plan', () => generateWeek(DEFAULT_AGE_IDX, {}));
  const [fixed, setFixed] = usePersistedState<Record<string, boolean>>('fixed', {});
  const [statuses, setStatuses] = usePersistedState<Record<string, Status | null>>('statuses', {});
  const [recFilters, setRecFiltersState] = usePersistedState<RecFilters>('recFilters', {
    ageIdx: DEFAULT_AGE_IDX, textura: 'todas', tiempo: 'todos', alergeno: 'todos',
  });
  const [trackingView, setTrackingView] = usePersistedState<'semana' | 'mes'>('trackingView', 'semana');
  const [shoppingChecked, setShoppingChecked] = usePersistedState<Record<string, boolean>>('shoppingChecked', {});

  const [fixPicker, setFixPicker] = useState<FixPicker>({ open: false, day: 0, meal: 'comida' });
  const [recipeDetailId, setRecipeDetailId] = useState<string | null>(null);
  const [quickOpen, setQuickOpen] = useState(false);
  const [quickRecipeId, setQuickRecipeId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const setAge = useCallback((idx: number) => {
    setAgeIdxState(idx);
    setPlan(generateWeek(idx, {}));
    setFixed({});
    setStatuses({});
  }, [setAgeIdxState, setPlan, setFixed, setStatuses]);

  const regenerateSlot = useCallback((day: number, meal: MealKey) => {
    setPlan((prevPlan) => {
      const key = keyOf(day, meal);
      const current = prevPlan[key];
      const pool = RECIPES.filter((r) => r.mealTypes.includes(meal) && r.minAgeIdx <= ageIdx);
      const usedElsewhere = new Set(Object.entries(prevPlan).filter(([k]) => k !== key).map(([, v]) => v));
      let candidates = pool.filter((r) => r.id !== current && !usedElsewhere.has(r.id));
      if (!candidates.length) candidates = pool.filter((r) => r.id !== current);
      if (!candidates.length) candidates = pool;
      const pick = candidates[Math.floor(Math.random() * candidates.length)];
      setFixed((f) => { const next = { ...f }; delete next[key]; return next; });
      setStatuses((s) => { const next = { ...s }; delete next[key]; return next; });
      return { ...prevPlan, [key]: pick.id };
    });
  }, [ageIdx, setPlan, setFixed, setStatuses]);

  const regenerateWeek = useCallback(() => {
    setPlan((prevPlan) => {
      const fixedSlots: Plan = {};
      Object.keys(fixed).forEach((k) => { if (fixed[k]) fixedSlots[k] = prevPlan[k]; });
      return generateWeek(ageIdx, fixedSlots);
    });
    setStatuses({});
  }, [ageIdx, fixed, setPlan, setStatuses]);

  const openFixPicker = useCallback((day: number, meal: MealKey) => setFixPicker({ open: true, day, meal }), []);
  const closeFixPicker = useCallback(() => setFixPicker({ open: false, day: 0, meal: 'comida' }), []);
  const chooseFixed = useCallback((recipeId: string) => {
    const { day, meal } = fixPicker;
    const key = keyOf(day, meal);
    setPlan((p) => ({ ...p, [key]: recipeId }));
    setFixed((f) => ({ ...f, [key]: true }));
    setFixPicker({ open: false, day: 0, meal: 'comida' });
  }, [fixPicker, setPlan, setFixed]);

  const setStatus = useCallback((day: number, meal: MealKey, status: Status) => {
    const key = keyOf(day, meal);
    setStatuses((s) => ({ ...s, [key]: s[key] === status ? null : status }));
  }, [setStatuses]);

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
    const r = getRecipe(id);
    if (!r) return;
    const utter = new SpeechSynthesisUtterance(`${r.name}. ${r.steps.join('. ')}`);
    utter.lang = 'es-ES';
    utter.onend = () => setSpeakingId((cur) => (cur === id ? null : cur));
    window.speechSynthesis.speak(utter);
    setSpeakingId(id);
  }, [recipeDetailId, speakingId]);

  const generateQuickSuggestion = useCallback(() => {
    const used = new Set(Object.values(plan));
    const pool = RECIPES.filter((r) => r.mealTypes.includes('comida') && r.minAgeIdx <= ageIdx);
    const avail = pool.filter((r) => !used.has(r.id));
    const list = avail.length ? avail : pool;
    const pick = list[Math.floor(Math.random() * list.length)];
    setQuickRecipeId(pick.id);
    setQuickOpen(true);
  }, [plan, ageIdx]);
  const closeQuick = useCallback(() => setQuickOpen(false), []);
  const viewQuickDetail = useCallback(() => {
    setQuickOpen(false);
    setRecipeDetailId(quickRecipeId);
  }, [quickRecipeId]);

  const toggleShoppingItem = useCallback((name: string) => {
    setShoppingChecked((s) => ({ ...s, [name]: !s[name] }));
  }, [setShoppingChecked]);

  const setRecFilter = useCallback(<K extends keyof RecFilters>(key: K, val: RecFilters[K]) => {
    setRecFiltersState((f) => ({ ...f, [key]: val }));
  }, [setRecFiltersState]);

  return {
    activeTab, setActiveTab,
    ageIdx, setAge,
    selectedDay, setSelectedDay,
    plan, fixed, statuses, setStatus,
    regenerateSlot, regenerateWeek,
    fixPicker, openFixPicker, closeFixPicker, chooseFixed,
    recipeDetailId, openRecipeDetail, closeRecipeDetail,
    speakingId, toggleSpeak,
    quickOpen, quickRecipeId, generateQuickSuggestion, closeQuick, viewQuickDetail,
    trackingView, setTrackingView,
    shoppingChecked, toggleShoppingItem,
    recFilters, setRecFilter,
  };
}

export type AppState = ReturnType<typeof useAppState>;
