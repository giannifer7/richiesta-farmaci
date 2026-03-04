const CACHE = 'richiesta-farmaci-v2';
const FILES = ['./', 'index.html', 'settings.html', 'medicines.html',
               'index.js', 'settings.js', 'medicines.js', 'sw.js',
               'style.css', 'manifest.json', 'icon-192.png', 'icon-512.png'];

declare const self: ServiceWorkerGlobalScope;

self.addEventListener('install', (e: ExtendableEvent) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e: ExtendableEvent) => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e: FetchEvent) => {
  e.respondWith(caches.match(e.request).then(r => r ?? fetch(e.request)));
});
