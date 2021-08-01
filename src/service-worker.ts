/// <reference lib="WebWorker" />

// export empty type because of tsc --isolatedModules flag
export type {};
declare const self: ServiceWorkerGlobalScope;

const cacheName = '::flappybird';
const version = 'v1.0.0';

const STATIC_CACHE_FILES: string[] = [
  '/',
  '/index.html',
  '/game.js',
  '/service-worker.js',
  '/style.css',
  '/fonts/PressStart2P-Regular.ttf',
  '/images/background-day.png',
  '/images/base.png',
  '/images/gameover.png',
  '/images/message.png',
  '/images/pipe-green.png',
  '/images/yellowbird-spritesheet.png',
  '/sounds/hit.wav',
  '/sounds/point.wav',
  '/sounds/wing.wav',
];

self.addEventListener('install', (event) => {
  console.log('[Service Worker]: installed');

  event.waitUntil(
    caches.open(version + cacheName).then((cache) => {
      return cache.addAll(STATIC_CACHE_FILES);
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker]: activated');

  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => {
            return key.indexOf(version) !== 0;
          })
          .map((key) => {
            return caches.delete(key);
          })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  event.respondWith(
    caches.match(request).then((response) => {
      return (
        response ||
        fetch(request).then((response) => {
          const responseClone = response.clone();

          caches.open(version + cacheName).then((cache) => {
            cache.put(request, responseClone);
          });

          return response;
        })
      );
    })
  );
});
