import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// React Router no hace scroll al inicio solo al navegar entre rutas (es un
// comportamiento estándar de las SPA, no un descuido nuestro) — hay que
// pedirlo explícitamente. Se monta una sola vez, a nivel de toda la app, y
// actúa en cada cambio de ruta.
export default function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
