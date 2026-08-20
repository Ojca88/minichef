// Service Worker de MiniChef.
//
// Diseñado para evitar el problema que ya tuvimos antes (una versión vieja
// cacheada que se quedaba pegada en el dispositivo): la página principal
// (HTML) siempre se pide primero a la red, y solo se sirve la copia en caché
// si no hay conexión. Lo único que se cachea "a lo seguro" son los archivos
// estáticos con nombre único por contenido (los .js/.css que genera Vite,
// que cambian de nombre cada vez que cambia su contenido) — esos nunca
// pueden quedar desactualizados por definición.
//
// Si algún día hay que forzar que todo el mundo tire la caché entera, basta
// con subir este número de versión.
const CACHE_VERSION = 'minichef-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Solo tocamos peticiones GET a nuestro propio dominio. Todo lo demás
  // (llamadas a Supabase, fuentes de Google, etc.) pasa directo a la red,
  // sin que este Service Worker interfiera nunca.
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) {
    return;
  }

  // Navegación (cargar la página / la app): red primero, caché como reserva
  // solo si no hay conexión. Así nunca se sirve una versión vieja teniendo
  // internet disponible.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('/')))
    );
    return;
  }

  // Archivos estáticos versionados por contenido (JS/CSS con hash en el
  // nombre, iconos): caché primero, y de paso se van guardando para que la
  // app funcione sin conexión la próxima vez.
  if (/\/assets\/|\/icons\//.test(new URL(request.url).pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
          return response;
        });
      })
    );
  }
});
