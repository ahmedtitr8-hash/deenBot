const CACHE='app-v4',DATA='data-v4';
const FILES=['./','./index.html','./style.css','./app.js','./firebase-config.js','./manifest.json','./azkar.json','./icons/icon-192.png','./icons/icon-512.png'];
const HOSTS=['api.quran.com','api.alquran.cloud','fonts.googleapis.com','fonts.gstatic.com','www.gstatic.com','cdn.jsdelivr.net'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>Promise.all(FILES.map(f=>c.add(f).catch(()=>0)))));
  self.skipWaiting();
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE&&k!==DATA).map(k=>caches.delete(k)))));
  self.clients.claim();
});
const swr=async(req,name)=>{
  const c=await caches.open(name),hit=await c.match(req);
  const net=fetch(req).then(r=>{if(r&&(r.ok||r.type==='opaque'))c.put(req,r.clone());return r}).catch(()=>hit);
  return hit||net;
};
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(u.origin===location.origin)return e.respondWith(swr(r,CACHE));
  if(HOSTS.includes(u.hostname))e.respondWith(swr(r,DATA));
});
