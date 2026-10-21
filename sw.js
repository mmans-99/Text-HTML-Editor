// Service worker: caches the app so it works offline.
// Change CACHE_NAME (e.g. v2) whenever you upload a new version of the app.
const CACHE_NAME = 'txt-editor-v3';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  // Network first (so updates arrive), fall back to the saved copy when offline.
  event.respondWith(
    fetch(event.request)
      .then((resp) => {
        const copy = resp.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {});
        return resp;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html')))
  );
});
