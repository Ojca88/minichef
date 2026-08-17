import { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MEALS, recipesFor, recipeById, seededRandom, AGE_RANGES } from '../data';
import { useCloud } from '../CloudSyncContext';

const WEEKDAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MONTH_NAMES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const MEAL_DOT = { Comida: 'var(--sage)', Merienda: 'var(--apricot)', Cena: 'var(--blue)' };

function dateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function mondayOf(date) {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // 0 = Monday
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Devuelve solo las recetas aptas para la edad del bebé (si se ha configurado);
// si el filtro deja el grupo vacío, cae de vuelta al total para no romper el plan.
function poolFor(meal, ageIdx) {
  const all = recipesFor(meal);
  if (ageIdx === null || ageIdx === undefined) return all;
  const filtered = all.filter(r => r.ageIdx <= ageIdx);
  return filtered.length ? filtered : all;
}

function randomPick(meal, excludeId, ageIdx) {
  const pool = poolFor(meal, ageIdx);
  const options = pool.filter(r => r.id !== excludeId);
  const finalPool = options.length ? options : pool;
  return finalPool[Math.floor(Math.random() * finalPool.length)];
}

function pickForSeedAged(meal, seed, ageIdx) {
  const pool = poolFor(meal, ageIdx);
  const idx = Math.floor(seededRandom(seed) * pool.length);
  return pool[idx];
}

function seedFor(d, mi) {
  return d.getFullYear() * 1000 + d.getMonth() * 40 + d.getDate() * 3 + mi;
}

// Genera, para un conjunto de fechas, solo los ids de receta (no el objeto completo)
// — es lo único que se guarda y sincroniza en la nube.
function generateIdsFor(dates, ageIdx) {
  const patch = {};
  dates.forEach((d) => {
    const key = dateKey(d);
    const entry = {};
    MEALS.forEach((meal, mi) => { entry[meal] = pickForSeedAged(meal, seedFor(d, mi), ageIdx).id; });
    patch[key] = entry;
  });
  return patch;
}

export default function Planner() {
  const { data: cloudData, save } = useCloud();
  const babyAge = cloudData.babyAge || null;
  const ageIdx = babyAge ? AGE_RANGES.indexOf(babyAge) : null;
  const plans = cloudData.plans || {};

  const [view, setView] = useState('semana');
  const [weekStart, setWeekStart] = useState(() => mondayOf(new Date()));
  const [monthCursor, setMonthCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selectedDay, setSelectedDay] = useState(null);

  const weekDates = useMemo(() => (
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return d;
    })
  ), [weekStart]);

  const monthDays = useMemo(() => {
    const { year, month } = monthCursor;
    const firstDay = new Date(year, month, 1);
    const total = new Date(year, month + 1, 0).getDate();
    const leadingBlank = (firstDay.getDay() + 6) % 7;
    const cells = Array.from({ length: leadingBlank }, () => null);
    for (let d = 1; d <= total; d++) cells.push(new Date(year, month, d));
    return cells;
  }, [monthCursor]);

  // Rellena en la nube (solo ids) los días visibles que todavía no existan.
  // No pisa nada que ya se haya generado o cambiado a mano antes.
  function ensureDates(dates) {
    const missing = dates.filter(d => !plans[dateKey(d)]);
    if (!missing.length) return;
    const patch = generateIdsFor(missing, ageIdx);
    save(prev => ({ ...prev, plans: { ...(prev.plans || {}), ...patch } }));
  }

  useEffect(() => { ensureDates(weekDates); }, [weekDates, cloudData.plans]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { ensureDates(monthDays.filter(Boolean)); }, [monthDays, cloudData.plans]); // eslint-disable-line react-hooks/exhaustive-deps

  // Si cambia la edad del bebé, regeneramos (esta vez sí sobrescribiendo) el
  // rango visible para que las sugerencias vuelvan a ser acordes a la nueva edad.
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) { firstRun.current = false; return; }
    const dates = view === 'semana' ? weekDates : monthDays.filter(Boolean);
    const patch = generateIdsFor(dates, ageIdx);
    save(prev => ({ ...prev, plans: { ...(prev.plans || {}), ...patch } }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [babyAge]);

  function getDay(d) {
    const key = dateKey(d);
    const ids = plans[key];
    if (ids) {
      const entry = {};
      MEALS.forEach((meal) => { entry[meal] = recipeById(ids[meal]) || pickForSeedAged(meal, seedFor(d, 0), ageIdx); });
      return entry;
    }
    // Todavía no ha llegado la sincronización para este día: mostramos algo
    // de forma determinista mientras tanto (el effect lo persistirá enseguida).
    const entry = {};
    MEALS.forEach((meal, mi) => { entry[meal] = pickForSeedAged(meal, seedFor(d, mi), ageIdx); });
    return entry;
  }

  function regenerate(d, meal) {
    const key = dateKey(d);
    const current = plans[key] || {};
    const currentRecipe = current[meal] ? recipeById(current[meal]) : null;
    const next = randomPick(meal, currentRecipe?.id, ageIdx);
    save(prev => ({
      ...prev,
      plans: { ...(prev.plans || {}), [key]: { ...(prev.plans?.[key] || {}), [meal]: next.id } },
    }));
  }

  function shiftWeek(delta) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + delta * 7);
    setWeekStart(d);
  }

  function shiftMonth(delta) {
    let { year, month } = monthCursor;
    month += delta;
    if (month < 0) { month = 11; year -= 1; }
    if (month > 11) { month = 0; year += 1; }
    setMonthCursor({ year, month });
    setSelectedDay(null);
  }

  return (
    <div style={{ padding: '20px 16px 90px' }}>
      <header style={{ marginBottom: 14 }}>
        <p style={{ fontSize: 13, color: 'var(--ink-muted)' }}>
          {babyAge ? `Bebé de ${babyAge}` : (
            <Link to="/" style={{ color: 'var(--sage-dark)', textDecoration: 'underline' }}>
              Configura la edad del bebé en Inicio
            </Link>
          )}
        </p>
        <h1 style={{ fontSize: 22 }}>Menú</h1>
      </header>

      <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
        {['semana', 'mes'].map(v => (
          <button key={v} onClick={() => setView(v)} style={{
            flex: 1, padding: '9px 0', borderRadius: 999, border: '1px solid ' + (view === v ? 'var(--sage)' : 'var(--line)'),
            background: view === v ? 'var(--sage)' : 'var(--white)', color: view === v ? 'var(--white)' : 'var(--ink)',
            fontSize: 13, fontWeight: 500, textTransform: 'capitalize',
          }}>
            {v}
          </button>
        ))}
      </div>

      {view === 'semana' ? (
        <>
          <WeekSwitcher weekDates={weekDates} onPrev={() => shiftWeek(-1)} onNext={() => shiftWeek(1)} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 14 }}>
            {weekDates.map((d, i) => {
              const entry = getDay(d);
              return (
                <div key={i}>
                  <h2 style={{ fontSize: 14, color: 'var(--sage-dark)', marginBottom: 8 }}>
                    {WEEKDAY_LABELS[i]} <span style={{ color: 'var(--ink-muted)', fontWeight: 400 }}>{d.getDate()}</span>
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {MEALS.map(meal => {
                      const recipe = entry[meal];
                      return (
                        <div key={meal} style={{
                          background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)',
                          padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10,
                        }}>
                          <span style={{ fontSize: 11, color: 'var(--ink-muted)', width: 62, flexShrink: 0 }}>{meal}</span>
                          <span style={{ fontSize: 13, flex: 1 }}>{recipe.name}</span>
                          <button
                            aria-label={`Cambiar sugerencia de ${meal.toLowerCase()} del ${WEEKDAY_LABELS[i]}`}
                            onClick={() => regenerate(d, meal)}
                            style={{
                              width: 28, height: 28, borderRadius: '50%', border: '1px solid var(--line)',
                              background: 'var(--sage-light)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                              <path d="M4 12a8 8 0 0 1 13.7-5.7M20 12a8 8 0 0 1-13.7 5.7M17 3v4h-4M7 21v-4h4" fill="none" stroke="var(--sage-dark)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <MonthView
          monthCursor={monthCursor}
          monthDays={monthDays}
          getDay={getDay}
          selectedDay={selectedDay}
          onSelectDay={setSelectedDay}
          onPrev={() => shiftMonth(-1)}
          onNext={() => shiftMonth(1)}
        />
      )}
    </div>
  );
}

function WeekSwitcher({ weekDates, onPrev, onNext }) {
  const first = weekDates[0];
  const last = weekDates[6];
  const label = `${first.getDate()} ${MONTH_NAMES[first.getMonth()].slice(0, 3)} – ${last.getDate()} ${MONTH_NAMES[last.getMonth()].slice(0, 3)}`;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <IconButton onClick={onPrev} dir="left" label="Semana anterior" />
      <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>
      <IconButton onClick={onNext} dir="right" label="Semana siguiente" />
    </div>
  );
}

function IconButton({ onClick, dir, label }) {
  return (
    <button aria-label={label} onClick={onClick} style={{
      width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--line)', background: 'var(--white)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
        <path d={dir === 'left' ? 'M15 5 8 12l7 7' : 'M9 5l7 7-7 7'} fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

function MonthView({ monthCursor, monthDays, getDay, selectedDay, onSelectDay, onPrev, onNext }) {
  const today = dateKey(new Date());
  const selectedEntry = selectedDay ? getDay(selectedDay) : null;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <IconButton onClick={onPrev} dir="left" label="Mes anterior" />
        <span style={{ fontSize: 14, fontWeight: 500, textTransform: 'capitalize' }}>
          {MONTH_NAMES[monthCursor.month]} {monthCursor.year}
        </span>
        <IconButton onClick={onNext} dir="right" label="Mes siguiente" />
      </div>

      <p style={{ fontSize: 12, color: 'var(--ink-muted)', marginBottom: 8 }}>
        Vista informativa · toca un día para ver el resumen
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
        {WEEKDAY_LABELS.map(w => (
          <div key={w} style={{ textAlign: 'center', fontSize: 10, color: 'var(--ink-muted)' }}>{w[0]}</div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {monthDays.map((d, i) => {
          if (!d) return <div key={i} />;
          const key = dateKey(d);
          const isToday = key === today;
          const isSelected = selectedDay && dateKey(selectedDay) === key;
          return (
            <button
              key={i}
              onClick={() => onSelectDay(d)}
              style={{
                aspectRatio: '1', borderRadius: 10, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 3, padding: 2,
                border: isSelected ? '1.5px solid var(--sage)' : isToday ? '1px solid var(--apricot)' : '1px solid var(--line)',
                background: isSelected ? 'var(--sage-light)' : 'var(--white)',
              }}
            >
              <span style={{ fontSize: 12, fontWeight: isToday ? 700 : 500 }}>{d.getDate()}</span>
              <span style={{ display: 'flex', gap: 2 }}>
                {MEALS.map(m => (
                  <span key={m} style={{ width: 4, height: 4, borderRadius: '50%', background: MEAL_DOT[m] }} />
                ))}
              </span>
            </button>
          );
        })}
      </div>

      {selectedEntry && (
        <div style={{
          marginTop: 16, background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)',
          padding: '14px 16px',
        }}>
          <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>
            {selectedDay.getDate()} de {MONTH_NAMES[monthCursor.month]}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {MEALS.map(meal => (
              <div key={meal} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: MEAL_DOT[meal], flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: 'var(--ink-muted)', width: 60, flexShrink: 0 }}>{meal}</span>
                <span style={{ fontSize: 13 }}>{selectedEntry[meal].name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
