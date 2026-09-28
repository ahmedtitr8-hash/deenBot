const CACHE = 'app-v3';
const FILES = ['./','./index.html','./style.css','./app.js','./firebase-config.js','./manifest.json','./azkar.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.match(e.request).then(r => {
    const f = fetch(e.request).then(n => { caches.open(CACHE).then(c => c.put(e.request, n.clone())); return n; }).catch(() => r);
    return r || f;
  }));
});
