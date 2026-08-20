import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Si no se han configurado las variables de entorno, la app sigue funcionando
// en local (localStorage) sin sincronizar. Así nunca se rompe por falta de setup.
export const isSupabaseConfigured = Boolean(url && anonKey);

// flowType: 'pkce' -> Supabase devuelve la sesión tras el login como
// "?code=..." (parámetro normal de la URL), no como "#access_token=..."
// (fragmento hash). Esto es imprescindible aquí porque la app usa
// HashRouter para las rutas (todo lo que va después de "#" es una ruta,
// tipo /#/planificador) — con el flujo antiguo, el propio token de sesión
// chocaba con el router y ni la sesión se guardaba bien ni la ruta cargaba.
export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, { auth: { flowType: 'pkce' } })
  : null;

// Se expone en window solo para poder ejecutar las comprobaciones manuales de
// RLS (ver SEGURIDAD-RLS-tests-manuales.md) desde la consola del navegador.
// No supone un riesgo adicional: la anon key ya es pública dentro del propio
// bundle de JavaScript: quien quisiera usarla ya podía hacerlo sin esto.
if (typeof window !== 'undefined' && supabase) {
  window.supabase = supabase;
}
