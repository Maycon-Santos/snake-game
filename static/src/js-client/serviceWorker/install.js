const CACHE_NAME = 'static-v2';

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll([
            '/',
            '/index.html',
            '/manifest.json',
            '/js/snakeGame.js'
        ]))
    )
});