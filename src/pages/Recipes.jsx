import { useState } from 'react';
import { AGE_RANGES, MEALS, TEXTURES, RECIPES } from '../data';
import RecipeCard from '../components/RecipeCard';

export default function Recipes() {
  const [age, setAge] = useState('Todas');
  const [texture, setTexture] = useState('Todas');
  const [open, setOpen] = useState({ Comida: true, Merienda: false, Cena: false });

  function toggle(meal) {
    setOpen(prev => ({ ...prev, [meal]: !prev[meal] }));
  }

  return (
    <div style={{ padding: '20px 16px 90px' }}>
      <header style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 22 }}>Recetario</h1>
      </header>

      <FilterRow label="Edad" value={age} options={['Todas', ...AGE_RANGES]} onChange={setAge} />
      <div style={{ height: 12 }} />
      <FilterRow label="Textura" value={texture} options={['Todas', ...TEXTURES]} onChange={setTexture} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 18 }}>
        {MEALS.map(meal => {
          const ageIdx = AGE_RANGES.indexOf(age);
          const items = RECIPES.filter(r =>
            r.meal === meal &&
            (age === 'Todas' || r.ageIdx <= ageIdx) &&
            (texture === 'Todas' || r.texture === texture)
          );
          const isOpen = open[meal];
          return (
            <div key={meal} style={{
              background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
            }}>
              <button
                onClick={() => toggle(meal)}
                aria-expanded={isOpen}
                style={{
                  width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '14px 16px', border: 'none', background: 'transparent', textAlign: 'left',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600 }}>{meal}</span>
                  <span style={{
                    fontSize: 11, color: 'var(--ink-muted)', background: 'var(--sage-light)',
                    borderRadius: 999, padding: '2px 8px',
                  }}>
                    {items.length}
                  </span>
                </span>
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"
                  style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}>
                  <path d="M6 9l6 6 6-6" fill="none" stroke="var(--ink-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {isOpen && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 12px 12px' }}>
                  {items.length === 0 && (
                    <p style={{ fontSize: 13, color: 'var(--ink-muted)', padding: '0 4px 4px' }}>
                      No hay recetas con este filtro.
                    </p>
                  )}
                  {items.map(r => <RecipeCard key={r.id} recipe={r} />)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FilterRow({ label, value, options, onChange }) {
  return (
    <div>
      <p style={{ fontSize: 12, color: 'var(--ink-muted)', marginBottom: 6 }}>{label}</p>
      <div data-swipe-ignore style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            style={{
              flexShrink: 0, fontSize: 12, fontWeight: 500, padding: '6px 12px', borderRadius: 999,
              border: '1px solid ' + (value === opt ? 'var(--sage)' : 'var(--line)'),
              background: value === opt ? 'var(--sage)' : 'var(--white)',
              color: value === opt ? 'var(--white)' : 'var(--ink)',
            }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
