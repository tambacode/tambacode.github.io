const cacheVersion = "0.4";
const cacheName = `sharefarm-${cacheVersion}`;
const cachedFiles = [
    "./imgs/noConnection_Icon.jpg",
    "./js/auth.js",
    "./js/db.js",
    "./js/main.js",
    "./js/messages.js",
    "./js/sharedAd.js",
    "./js/ui.js",
    "./js/user.js",
    "./ad_detail.html",
    "./ad_list.html",
    "./ad_list_favorites.html",
    "./ad_search.html",
    "./index.html",
    "./messages.html",
    "./notfound.html"
    "./offline.html",
    "./privacy_policy.html",
    "./terms_of_service.html",
    "./user_info.html",
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
        caches.match(event.request).then(response => {
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
            var sPath = event.request.url;
            sPath = sPath.substring(sPath.lastIndexOf('/') + 1);
            sPath = sPath.split("?")[0];
          
            if (sPath == "ad_detail.html") {
                return caches.match('./ad_detail.html');  
            } else if (sPath == "message.html") {
                return caches.match('./message.html');  
            } else if (sPath == "ad_search.html") {
                return caches.match('./ad_search.html');
            } else {
                return caches.match('./offline.html');
            }
        })
    );
});