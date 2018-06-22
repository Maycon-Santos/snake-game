self.addEventListener('activate', e => e.waitUntil(
    caches.keys().then(keys => Promise.all(
        keys.filter(key => key.indexOf(CACHE_NAME) !== 0)
            .map(key => caches.delete(key))
    ))
));