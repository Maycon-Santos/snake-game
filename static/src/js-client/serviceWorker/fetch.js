self.addEventListener('fetch', e => e.respondWith(
    caches.match(e.request).then(cacheResponse => cacheResponse || fetch(e.request))
));