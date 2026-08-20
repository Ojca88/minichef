import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Registra el Service Worker (ver public/sw.js) después de que la página
// haya terminado de cargar, para no competir por ancho de banda con la
// carga inicial. Si falla (navegador sin soporte, modo incógnito estricto,
// etc.) la app sigue funcionando exactamente igual, solo sin caché offline.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
