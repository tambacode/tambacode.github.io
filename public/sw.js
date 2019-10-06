const cacheVersion = "0.2";
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
    fetch(event.request).then(responseUrl => {
      if (responseUrl.status === 404) {
        return caches.match('./notfound.html');
      }
      return caches.open(cacheName)
        .then(cache => {
          cache.put(event.request, responseUrl.clone());
          return responseUrl;
      });
    })
    .catch(error => {
      //caches.match(event.request.url);
      return caches.match('./offline.html');
    })
  );
});