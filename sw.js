var CACHE = 'iz-v11';
var ASSETS = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png'];

// Install : pre-cache tous les assets
self.addEventListener('install', function(e) {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function(c) { return c.addAll(ASSETS); }));
});

// Activate : nettoyer les anciens caches
self.addEventListener('activate', function(e) {
  e.waitUntil(caches.keys().then(function(names) {
    return Promise.all(names.filter(function(n) { return n !== CACHE; }).map(function(n) { return caches.delete(n); }));
  }).then(function() { return self.clients.claim(); }));
});

// Fetch : cache-first + mise a jour en arriere-plan (stale-while-revalidate)
// = chargement instantane depuis le cache, zero reseau, zero batterie
// puis mise a jour silencieuse pour la prochaine ouverture
self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      var fetchPromise = fetch(e.request).then(function(response) {
        if (response && response.status === 200) {
          var clone = response.clone();
          caches.open(CACHE).then(function(c) { c.put(e.request, clone); });
        }
        return response;
      }).catch(function() { return cached; });

      return cached || fetchPromise;
    })
  );
});
