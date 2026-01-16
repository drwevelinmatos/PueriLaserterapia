const CACHE_NAME = "laserterapia-pwa-v1";

const ASSETS = [
  "./",
  "./laserterapia_app.html",
  "./manifest.webmanifest",
  "./logo_azul.png",
  "./Gotham%20Book.otf",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

// Instala e faz cache dos arquivos principais
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Ativa e limpa caches antigos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null))
      )
    )
  );
  self.clients.claim();
});

// Estratégia: Cache-first (rápido e offline) + fallback para rede
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((resp) => {
          // opcional: cachear novos GETs (útil se você adicionar arquivos depois)
          if (event.request.method === "GET") {
            const copy = resp.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return resp;
        })
        .catch(() => {
          // fallback offline: devolve o app
          return caches.match("./laserterapia_app.html");
        });
    })
  );
});
