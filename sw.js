// sw.js (Service Worker)

const CACHE_NAME = 'triple-triad-cache-v1';
const urlsToCache = [
    './',
    './index.html',
    './style.css',
    './cards.js',
    './game.js',
    './ai.js',
    './main.js',
    './manifest.json'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // キャッシュにヒットした場合はそれを返す
                if (response) {
                    return response;
                }
                return fetch(event.request);
            }
            )
    );
});
