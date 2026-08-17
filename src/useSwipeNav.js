import { useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Orden de las pantallas principales, igual que en la barra inferior.
// El swipe solo actúa cuando estamos en una de estas pantallas (no en el
// detalle de receta), para no interferir con otros gestos.
const ORDER = ['/', '/planificador', '/recetario', '/seguimiento', '/lista-compra'];

const SWIPE_THRESHOLD = 60; // px mínimos horizontales para considerarlo swipe
const MAX_VERTICAL = 50; // si el dedo se mueve más que esto en vertical, se ignora (es scroll)

export function useSwipeNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const start = useRef(null);

  function onTouchStart(e) {
    if (e.target.closest('[data-swipe-ignore]')) {
      start.current = null;
      return;
    }
    const t = e.touches[0];
    start.current = { x: t.clientX, y: t.clientY };
  }

  function onTouchEnd(e) {
    if (!start.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.current.x;
    const dy = t.clientY - start.current.y;
    start.current = null;

    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dy) > MAX_VERTICAL) return;

    const idx = ORDER.indexOf(location.pathname);
    if (idx === -1) return; // no estamos en una pantalla principal (ej. detalle de receta)

    if (dx < 0 && idx < ORDER.length - 1) {
      navigate(ORDER[idx + 1]); // swipe a la izquierda -> siguiente pantalla
    } else if (dx > 0 && idx > 0) {
      navigate(ORDER[idx - 1]); // swipe a la derecha -> pantalla anterior
    }
  }

  return { onTouchStart, onTouchEnd };
}
