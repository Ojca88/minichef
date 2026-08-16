import type { AppState } from '../hooks/useAppState';
import { RECIPES } from '../data/recipes';
import { CloseIcon } from './Icons';

interface FixPickerModalProps {
  state: AppState;
}

export function FixPickerModal({ state }: FixPickerModalProps) {
  if (!state.fixPicker.open) return null;

  const candidates = RECIPES.filter(
    (r) => r.mealTypes.includes(state.fixPicker.meal) && r.minAgeIdx <= state.ageIdx,
  );

  return (
    <div className="dialog-backdrop">
      <div className="dialog" style={{ maxHeight: '80%', overflow: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="dialog-title">Elige una receta</span>
          <button type="button" className="btn btn-icon btn-ghost" onClick={state.closeFixPicker}>
            <CloseIcon />
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {candidates.map((r) => (
            <button key={r.id} type="button" className="btn btn-secondary btn-block" onClick={() => state.chooseFixed(r.id)}>
              {r.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
