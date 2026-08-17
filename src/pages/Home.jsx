import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RECIPES, AGE_RANGES, formatTodayLong, formatUpdatedAt } from '../data';
import { useCloud } from '../CloudSyncContext';
import RecipeCard from '../components/RecipeCard';
import SyncPanel from '../components/SyncPanel';

/* global __LAST_COMMIT_DATE__ */

// Si el usuario todavía no ha elegido temporada, proponemos una por defecto
// según el mes actual (jun-sep => verano, resto => invierno) — solo como
// punto de partida, se puede cambiar en cualquier momento.
function defaultSeason() {
  const month = new Date().getMonth(); // 0=ene
  return month >= 5 && month <= 8 ? 'verano' : 'invierno';
}

export default function Home() {
  const navigate = useNavigate();
  const [suggestion, setSuggestion] = useState(null);
  const cloud = useCloud();
  const babyAge = cloud.data.babyAge || null;
  const ageIdx = babyAge ? AGE_RANGES.indexOf(babyAge) : null;
  const season = cloud.data.season || defaultSeason();

  function generar() {
    let pool = RECIPES;
    if (ageIdx !== null) {
      const byAge = pool.filter(r => r.ageIdx <= ageIdx);
      if (byAge.length) pool = byAge;
    }
    const bySeason = pool.filter(r => r.season === season || r.season === 'ambas');
    if (bySeason.length) pool = bySeason;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setSuggestion(pick);
  }

  return (
    <div style={{ padding: '20px 20px 90px' }}>
      <header style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 13, color: 'var(--ink-muted)' }}>Hola 👋 · {formatTodayLong()}</p>
        <h1 style={{ fontSize: 24 }}>¿Qué le damos hoy?</h1>
        <p style={{ fontSize: 11, color: 'var(--ink-muted)', marginTop: 4 }}>
          {formatUpdatedAt(typeof __LAST_COMMIT_DATE__ !== 'undefined' ? __LAST_COMMIT_DATE__ : null)}
        </p>
      </header>

      <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <div>
          <p style={{ fontSize: 12, color: 'var(--ink-muted)', marginBottom: 6 }}>Edad del bebé</p>
          <div data-swipe-ignore style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
            {AGE_RANGES.map(opt => (
              <button
                key={opt}
                onClick={() => cloud.save({ babyAge: opt })}
                style={{
                  flexShrink: 0, fontSize: 12, fontWeight: 500, padding: '7px 14px', borderRadius: 999,
                  border: '1px solid ' + (babyAge === opt ? 'var(--sage)' : 'var(--line)'),
                  background: babyAge === opt ? 'var(--sage)' : 'var(--white)',
                  color: babyAge === opt ? 'var(--white)' : 'var(--ink)',
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p style={{ fontSize: 12, color: 'var(--ink-muted)', marginBottom: 6 }}>Temporada</p>
          <div data-swipe-ignore style={{ display: 'flex', gap: 6 }}>
            {[['invierno', '❄️ Invierno'], ['verano', '☀️ Verano']].map(([opt, label]) => (
              <button
                key={opt}
                onClick={() => cloud.save({ season: opt })}
                style={{
                  flexShrink: 0, fontSize: 12, fontWeight: 500, padding: '7px 14px', borderRadius: 999,
                  border: '1px solid ' + (season === opt ? 'var(--sage)' : 'var(--line)'),
                  background: season === opt ? 'var(--sage)' : 'var(--white)',
                  color: season === opt ? 'var(--white)' : 'var(--ink)',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={generar}
        style={{
          width: '100%', background: 'var(--sage)', color: 'var(--white)', border: 'none',
          borderRadius: 'var(--radius-lg)', padding: '18px 20px', textAlign: 'left',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16,
        }}
      >
        <span>
          <span style={{ display: 'block', fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600 }}>
            Sugerencia rápida
          </span>
          <span style={{ fontSize: 13, opacity: 0.85 }}>Toca para generar una idea</span>
        </span>
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 12a8 8 0 0 1 13.7-5.7M20 12a8 8 0 0 1-13.7 5.7M17 3v4h-4M7 21v-4h4" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {suggestion && (
        <div style={{ marginBottom: 20 }}>
          <RecipeCard recipe={suggestion} showMeal />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        <NavCard title="Planificador" subtitle="Menú de la semana" color="apricot" onClick={() => navigate('/planificador')} />
        <NavCard title="Recetario" subtitle="Filtra por edad" color="blue" onClick={() => navigate('/recetario')} />
        <NavCard title="Seguimiento" subtitle="Grupos de alimentos" color="sage" onClick={() => navigate('/seguimiento')} />
        <NavCard title="Compra" subtitle="Desde tu menú" color="apricot" onClick={() => navigate('/lista-compra')} />
      </div>

      <SyncPanel />
    </div>
  );
}

function NavCard({ title, subtitle, color, onClick }) {
  const bg = { apricot: 'var(--apricot-light)', blue: 'var(--blue-light)', sage: 'var(--sage-light)' }[color];
  return (
    <button onClick={onClick} style={{
      background: bg, border: 'none', borderRadius: 'var(--radius-md)', padding: '16px',
      textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 4, minHeight: 90,
    }}>
      <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600 }}>{title}</span>
      <span style={{ fontSize: 12, color: 'var(--ink-muted)' }}>{subtitle}</span>
    </button>
  );
}
