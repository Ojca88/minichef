import { useNavigate } from 'react-router-dom';
import Badge from './Badge';
import { youtubeSearchUrl } from '../data';

function speak(text) {
  if ('speechSynthesis' in window) {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'es-ES';
    window.speechSynthesis.speak(utter);
  }
}

export default function RecipeCard({ recipe, showMeal = false }) {
  const navigate = useNavigate();
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/recetario/${recipe.id}`)}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/recetario/${recipe.id}`)}
      className="card-interactive"
      style={{
        background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)',
        padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8, cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <h3 style={{ fontSize: 16 }}>{recipe.name}</h3>
        <button
          aria-label={`Escuchar receta ${recipe.name}`}
          onClick={(e) => { e.stopPropagation(); speak(recipe.name); }}
          className="icon-btn"
          style={{
            flexShrink: 0, width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--line)',
            background: 'var(--sage-light)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 9v6h4l5 5V4L8 9H4Z" fill="var(--sage-dark)" />
            <path d="M16.5 8.5c1.7 1.9 1.7 5.1 0 7" fill="none" stroke="var(--sage-dark)" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        {showMeal && <Badge tone="blue">{recipe.meal}</Badge>}
        <Badge tone="sage">{recipe.age}</Badge>
        <Badge tone="apricot">{recipe.time}</Badge>
        <a
          href={recipe.videoUrl || youtubeSearchUrl(recipe.name)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#C4302B', marginLeft: 'auto' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M22 12s0-3.4-.4-5a2.9 2.9 0 0 0-2-2C17.9 4.5 12 4.5 12 4.5s-5.9 0-7.6.5a2.9 2.9 0 0 0-2 2C2 8.6 2 12 2 12s0 3.4.4 5a2.9 2.9 0 0 0 2 2c1.7.5 7.6.5 7.6.5s5.9 0 7.6-.5a2.9 2.9 0 0 0 2-2c.4-1.6.4-5 .4-5Z" fill="#C4302B" />
            <path d="M10 15.5v-7l6 3.5-6 3.5Z" fill="white" />
          </svg>
          Vídeo
        </a>
      </div>
    </div>
  );
}
