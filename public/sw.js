const cacheVersion = "0.3";
const cacheName = `sharefarm-${cacheVersion}`;
const cachedFiles = [
  "./index.html",
  "./offline.html",
  "./notfound.html"
];
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll(cachedFiles)
      .then(() => self.skipWaiting());
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cache) {
          if (cache.startsWith('sharefarm-') && cacheName !== cache) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
    .then(response => {
      if (response) {
        return response;
      }
      return fetch(event.request).then(response => {
        if (response.status === 404) {
          return caches.match('./notfound.html');
        }
        return caches.open(cacheName).then(cache => {
          cache.put(event.request.url, response.clone());
          return response;
        });
      });
    }).catch(error => {
      return caches.match('./offline.html');
    })
  );
});