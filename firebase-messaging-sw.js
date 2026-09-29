/* Recibe los push y los muestra. Sin librerías: mensajes "data" de FCM. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('push', e => {
  let p = {}; try { p = e.data.json(); } catch (_) {}
  const d = p.data || p.notification || p;
  e.waitUntil(self.registration.showNotification(d.title || 'Mi Banco', {
    body: d.body || '', tag: d.tag || undefined, icon: '/apple-touch-icon.png', badge: '/favicon-32.png'
  }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(l => {
    for (const c of l) if ('focus' in c) return c.focus();
    return self.clients.openWindow('/');
  }));
});
