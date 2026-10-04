/* Skyhold service worker: offline app shell (cache-first), fresh rewards snapshot (network-first),
   and never caches Apps Script sync calls. Bump VERSION when files change. */
const VERSION='skyhold-v1.0.1';
const SHELL=['./','index.html','manifest.json','css/screens.css','css/app.css',
 'js/gen-data.js','js/content.js','js/sun.js','js/shared-reducer.js','js/sync.js','js/core.js','js/logic.js',
 'js/screens-main.js','js/screens-more.js','js/screens-calm.js','js/notif.js','js/app.js',
 'icons/icon-192.png','icons/icon-512.png','icons/apple-touch-icon.png',
 'img/sky-home-snow.jpg','img/sky-home-carson.jpg','img/sky-keep.jpg','img/sky-keep2.jpg','img/sky-shieldmates2.jpg',
 'img/sky-kitchen.jpg','img/sky-keeping.jpg','img/sky-hoard.jpg','img/sky-calm.jpg','data/rewards.json'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(VERSION).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET' || u.origin!==location.origin) return;          // Apps Script + external links: straight to network
  if(u.pathname.endsWith('/data/rewards.json')){
    e.respondWith(fetch(e.request).then(r=>{ const c=r.clone(); caches.open(VERSION).then(x=>x.put(e.request,c)); return r; }).catch(()=>caches.match(e.request)));
    return; }
  e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(hit=>hit||fetch(e.request).then(r=>{ if(r.ok){ const c=r.clone(); caches.open(VERSION).then(x=>x.put(e.request,c)); } return r; })));
});
self.addEventListener('notificationclick',e=>{ e.notification.close(); e.waitUntil(self.clients.matchAll({type:'window'}).then(cs=>cs.length?cs[0].focus():self.clients.openWindow('./index.html#/home'))); });
