// Service worker: app en caché (offline) y datos con "red primero, caché si no hay conexión".
const VERSION = 'v46-2026-11-27';
const SHELL = `shell-${VERSION}`, DATA = 'data-v1', FONTS = 'fonts-v1';
const FILES = ['./', 'index.html', 'css/app.css', 'js/app.js', 'js/music.js', 'js/songs.js', 'js/grupos.js', 'js/datasource.js', 'js/demo.js', 'js/apidatasource.js', 'js/config.js',
  'manifest.webmanifest', 'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'data/songs.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('shell-') && k !== SHELL).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

const networkFirst = async (req, cacheName) => {
  const c = await caches.open(cacheName);
  // no-cache: revalida siempre con el servidor (evita los 10 min de caché de GitHub Pages)
  try { const r = await fetch(req, { cache: 'no-cache' }); if (r.ok) c.put(req, r.clone()); return r; }
  catch (e) { return (await c.match(req)) || (await caches.match(req)) || Response.error(); }
};
const staleWhileRevalidate = async (req, cacheName) => {
  const c = await caches.open(cacheName), hit = await c.match(req);
  const net = fetch(req).then(r => { if (r.ok || r.type === 'opaque') c.put(req, r.clone()); return r; }).catch(() => hit);
  return hit || net;
};

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) return e.respondWith(staleWhileRevalidate(e.request, FONTS));
  if (url.origin !== location.origin) return;
  if (url.pathname.endsWith('.json')) return e.respondWith(networkFirst(e.request, DATA));
  // Red primero también para la app: siempre la última versión con internet; la caché cubre sin conexión.
  e.respondWith(networkFirst(e.request, SHELL));
});
