import { useMemo } from 'react';
import { FOOD_GROUPS, recipeById, MEALS } from '../data';
import { useCloud } from '../CloudSyncContext';

function dateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// El valor guardado puede ser un boolean antiguo (de antes del login con
// atribución) o un objeto { done, by }. Aquí solo nos interesa si está hecho.
function isMealEaten(value) {
  if (typeof value === 'boolean') return value;
  return Boolean(value?.done);
}

function currentWeekDates() {
  const d = new Date();
  const day = (d.getDay() + 6) % 7; // 0 = lunes
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const day2 = new Date(d);
    day2.setDate(day2.getDate() + i);
    return day2;
  });
}

export default function Tracking() {
  const { data } = useCloud();
  const plans = data.plans || {};
  const eaten = data.eaten || {};

  const { triedGroups, eatenCount, plannedCount } = useMemo(() => {
    const tried = new Set();
    let eatenCount = 0;
    let plannedCount = 0;
    currentWeekDates().forEach((d) => {
      const key = dateKey(d);
      const dayPlan = plans[key];
      const dayEaten = eaten[key];
      MEALS.forEach((meal) => {
        const value = dayPlan?.[meal];
        if (!value) return;
        plannedCount += 1;
        if (!isMealEaten(dayEaten?.[meal])) return;
        eatenCount += 1;
        // Los platos puestos a mano no tienen grupos de alimentos conocidos,
        // así que no suman al desglose (pero sí cuentan como comida marcada).
        const recipe = typeof value === 'string' ? recipeById(value) : null;
        recipe?.foodGroups?.forEach((g) => tried.add(g));
      });
    });
    return { triedGroups: tried, eatenCount, plannedCount };
  }, [plans, eaten]);

  const pending = FOOD_GROUPS.filter(g => !triedGroups.has(g));

  return (
    <div style={{ paddingBottom: 90 }}>
      <header style={{
        padding: '22px 16px 26px', marginBottom: 18,
        background: 'var(--gradient-sage-bold)',
        borderRadius: '0 0 var(--radius-xl) var(--radius-xl)',
        boxShadow: 'var(--shadow-sage)',
      }}>
        <h1 style={{ fontSize: 26, color: 'var(--white)' }}>Seguimiento nutricional</h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 4 }}>
          {plannedCount > 0 ? `${eatenCount} de ${plannedCount} comidas marcadas como comidas esta semana` : 'Todavía no hay menú planificado'}
        </p>
      </header>

      <div style={{ padding: '0 16px' }}>
      {eatenCount === 0 ? (
        <div className="card" style={{
          background: 'var(--blue-light)', borderRadius: 'var(--radius-md)', padding: '14px 16px',
          marginBottom: 18, border: '1px solid rgba(46, 86, 112, 0.16)',
        }}>
          <p style={{ fontSize: 13, color: '#2E5670', lineHeight: 1.5 }}>
            Aún no has marcado ninguna comida como comida. Ve al Menú de la semana y toca el círculo ✓ junto a cada plato cuando el bebé se lo haya comido — así este seguimiento reflejará lo real.
          </p>
        </div>
      ) : pending.length > 0 && (
        <div className="card" style={{
          background: 'var(--apricot-light)', borderRadius: 'var(--radius-md)', padding: '14px 16px',
          marginBottom: 18, display: 'flex', gap: 10, alignItems: 'flex-start',
          border: '1px solid rgba(154, 90, 32, 0.16)',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }}>
            <path d="M12 3 2 20h20L12 3Z" fill="none" stroke="#9A5A20" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M12 9v5M12 17h.01" stroke="#9A5A20" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <p style={{ fontSize: 13, color: '#9A5A20' }}>
            Esta semana todavía no ha comido {pending.map(g => g.toLowerCase()).join(', ')}.
          </p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {FOOD_GROUPS.map(g => {
          const tried = triedGroups.has(g);
          return (
            <div key={g} className="card" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
            }}>
              <span style={{ fontSize: 14 }}>{g}</span>
              <span style={{
                fontSize: 12, fontWeight: 500, padding: '3px 10px', borderRadius: 999,
                background: tried ? 'var(--gradient-sage)' : 'var(--apricot-light)',
                color: tried ? 'var(--white)' : '#9A5A20',
              }}>
                {tried ? 'Comido' : 'Pendiente'}
              </span>
            </div>
          );
        })}
      </div>

      <p style={{ fontSize: 11, color: 'var(--ink-muted)', marginTop: 14, lineHeight: 1.5 }}>
        Solo cuenta lo que has marcado como comido en el Menú de la semana — no lo que estaba simplemente planificado.
      </p>
      </div>
    </div>
  );
}
