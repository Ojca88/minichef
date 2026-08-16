import type { AppState } from '../hooks/useAppState';
import { AGE_GROUPS, ALLERGEN_LABELS, TEXTURE_LABELS, getRecipe } from '../data/recipes';
import { CloseIcon, SpeakerIcon } from './Icons';

interface RecipeDetailModalProps {
  state: AppState;
}

export function RecipeDetailModal({ state }: RecipeDetailModalProps) {
  const recipe = getRecipe(state.recipeDetailId ?? undefined);
  if (!recipe) return null;

  const allergensText = recipe.allergens.length
    ? `Contiene: ${recipe.allergens.map((a) => ALLERGEN_LABELS[a]).join(', ')}`
    : 'Sin alérgenos';
  const speaking = state.speakingId === recipe.id;

  return (
    <div className="dialog-backdrop">
      <div className="dialog" style={{ maxHeight: '82%', overflow: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <span className="dialog-title">{recipe.name}</span>
          <button type="button" className="btn btn-icon btn-ghost" onClick={state.closeRecipeDetail}>
            <CloseIcon />
          </button>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span className="tag tag-neutral">{TEXTURE_LABELS[recipe.texture]}</span>
          <span className="tag tag-outline">{recipe.time} min</span>
          <span className="tag tag-accent">Desde {AGE_GROUPS[recipe.minAgeIdx].label}</span>
        </div>
        <p className="dialog-body" style={{ margin: 0 }}>{allergensText}</p>
        <button type="button" className="btn btn-secondary btn-block" onClick={state.toggleSpeak}>
          <SpeakerIcon />
          {speaking ? 'Detener' : 'Escuchar receta'}
        </button>
        <div>
          <h5 style={{ margin: '0 0 6px' }}>Ingredientes</h5>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13 }}>
            {recipe.ingredients.map((ing) => <li key={ing}>{ing}</li>)}
          </ul>
        </div>
        <div>
          <h5 style={{ margin: '0 0 6px' }}>Pasos</h5>
          <ol style={{ margin: 0, paddingLeft: 18, fontSize: 13 }}>
            {recipe.steps.map((st, i) => <li style={{ marginBottom: 4 }} key={i}>{st}</li>)}
          </ol>
        </div>
      </div>
    </div>
  );
}
