import type { AppState } from '../hooks/useAppState';
import { TEXTURE_LABELS, getRecipe } from '../data/recipes';
import { CloseIcon } from './Icons';

interface QuickSuggestionModalProps {
  state: AppState;
}

export function QuickSuggestionModal({ state }: QuickSuggestionModalProps) {
  if (!state.quickOpen) return null;
  const recipe = getRecipe(state.quickRecipeId ?? undefined);
  if (!recipe) return null;

  return (
    <div className="dialog-backdrop">
      <div className="dialog">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="dialog-title">¿Qué le doy hoy?</span>
          <button type="button" className="btn btn-icon btn-ghost" onClick={state.closeQuick}>
            <CloseIcon />
          </button>
        </div>
        <p className="dialog-body" style={{ margin: 0, fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 18, color: 'var(--color-text)', opacity: 1 }}>
          {recipe.name}
        </p>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span className="tag tag-neutral">{TEXTURE_LABELS[recipe.texture]}</span>
          <span className="tag tag-outline">{recipe.time} min</span>
        </div>
        <div className="dialog-actions" style={{ marginTop: 2 }}>
          <button type="button" className="btn btn-secondary" onClick={state.generateQuickSuggestion}>Otra sugerencia</button>
          <button type="button" className="btn btn-primary" onClick={state.viewQuickDetail}>Ver receta</button>
        </div>
      </div>
    </div>
  );
}
