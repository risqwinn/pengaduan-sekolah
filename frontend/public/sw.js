// Service Worker untuk PWA Sistem Pengaduan Sekolah Anonim
//
// PENTING (privasi): service worker ini SENGAJA tidak meng-cache respons
// apapun dari /api/* (data pengaduan, status, dsb). Yang di-cache hanya
// app shell (HTML/JS/CSS/ikon) supaya app tetap bisa dibuka saat offline,
// tapi data laporan selalu diambil langsung dari server saat online.

const CACHE_NAME = "pengaduan-sekolah-shell-v1";
const APP_SHELL = [
  "/",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Never cache API calls — always go to network so complaint data is fresh
  // and never persisted in the browser's cache storage.
  if (url.pathname.startsWith("/api/")) {
    return; // let the browser handle it normally (network only)
  }

  // Only handle GET requests for same-origin app shell assets
  if (event.request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkFetch = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached); // offline fallback to cache

      return cached || networkFetch;
    })
  );
});
