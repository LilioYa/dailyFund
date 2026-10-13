// Offline support for the installed web app.
// Hashed build files never change, so they are served from the cache first; everything else
// (pages, manifest) goes to the network first so updates arrive, falling back to the cache offline.
const CACHE = 'dailyfund-v1';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

function isHashedAsset(url) {
  return url.pathname.includes('/_expo/static/') || url.pathname.includes('/assets/');
}

function cacheResponse(request, response) {
  if (response.ok) {
    const copy = response.clone();
    caches.open(CACHE).then((cache) => cache.put(request, copy));
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  if (isHashedAsset(url)) {
    event.respondWith(
      caches
        .match(request)
        .then(
          (cached) => cached || fetch(request).then((response) => cacheResponse(request, response)),
        ),
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => cacheResponse(request, response))
      .catch(() =>
        caches
          .match(request)
          .then((cached) => cached || caches.match(new URL('./', self.registration.scope).href)),
      ),
  );
});
