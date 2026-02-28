// sw.js (Service Worker)

const CACHE_NAME = 'triple-triad-cache-v1.3.1';
const urlsToCache = [
    './',
    './index.html',
    './style.css',
    './cards.js',
    './game.js',
    './ai.js',
    './main.js',
    './npcs.js',
    './audio.js',
    './manifest.json',
    './favicon.png'
];

self.addEventListener('install', event => {
    // 新しいService Workerをすぐにアクティブにする
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache: ' + CACHE_NAME);
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('activate', event => {
    // 古いキャッシュを削除
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // キャッシュがある場合はそれを返すが、バックグラウンドでネットワークから最新を取得して更新する（Stale-While-Revalidate）
                const fetchPromise = fetch(event.request).then(networkResponse => {
                    if (networkResponse && networkResponse.status === 200) {
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, networkResponse.clone());
                        });
                    }
                    return networkResponse;
                }).catch(() => {
                    // オフライン時のフォールバックなどは必要に応じて
                });

                return response || fetchPromise;
            })
    );
});
