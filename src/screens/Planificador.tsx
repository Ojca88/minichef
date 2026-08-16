import type { AppState } from '../hooks/useAppState';
import { AGE_GROUPS, DAYS, MEALS, TEXTURE_LABELS, getRecipe, keyOf } from '../data/recipes';
import { ChipGroup } from '../components/ChipGroup';
import { PinIcon, RefreshIcon, CheckIcon, ThumbUpIcon } from '../components/Icons';

interface PlanificadorProps {
  state: AppState;
  onGoCompra: () => void;
}

export function Planificador({ state, onGoCompra }: PlanificadorProps) {
  const ageOptions = AGE_GROUPS.map((g) => ({
    label: g.label,
    checked: g.idx === state.ageIdx,
    onSelect: () => state.setAge(g.idx),
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <h4 style={{ margin: 0 }}>Planificador semanal</h4>
        <button type="button" className="btn btn-secondary" style={{ fontSize: 11, padding: '5px 10px' }} onClick={state.regenerateWeek}>
          Nueva semana
        </button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <ChipGroup name="age-plan" options={ageOptions} />
      </div>

      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
        {DAYS.map((d) => (
          <button
            key={d.key}
            type="button"
            className={`day-chip ${d.key === state.selectedDay ? 'active' : ''}`}
            onClick={() => state.setSelectedDay(d.key)}
          >
            {d.short}
          </button>
        ))}
      </div>

      <button type="button" className="btn btn-primary btn-block" style={{ justifyContent: 'center' }} onClick={onGoCompra}>
        Lista de la compra
      </button>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {MEALS.map((m) => {
          const key = keyOf(state.selectedDay, m.key);
          const recipe = getRecipe(state.plan[key]);
          const status = state.statuses[key];
          const isFixed = !!state.fixed[key];
          return (
            <div className="card elev-sm" style={{ gap: 8 }} key={m.key}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                <div>
                  <span className="card-kicker">{m.label}</span>
                  <button
                    type="button"
                    className="card-title"
                    style={{ display: 'block', background: 'none', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer', color: 'var(--color-text)' }}
                    onClick={() => recipe && state.openRecipeDetail(recipe.id)}
                  >
                    {recipe ? recipe.name : '—'}
                  </button>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button type="button" className="btn btn-icon btn-secondary" title="Fijar receta" onClick={() => state.openFixPicker(state.selectedDay, m.key)}>
                    <PinIcon />
                  </button>
                  <button type="button" className="btn btn-icon btn-secondary" title="Regenerar" onClick={() => state.regenerateSlot(state.selectedDay, m.key)}>
                    <RefreshIcon />
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span className="tag tag-neutral">{recipe ? TEXTURE_LABELS[recipe.texture] : ''}</span>
                <span className="tag tag-outline">{recipe ? recipe.time : 0} min</span>
                {isFixed && <span className="tag tag-accent">Fijada</span>}
              </div>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center', paddingTop: 2 }}>
                <span style={{ fontSize: 11, opacity: 0.6, marginRight: 2 }}>Marcar:</span>
                <button
                  type="button"
                  className={`status-btn ${status === 'probada' ? 'active' : ''}`}
                  title="Probada"
                  onClick={() => state.setStatus(state.selectedDay, m.key, 'probada')}
                >
                  <CheckIcon />
                </button>
                <button
                  type="button"
                  className={`status-btn ${status === 'gusto' ? 'active' : ''}`}
                  title="Le gustó"
                  onClick={() => state.setStatus(state.selectedDay, m.key, 'gusto')}
                >
                  <ThumbUpIcon />
                </button>
                <button
                  type="button"
                  className={`status-btn ${status === 'no_gusto' ? 'active' : ''}`}
                  title="No le gustó"
                  onClick={() => state.setStatus(state.selectedDay, m.key, 'no_gusto')}
                >
                  <ThumbUpIcon flipped />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
