'use strict';
self.addEventListener('activate', function (e) {
    return e.waitUntil(caches.keys().then(function (keys) {
        return Promise.all(keys.filter(function (key) {
            return key.indexOf(CACHE_NAME) !== 0;
        }).map(function (key) {
            return caches.delete(key);
        }));
    }));
});
self.addEventListener('fetch', function (e) {
    return e.respondWith(caches.match(e.request).then(function (cacheResponse) {
        return cacheResponse || fetch(e.request);
    }));
});
var CACHE_NAME = 'static-v2';
self.addEventListener('install', function (e) {
    e.waitUntil(caches.open(CACHE_NAME).then(function (cache) {
        return cache.addAll(['/', '/index.html', '/manifest.json', '/js/snakeGame.js']);
    }));
});
//# sourceMappingURL=serviceWorker.js.map
