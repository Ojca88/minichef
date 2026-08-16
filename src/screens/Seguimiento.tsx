import type { AppState } from '../hooks/useAppState';
import { FOOD_GROUPS_LIST, getRecipe, type FoodGroup } from '../data/recipes';
import { AlertIcon } from '../components/Icons';

interface SeguimientoProps {
  state: AppState;
}

function weekCounts(plan: Record<string, string>, statuses: Record<string, string | null>): Record<FoodGroup, number> {
  const counts = {} as Record<FoodGroup, number>;
  FOOD_GROUPS_LIST.forEach((g) => { counts[g.key] = 0; });
  Object.keys(plan).forEach((key) => {
    if (!statuses[key]) return;
    const r = getRecipe(plan[key]);
    if (r) r.foodGroups.forEach((g) => { counts[g] = (counts[g] || 0) + 1; });
  });
  return counts;
}

// Historical weeks are illustrative sample data; "Hoy" reflects the live tracked state.
const WEEKS_MOCK: { label: string; counts: Partial<Record<FoodGroup, number>> }[] = [
  { label: 'Sem 1', counts: { verduras: 4, frutas: 3, cereales: 2, legumbres: 1, proteina: 3, lacteos: 1, grasas: 1 } },
  { label: 'Sem 2', counts: { verduras: 3, frutas: 4, cereales: 3, legumbres: 0, proteina: 2, lacteos: 2, grasas: 1 } },
  { label: 'Sem 3', counts: { verduras: 5, frutas: 2, cereales: 2, legumbres: 2, proteina: 4, lacteos: 0, grasas: 2 } },
];

export function Seguimiento({ state }: SeguimientoProps) {
  const liveCounts = weekCounts(state.plan, state.statuses);
  const hasTracked = Object.values(state.statuses).some(Boolean);

  const weeksAll = [...WEEKS_MOCK, { label: 'Hoy', counts: liveCounts }];
  const maxCount = Math.max(1, ...weeksAll.flatMap((w) => Object.values(w.counts) as number[]));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h4 style={{ margin: 0 }}>Seguimiento nutricional</h4>
      <div style={{ display: 'flex', gap: 6 }}>
        <label className="baby-chip">
          <input type="radio" name="track-view" checked={state.trackingView === 'semana'} onChange={() => state.setTrackingView('semana')} />
          <span>Semana</span>
        </label>
        <label className="baby-chip">
          <input type="radio" name="track-view" checked={state.trackingView === 'mes'} onChange={() => state.setTrackingView('mes')} />
          <span>Mes</span>
        </label>
      </div>

      {state.trackingView === 'semana' && (
        <>
          {!hasTracked && (
            <div className="card elev-sm">
              <p className="card-body" style={{ margin: 0 }}>
                Aún no has marcado ninguna comida esta semana. Marca "Probada" en el planificador para ver aquí qué grupos de alimentos ha comido tu peque.
              </p>
            </div>
          )}
          {hasTracked && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {FOOD_GROUPS_LIST.map((g) => {
                const count = liveCounts[g.key] || 0;
                const alert = count === 0;
                return (
                  <div className="card elev-sm" style={{ gap: 6 }} key={g.key}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span className="card-title" style={{ fontSize: 14 }}>{g.label}</span>
                      <span className="tag tag-neutral">{count}x</span>
                    </div>
                    {alert && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-accent-700)', fontSize: 12 }}>
                        <AlertIcon />
                        <span>Esta semana no ha probado {g.label.toLowerCase()}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {state.trackingView === 'mes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {FOOD_GROUPS_LIST.map((g) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }} key={g.key}>
              <span style={{ fontSize: 12, fontWeight: 600 }}>{g.label}</span>
              <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 56 }}>
                {weeksAll.map((w) => {
                  const heightPct = Math.max(6, Math.round(((w.counts[g.key] || 0) / maxCount) * 100));
                  return (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, height: '100%', justifyContent: 'flex-end' }} key={w.label}>
                      <div style={{ width: '100%', background: 'var(--color-accent-300)', height: `${heightPct}%` }} />
                      <span style={{ fontSize: 8, opacity: 0.55 }}>{w.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
