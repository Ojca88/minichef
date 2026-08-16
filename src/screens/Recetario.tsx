import type { AppState, AlergenoFilter, Tiempo, Textura } from '../hooks/useAppState';
import { AGE_GROUPS, MEAL_LABEL, TEXTURE_LABELS, ALLERGEN_LABELS } from '../data/recipes';
import { ChipGroup } from '../components/ChipGroup';

interface RecetarioProps {
  state: AppState;
}

const TEXTURA_VALS: [Textura, string][] = [
  ['todas', 'Todas'], ['pure', 'Puré'], ['trocitos', 'Trocitos'], ['finger', 'Finger food'],
];
const TIEMPO_VALS: [Tiempo, string][] = [
  ['todos', 'Todos'], ['15', '≤15 min'], ['30', '≤30 min'],
];
const ALERGENO_VALS: [AlergenoFilter, string][] = [
  ['todos', 'Todos'], ['ninguno', 'Sin alérgenos'], ['gluten', 'Gluten'], ['lacteos', 'Lácteos'], ['huevo', 'Huevo'], ['pescado', 'Pescado'],
];

export function Recetario({ state }: RecetarioProps) {
  const { recFilters } = state;

  const ageOptions = AGE_GROUPS.map((g) => ({
    label: g.label,
    checked: recFilters.ageIdx === g.idx,
    onSelect: () => state.setRecFilter('ageIdx', g.idx),
  }));
  const texturaOptions = TEXTURA_VALS.map(([v, l]) => ({
    label: l, checked: recFilters.textura === v, onSelect: () => state.setRecFilter('textura', v),
  }));
  const tiempoOptions = TIEMPO_VALS.map(([v, l]) => ({
    label: l, checked: recFilters.tiempo === v, onSelect: () => state.setRecFilter('tiempo', v),
  }));
  const alergenoOptions = ALERGENO_VALS.map(([v, l]) => ({
    label: l, checked: recFilters.alergeno === v, onSelect: () => state.setRecFilter('alergeno', v),
  }));

  const filtered = state.recipes.filter((r) => {
    if (r.minAgeIdx > recFilters.ageIdx) return false;
    if (recFilters.textura !== 'todas' && r.texture !== recFilters.textura) return false;
    if (recFilters.tiempo === '15' && r.time > 15) return false;
    if (recFilters.tiempo === '30' && r.time > 30) return false;
    if (recFilters.alergeno === 'ninguno' && r.allergens.length) return false;
    if (recFilters.alergeno !== 'todos' && recFilters.alergeno !== 'ninguno' && !r.allergens.includes(recFilters.alergeno)) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h4 style={{ margin: 0 }}>Recetario</h4>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 600, opacity: 0.65 }}>Edad</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          <ChipGroup name="rec-age" options={ageOptions} />
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, opacity: 0.65 }}>Textura</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          <ChipGroup name="rec-textura" options={texturaOptions} />
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, opacity: 0.65 }}>Tiempo</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          <ChipGroup name="rec-tiempo" options={tiempoOptions} />
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, opacity: 0.65 }}>Alérgenos</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          <ChipGroup name="rec-alergeno" options={alergenoOptions} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map((r) => (
          <button
            key={r.id}
            type="button"
            className="card elev-sm"
            style={{ textAlign: 'left', cursor: 'pointer', border: 'none', alignItems: 'flex-start' }}
            onClick={() => state.openRecipeDetail(r.id)}
          >
            <span className="card-kicker">{MEAL_LABEL[r.mealTypes[0]]}</span>
            <span className="card-title">{r.name}</span>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <span className="tag tag-neutral">{TEXTURE_LABELS[r.texture]}</span>
              <span className="tag tag-outline">{r.time} min</span>
              <span className="tag tag-accent">Desde {AGE_GROUPS[r.minAgeIdx].label}</span>
            </div>
            <p className="card-body" style={{ margin: 0 }}>
              {r.allergens.length ? r.allergens.map((a) => ALLERGEN_LABELS[a]).join(', ') : 'Sin alérgenos'}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
