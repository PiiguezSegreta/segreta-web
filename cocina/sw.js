/* Portal de Cocina — cache offline.
   Shell y datos: stale-while-revalidate. Fotos: cache permanente al abrirlas. */
const V = 'cocina-v1';
const SHELL = ['./', 'index.html', 'data/recetas.json', 'img/placeholder.webp',
               'assets/belgan.ttf', 'assets/iso-blanco.png', 'assets/iso-ocre.png', 'assets/favicon.png', 'assets/app-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks =>
    Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if(e.request.method !== 'GET') return;
  if(url.pathname.includes('/.netlify/functions/')) return;   // anuncios y envíos siempre en vivo

  // fotos: primero caché, y si no está se guarda al vuelo
  if(url.pathname.includes('/img/')){
    e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(r => {
      if(r.ok){ const cp = r.clone(); caches.open(V).then(c => c.put(e.request, cp)); }
      return r;
    })));
    return;
  }
  // shell y datos: sirve lo cacheado y refresca en segundo plano
  e.respondWith(caches.match(e.request).then(hit => {
    const net = fetch(e.request).then(r => {
      if(r.ok){ const cp = r.clone(); caches.open(V).then(c => c.put(e.request, cp)); }
      return r;
    }).catch(() => hit);
    return hit || net;
  }));
});
