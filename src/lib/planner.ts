import { DAYS, MEALS, getRecipe, keyOf, type MealKey, type Recipe } from '../data/recipes';

export type Plan = Record<string, string>;
export type FixedSlots = Record<string, boolean>;

/** Generates a full week plan: no repeated recipe in the week, avoids repeating
 * a food group within the same meal slot on nearby days. Respects any fixed slots. */
export function generateWeek(recipes: Recipe[], ageIdx: number, fixedSlots: Plan = {}): Plan {
  const used = new Set(Object.values(fixedSlots));
  const recency: Record<MealKey, Record<string, number>> = { comida: {}, merienda: {}, cena: {} };
  const plan: Plan = {};

  Object.keys(fixedSlots).forEach((k) => {
    const meal = k.split('_')[1] as MealKey;
    const r = getRecipe(recipes, fixedSlots[k]);
    if (r) r.foodGroups.forEach((g) => { recency[meal][g] = -1; });
  });

  for (let day = 0; day < DAYS.length; day++) {
    MEALS.forEach((m) => {
      const key = keyOf(day, m.key);
      if (fixedSlots[key]) {
        plan[key] = fixedSlots[key];
        return;
      }
      const pool = recipes.filter((r) => r.mealTypes.includes(m.key) && r.minAgeIdx <= ageIdx);
      let candidates = pool.filter((r) => !used.has(r.id));
      if (!candidates.length) candidates = pool;

      const penaltyOf = (r: (typeof pool)[number]) =>
        r.foodGroups.reduce((sum, g) => {
          const last = recency[m.key][g];
          return sum + (last !== undefined && day - last <= 2 ? 1 : 0);
        }, 0);

      let bestPenalty = Infinity;
      candidates.forEach((r) => { bestPenalty = Math.min(bestPenalty, penaltyOf(r)); });
      const best = candidates.filter((r) => penaltyOf(r) === bestPenalty);

      const pick = best[Math.floor(Math.random() * best.length)];
      plan[key] = pick.id;
      used.add(pick.id);
      pick.foodGroups.forEach((g) => { recency[m.key][g] = day; });
    });
  }
  return plan;
}
