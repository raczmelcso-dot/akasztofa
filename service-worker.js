const CACHE_NAME = "akasztófa-v1";
const ASSETS = [
  "./index.html",
  "./manifest.json"
];

// Telepítéskor cache-eljük az alapfájlokat
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Aktiváláskor töröljük a régi cache-t
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Kérések kezelése: először hálózat, ha nincs akkor cache
self.addEventListener("fetch", e => {
  // Firebase kéréseket ne cache-eljük
  if (e.request.url.includes("firebase") || e.request.url.includes("googleapis")) return;
  e.respondWith(
    fetch(e.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});
