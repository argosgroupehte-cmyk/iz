var CACHE = 'iz-v14';
var ASSETS = ['./', 'index.html', 'v2002.html', 'manifest.json', 'icon-192.png', 'icon-512.png'];

// Install : pre-cache (tolere les erreurs Cloudflare Access)
self.addEventListener('install', function(e) {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function(c) {
    return Promise.all(ASSETS.map(function(url) {
      return c.add(url).catch(function() { /* ignore si Cloudflare Access bloque */ });
    }));
  }));
});

// Activate : nettoyer les anciens caches
self.addEventListener('activate', function(e) {
  e.waitUntil(caches.keys().then(function(names) {
    return Promise.all(names.filter(function(n) { return n !== CACHE; }).map(function(n) { return caches.delete(n); }));
  }).then(function() { return self.clients.claim(); }));
});

// Fetch : network-first (Cloudflare Access peut bloquer le cache)
self.addEventListener('fetch', function(e) {
  e.respondWith(
    fetch(e.request).then(function(response) {
      if (response && response.status === 200) {
        var clone = response.clone();
        caches.open(CACHE).then(function(c) { c.put(e.request, clone); });
      }
      return response;
    }).catch(function() {
      return caches.match(e.request);
    })
  );
});
