const CACHE_NAME = 'casinoctf-v1';

const APP_SHELL = [
  '/',
  '/manifest.json',
  '/icon-192.svg',
  '/icon-512.svg',
];

// Install: cache app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// Activate: remove old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch strategy:
// - API & socket.io → network only (never cache)
// - Everything else → network first, fall back to cache
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Skip non-GET and API/socket requests
  if (event.request.method !== 'GET') return;
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/socket.io')) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache successful responses for app shell assets
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
