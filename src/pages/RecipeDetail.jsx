import { useParams, useNavigate } from 'react-router-dom';
import { RECIPES, youtubeSearchUrl } from '../data';
import Badge from '../components/Badge';

function speak(text) {
  if ('speechSynthesis' in window) {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'es-ES';
    window.speechSynthesis.speak(utter);
  }
}

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const recipe = RECIPES.find(r => r.id === id);

  if (!recipe) {
    return (
      <div style={{ padding: 20 }}>
        <p>No se encontró la receta.</p>
      </div>
    );
  }

  const fullText = `${recipe.name}. Ingredientes: ${recipe.ingredients.join(', ')}. Pasos: ${recipe.steps.join('. ')}`;

  return (
    <div style={{ padding: '20px 16px 40px' }}>
      <button onClick={() => navigate(-1)} className="pressable" style={{
        border: 'none', background: 'none', display: 'flex', alignItems: 'center', gap: 4,
        fontSize: 13, color: 'var(--ink-muted)', marginBottom: 14, padding: 0,
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15 5 8 12l7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Volver
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
        <h1 style={{ fontSize: 21 }}>{recipe.name}</h1>
        <button
          aria-label="Escuchar receta completa"
          onClick={() => speak(fullText)}
          className="pressable"
          style={{
            flexShrink: 0, width: 38, height: 38, borderRadius: '50%', border: 'none',
            background: 'var(--gradient-sage)', boxShadow: 'var(--shadow-sage)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 9v6h4l5 5V4L8 9H4Z" fill="white" />
            <path d="M16.5 8.5c1.7 1.9 1.7 5.1 0 7" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '10px 0 20px' }}>
        <Badge tone="blue">{recipe.meal}</Badge>
        <Badge tone="sage">{recipe.age}</Badge>
        <Badge tone="apricot">{recipe.time}</Badge>
        <Badge tone="sage">{recipe.texture}</Badge>
        {recipe.allergens.map(a => <Badge key={a} tone="apricot">{a}</Badge>)}
      </div>

      <a
        href={recipe.videoUrl || youtubeSearchUrl(recipe.name)}
        target="_blank"
        rel="noopener noreferrer"
        className="card-interactive"
        style={{
          display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500,
          color: '#C4302B', background: '#FDEDED', border: '1px solid #F6D2D0',
          borderRadius: 'var(--radius-md)', padding: '10px 14px', marginBottom: 22,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
          <path d="M22 12s0-3.4-.4-5a2.9 2.9 0 0 0-2-2C17.9 4.5 12 4.5 12 4.5s-5.9 0-7.6.5a2.9 2.9 0 0 0-2 2C2 8.6 2 12 2 12s0 3.4.4 5a2.9 2.9 0 0 0 2 2c1.7.5 7.6.5 7.6.5s5.9 0 7.6-.5a2.9 2.9 0 0 0 2-2c.4-1.6.4-5 .4-5Z" fill="#C4302B" />
          <path d="M10 15.5v-7l6 3.5-6 3.5Z" fill="white" />
        </svg>
        {recipe.videoUrl ? (recipe.videoTitle || 'Ver vídeo de esta receta') : 'Buscar vídeos de esta receta en YouTube'}
      </a>

      <section style={{ marginBottom: 22 }}>
        <h2 style={{ fontSize: 15, marginBottom: 10 }}>Ingredientes</h2>
        <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {recipe.ingredients.map((ing, i) => (
            <li key={i} style={{ fontSize: 14 }}>{ing}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 style={{ fontSize: 15, marginBottom: 10 }}>Preparación</h2>
        <ol style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {recipe.steps.map((step, i) => (
            <li key={i} style={{ fontSize: 14, lineHeight: 1.5 }}>{step}</li>
          ))}
        </ol>
      </section>

      {recipe.tips && recipe.tips.length > 0 && (
        <section style={{ marginTop: 22 }}>
          <h2 style={{ fontSize: 15, marginBottom: 10 }}>Consejos</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recipe.tips.map((tip, i) => (
              <div key={i} style={{
                fontSize: 13, lineHeight: 1.5, color: 'var(--sage-dark)', background: 'var(--sage-light)',
                border: '1px solid rgba(78, 107, 84, 0.18)',
                borderRadius: 'var(--radius-md)', padding: '10px 12px',
              }}>
                {tip}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
