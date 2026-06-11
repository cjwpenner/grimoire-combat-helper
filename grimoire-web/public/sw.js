const CACHE_VERSION = 'grimoire-v2';

// Derive the base path from the registration scope so this file works
// regardless of where the app is deployed (e.g. /grimoire-combat-helper/).
const BASE = new URL(self.registration.scope).pathname;

const PRECACHE_URLS = [
  BASE,
  BASE + 'index.html',
  BASE + 'manifest.json',
  BASE + 'grimoire.json',
  BASE + 'icon-192.png',
  BASE + 'icon-512.png',
];

// Install: pre-cache the app shell and monster data.
// The JS/CSS bundles have content-hashed names only known at build time, so we
// parse them out of index.html — otherwise the first visit loads them before
// this worker takes control and they would never enter the cache.
async function precache() {
  const cache = await caches.open(CACHE_VERSION);
  await cache.addAll(PRECACHE_URLS);
  const response = await fetch(BASE + 'index.html');
  const html = await response.text();
  const assetUrls = [...html.matchAll(/(?:src|href)="([^"]*\/assets\/[^"]+)"/g)]
    .map((match) => match[1]);
  if (assetUrls.length > 0) {
    await cache.addAll(assetUrls);
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(precache());
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name !== CACHE_VERSION)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin GET requests
  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  // SPA navigations (e.g. /monster/42): network-first, fall back to the
  // cached app shell so deep links work offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            // Keep the cached shell current so offline loads after a deploy
            // don't serve a stale index.html pointing at pruned assets.
            const clone = response.clone();
            caches.open(CACHE_VERSION).then((cache) =>
              cache.put(BASE + 'index.html', clone)
            );
          }
          return response;
        })
        .catch(() => caches.match(BASE + 'index.html', { ignoreVary: true }))
    );
    return;
  }

  // Monster data: stale-while-revalidate — serve cached immediately,
  // refresh the cache in the background for next load.
  if (url.pathname.endsWith('grimoire.json')) {
    event.respondWith(
      caches.open(CACHE_VERSION).then((cache) =>
        // ignoreVary: servers like vite preview send "Vary: Origin", which would
        // make exact-match lookups silently fail for crossorigin module scripts.
        cache.match(request, { ignoreSearch: true, ignoreVary: true }).then((cached) => {
          const fetched = fetch(request)
            .then((response) => {
              if (response.ok) {
                cache.put(request, response.clone());
              }
              return response;
            })
            .catch(() => cached);
          return cached || fetched;
        })
      )
    );
    return;
  }

  // Static assets (Vite emits content-hashed filenames): cache-first
  if (
    request.destination === 'image' ||
    request.destination === 'font' ||
    request.destination === 'style' ||
    request.destination === 'script'
  ) {
    event.respondWith(
      caches.open(CACHE_VERSION).then((cache) =>
        cache.match(request, { ignoreVary: true }).then((cached) => {
          const fetched = fetch(request).then((response) => {
            if (response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          });
          return cached || fetched;
        })
      )
    );
    return;
  }

  // Everything else: network-first with cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request, { ignoreVary: true }))
  );
});
