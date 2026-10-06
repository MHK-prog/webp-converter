const CACHE_NAME = 'webp-tool-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './vendor/jszip.min.js',
  './icons/icon-192.png',
  './icons/icon-512.png'
].map(path => new URL(path, self.registration.scope).toString());

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(
    keys.filter(key => key.startsWith('webp-tool-') && key !== CACHE_NAME)
      .map(key => caches.delete(key))
  )).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== self.location.origin) return;
  e.respondWith(caches.match(e.request).then((cached) => {
    if (cached) return cached;
    return fetch(e.request).catch(() => {
      if (e.request.mode === 'navigate') {
        return caches.match(new URL('./index.html', self.registration.scope).toString());
      }
      return Response.error();
    });
  }));
});
