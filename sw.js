/* Service worker: hace que la app abra sin internet y sea instalable. */
const CACHE = 'mibanco-v3';
const SHELL = ['./', './index.html', './config.js', './ux-suave.css', './manifest.webmanifest',
               './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Nada de Firebase se cachea: necesita ir siempre a la red.
  if (url.hostname.endsWith('googleapis.com') || url.hostname.endsWith('firebaseio.com')) return;

  // La pagina: red primero, cache si no hay internet.
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => {
      caches.open(CACHE).then(c => c.put('./index.html', r.clone()));
      return r;
    }).catch(() => caches.match('./index.html')));
    return;
  }

  // Todo lo demas: cache primero.
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
    if (r.ok && (url.origin === location.origin || url.hostname === 'www.gstatic.com' || url.hostname === 'fonts.gstatic.com' || url.hostname === 'fonts.googleapis.com')) {
      const copy = r.clone();
      caches.open(CACHE).then(c => c.put(req, copy));
    }
    return r;
  })));
});
