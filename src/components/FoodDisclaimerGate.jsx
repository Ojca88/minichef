import { useState } from 'react';

// Versión del aviso: si el texto cambia de forma sustancial en el futuro,
// sube este número — así se le vuelve a pedir la aceptación a todo el
// mundo, aunque ya hubiera aceptado una versión anterior.
const DISCLAIMER_VERSION = 'v1';
const STORAGE_KEY = `minichef:food-disclaimer-accepted-${DISCLAIMER_VERSION}`;

function hasAccepted() {
  try { return localStorage.getItem(STORAGE_KEY) === 'true'; } catch { return false; }
}

function markAccepted() {
  try { localStorage.setItem(STORAGE_KEY, 'true'); } catch { /* no-op */ }
}

// Envuelve cualquier pantalla relacionada con comidas/recetas (Recetario,
// detalle de receta...): la primera vez, muestra el aviso a pantalla
// completa y no deja ver el contenido hasta que se acepta explícitamente.
// A partir de ahí, no se vuelve a mostrar (salvo que cambie la versión).
export default function FoodDisclaimerGate({ children }) {
  const [accepted, setAccepted] = useState(hasAccepted);
  const [checked, setChecked] = useState(false);

  if (accepted) return children;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100, background: 'var(--cream)',
      display: 'flex', flexDirection: 'column', padding: '28px 20px',
      overflowY: 'auto',
    }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 18, maxWidth: 420, margin: '0 auto' }}>
        <h1 style={{ fontSize: 20, fontFamily: 'var(--font-display)' }}>Información importante</h1>
        <p style={{ fontSize: 14, lineHeight: 1.6 }}>
          Las recetas y recomendaciones de MiniChef son orientativas y no sustituyen el consejo
          de un profesional sanitario.
        </p>
        <p style={{ fontSize: 14, lineHeight: 1.6 }}>
          Antes de ofrecer un alimento a tu bebé, comprueba sus ingredientes, alérgenos, textura
          y adecuación a su edad y desarrollo.
        </p>
        <p style={{ fontSize: 14, lineHeight: 1.6 }}>
          Si tu bebé tiene alergias, intolerancias, enfermedades o cualquier circunstancia
          médica particular, consulta previamente con su pediatra o profesional sanitario.
        </p>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, marginTop: 6 }}>
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            style={{ marginTop: 3, flexShrink: 0, width: 18, height: 18, accentColor: 'var(--sage)' }}
          />
          He leído y entiendo esta información.
        </label>
        <button
          onClick={() => { markAccepted(); setAccepted(true); }}
          disabled={!checked}
          style={{
            padding: '13px 0', borderRadius: 'var(--radius-md)', border: 'none',
            background: checked ? 'var(--sage)' : 'var(--line)', color: 'white',
            fontSize: 14, fontWeight: 600, opacity: checked ? 1 : 0.6,
          }}
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
