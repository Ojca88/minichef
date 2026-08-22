import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
    <div style={{ paddingBottom: 90 }}>
      <header style={{
        padding: '22px 20px 28px', marginBottom: 24,
        background: 'var(--gradient-hero-bold)',
        borderRadius: '0 0 var(--radius-xl) var(--radius-xl)',
        boxShadow: 'var(--shadow-lg)',
      }}>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>Hola 👋 · {formatTodayLong()}</p>
        <h1 style={{ fontSize: 34, lineHeight: 1.05, color: 'var(--white)', marginTop: 4, letterSpacing: -0.5 }}>
          ¿Qué le damos hoy?
        </h1>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 6 }}>
          {formatUpdatedAt(typeof __LAST_COMMIT_DATE__ !== 'undefined' ? __LAST_COMMIT_DATE__ : null)}
        </p>
      </header>

      <div style={{ padding: '0 20px' }}>
        <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontSize: 12, color: 'var(--ink-muted)', marginBottom: 6 }}>Edad del bebé</p>
            <div data-swipe-ignore style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
              {AGE_RANGES.map(opt => (
                <button
                  key={opt}
                  onClick={() => cloud.save({ babyAge: opt })}
                  className="chip"
                  style={{
                    flexShrink: 0, fontSize: 12, fontWeight: 500, padding: '7px 14px', borderRadius: 999,
                    border: '1px solid ' + (babyAge === opt ? 'var(--sage)' : 'var(--line)'),
                    background: babyAge === opt ? 'var(--gradient-sage)' : 'var(--white)',
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
                  className="chip"
                  style={{
                    flexShrink: 0, fontSize: 12, fontWeight: 500, padding: '7px 14px', borderRadius: 999,
                    border: '1px solid ' + (season === opt ? 'var(--sage)' : 'var(--line)'),
                    background: season === opt ? 'var(--gradient-sage)' : 'var(--white)',
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
          className="pressable"
          style={{
            width: '100%', background: 'var(--gradient-sage-bold)', color: 'var(--white)', border: 'none',
            borderRadius: 'var(--radius-lg)', padding: '18px 20px', textAlign: 'left',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16,
            boxShadow: 'var(--shadow-sage)',
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
          <NavCard title="Planificador" subtitle="Menú de la semana" color="apricot" icon="calendar" onClick={() => navigate('/planificador')} />
          <NavCard title="Recetario" subtitle="Filtra por edad" color="blue" icon="book" onClick={() => navigate('/recetario')} />
          <NavCard title="Seguimiento" subtitle="Grupos de alimentos" color="sage" icon="leaf" onClick={() => navigate('/seguimiento')} />
          <NavCard title="Compra" subtitle="Desde tu menú" color="apricot" icon="cart" onClick={() => navigate('/lista-compra')} />
        </div>

        <SyncPanel />

        <p style={{ textAlign: 'center', marginTop: 18, fontSize: 12, display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link to="/privacidad" style={{ color: 'var(--ink-muted)', textDecoration: 'underline' }}>
            Política de privacidad
          </Link>
          <Link to="/condiciones" style={{ color: 'var(--ink-muted)', textDecoration: 'underline' }}>
            Condiciones de uso
          </Link>
        </p>
      </div>
    </div>
  );
}

const NAV_CARD_ICONS = {
  calendar: <><rect x="3.5" y="5" width="17" height="15" rx="3" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M3.5 9.5h17M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></>,
  book: <path d="M4 4.5c2.5-1 5.5-1 8 0v15c-2.5-1-5.5-1-8 0v-15ZM20 4.5c-2.5-1-5.5-1-8 0v15c2.5-1 5.5-1 8 0v-15Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />,
  leaf: <path d="M5 19c-1-6 2-13 14-14 1 12-6 15-14 14Zm0 0c3-3 6-6 10-9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />,
  cart: <><circle cx="9" cy="20" r="1.4" fill="currentColor" /><circle cx="17" cy="20" r="1.4" fill="currentColor" /><path d="M3 4h2l2.2 11.2a1.8 1.8 0 0 0 1.78 1.5h7.6a1.8 1.8 0 0 0 1.77-1.46L20 8H6.2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></>,
};

function NavCard({ title, subtitle, color, icon, onClick }) {
  const theme = {
    apricot: { bg: 'var(--gradient-apricot-bold)', shadow: 'var(--shadow-apricot-bold)' },
    blue: { bg: 'var(--gradient-blue-bold)', shadow: 'var(--shadow-blue-bold)' },
    sage: { bg: 'var(--gradient-sage-bold)', shadow: 'var(--shadow-sage)' },
  }[color];
  return (
    <button onClick={onClick} className="card-interactive" style={{
      background: theme.bg, border: 'none', borderRadius: 'var(--radius-lg)', padding: '18px 16px',
      textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 10, minHeight: 104,
      boxShadow: theme.shadow, color: 'var(--white)',
    }}>
      <span style={{
        width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.22)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">{NAV_CARD_ICONS[icon]}</svg>
      </span>
      <span>
        <span style={{ display: 'block', fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600 }}>{title}</span>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>{subtitle}</span>
      </span>
    </button>
  );
}
