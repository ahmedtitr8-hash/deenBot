const V='qiyam-v1',SHELL=['./', 'index.html', 'manifest.webmanifest', 'css/base.css', 'css/components.css', 'css/pages.css', 'js/adhan.js', 'js/app.js', 'js/azkar.js', 'js/cities.js', 'js/data.js', 'js/install.js', 'js/nav.js', 'js/player.js', 'js/prayer.js', 'js/qibla.js', 'js/quran.js', 'js/settings.js', 'js/store.js', 'js/theme.js', 'js/utils.js', 'js/verse.js', 'data/config.json', 'data/cities.json', 'data/muezzins.json', 'data/radios.json', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/logo.svg'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request,u=new URL(r.url);if(r.method!=='GET')return;
  if(u.origin===location.origin&&u.pathname.includes('/data/')){ /* المحتوى: الشبكة أولًا ثم النسخة المحفوظة */
    e.respondWith(fetch(r).then(x=>{const k=x.clone();caches.open(V).then(c=>c.put(r,k));return x}).catch(()=>caches.match(r)));return}
  if(u.origin===location.origin){ /* التطبيق: النسخة المحفوظة فورًا وتُحدَّث بالخلفية */
    e.respondWith(caches.match(r,{ignoreSearch:true}).then(c=>{const n=fetch(r).then(x=>{const k=x.clone();caches.open(V).then(s=>s.put(r,k));return x}).catch(()=>c);return c||n}));return}
  if(u.host.includes('fonts.g')){e.respondWith(caches.match(r).then(c=>c||fetch(r).then(x=>{const k=x.clone();caches.open(V).then(s=>s.put(r,k));return x})))}});
