// Kill-switch: reemplaza cualquier Service Worker antiguo (de una versión previa
// con vite-plugin-pwa) que haya quedado instalado en el dispositivo. Se instala,
// borra toda la caché vieja, se desregistra a sí mismo y recarga la página para
// que el dispositivo vuelva a pedir el código real desde el servidor.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      await self.registration.unregister();
      const clientsList = await self.clients.matchAll({ type: 'window' });
      clientsList.forEach((client) => client.navigate(client.url));
    })()
  );
});
