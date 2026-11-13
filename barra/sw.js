/* Portal de Barra — cache offline.
   App y datos: primero la red (así una versión nueva se ve al tiro); si no hay señal o tarda más de 3 s,
   lo guardado. Fotos: cache permanente al abrirlas. */
const V = 'barra-v7';   // subir en cada despliegue
const SHELL = ['./', 'index.html', 'data/recetas.json', 'data/ranking.json', 'data/armatumix.json', 'img/placeholder.webp',
               'assets/belgan.ttf', 'assets/iso-blanco.png', 'assets/favicon.png', 'assets/app-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(SHELL.map(u => new Request(u, {cache: 'reload'})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks =>
    Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if(e.request.method !== 'GET') return;
  if(url.origin !== location.origin) return;
  if(url.pathname.includes('/.netlify/functions/')) return;   // anuncios, mensajes y Arma tu Mix: siempre en vivo

  if(url.pathname.includes('/img/')){
    e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(r => {
      if(r.ok){ const cp = r.clone(); caches.open(V).then(c => c.put(e.request, cp)); }
      return r;
    })));
    return;
  }
  e.respondWith((async () => {
    const red = fetch(e.request, {cache: 'no-cache'}).then(r => {
      if(r.ok){ const cp = r.clone(); caches.open(V).then(c => c.put(e.request, cp)); }
      return r;
    });
    const espera = new Promise(res => setTimeout(res, 3000));
    try{
      const r = await Promise.race([red, espera]);
      if(r) return r;
    }catch(err){}
    const hit = await caches.match(e.request, {ignoreSearch: true});
    return hit || red;
  })());
});
