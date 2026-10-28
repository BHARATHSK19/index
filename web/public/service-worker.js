/* OJIX — retired service worker (Build 04).
 * The old static site cached pages with a service worker. The React site does not use one.
 * Browsers that still have the old worker fetch this file, which clears its caches and removes it. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k.startsWith('ojix-site-')).map((k) => caches.delete(k)));
    await self.registration.unregister();
    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach((c) => c.navigate(c.url));
  })());
});
