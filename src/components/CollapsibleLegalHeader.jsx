import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Cabecera fija (position: sticky) que se encoge al hacer scroll hacia
// abajo — el título pasa de grande a una barra compacta, dejando más
// espacio a la pantalla y evitando que se vea desproporcionadamente grande
// una vez el usuario ya está leyendo el contenido, muy por debajo.
export default function CollapsibleLegalHeader({ title, updatedDate }) {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        // Holgura entre el punto de encogerse (40px) y el de volver a
        // agrandarse (10px): sin esta diferencia, al hacer scroll justo
        // cerca del límite la cabecera rebota entre grande y pequeña muy
        // rápido, y como el contenido se reajusta cada vez, se ve como un
        // tembleque.
        setScrolled((prev) => (prev ? window.scrollY > 10 : window.scrollY > 40));
        ticking = false;
      });
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 20 }}>
      <header style={{
        padding: scrolled ? '12px 16px 14px' : '22px 16px 26px',
        background: 'var(--gradient-sage)',
        borderRadius: '0 0 var(--radius-xl) var(--radius-xl)',
        boxShadow: 'var(--shadow-sage)',
        transition: 'padding 0.2s ease',
      }}>
        <button
          onClick={() => navigate(-1)}
          aria-label="Volver"
          style={{
            display: 'flex', alignItems: 'center', gap: 6, marginBottom: scrolled ? 4 : 12,
            background: 'none', border: 'none', color: 'var(--white)', fontSize: 13, fontWeight: 600, padding: 0,
            transition: 'margin 0.2s ease',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15 5 8 12l7 7" fill="none" stroke="var(--white)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Volver
        </button>
        <h1 style={{ fontSize: scrolled ? 17 : 24, color: 'var(--white)', transition: 'font-size 0.2s ease' }}>{title}</h1>
        {!scrolled && (
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 4 }}>
            Última actualización: {updatedDate}
          </p>
        )}
      </header>
      {/* Franja de degradado pegada a la cabecera: al ir sticky junto con
          ella, el texto que sube por debajo siempre "emerge" con un hueco
          fijo de unos 4mm, en vez de tocar directamente el borde de la
          cabecera en cualquier posición de scroll. */}
      <div aria-hidden="true" style={{
        height: 16,
        background: 'linear-gradient(to bottom, var(--cream), rgba(250,247,240,0))',
        pointerEvents: 'none',
      }} />
    </div>
  );
}
