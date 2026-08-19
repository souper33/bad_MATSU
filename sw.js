const CACHE = "balade-a-deux-v1";
const ASSETS = [
  "./",
  "index.html",
  "style.css",
  "script.js",
  "manifest.json",
  "assets/vinyl.jpg",
  "assets/photo-2.jpg",
  "assets/photo-3.jpg",
  "assets/photo-4.jpg",
  "assets/balade-a-deux.mp3"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
