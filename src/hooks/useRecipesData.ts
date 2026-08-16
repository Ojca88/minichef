import { useCallback, useEffect, useState } from 'react';
import type { Recipe } from '../data/recipes';

/** Loads the recipe catalog from public/recipes.json at runtime (not bundled
 * into the app's JS), so the dish list is data the app fetches, not code it ships. */
export function useRecipesData() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch('/recipes.json')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<Recipe[]>;
      })
      .then((data) => {
        if (!cancelled) { setRecipes(data); setLoading(false); }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error desconocido');
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [attempt]);

  const reload = useCallback(() => setAttempt((a) => a + 1), []);

  return { recipes, loading, error, reload };
}
