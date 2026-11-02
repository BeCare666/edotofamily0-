// Application installable E.doto family (02/11/2026).
// Rôle unique : afficher /offline.html quand une page ne peut pas être chargée faute de connexion.
// Rien d'autre n'est gardé sur le téléphone : ni pages, ni réponses de l'API, ni données de compte ou de santé.
const CACHE = "edoto-app-v1";
const OFFLINE = "/offline.html";
const FILES = [OFFLINE, "/app/icon-192.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Seulement la navigation (ouverture d'une page) : toujours le réseau d'abord, la page hors connexion en cas d'échec
self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") return;
  event.respondWith(fetch(event.request).catch(() => caches.match(OFFLINE)));
});
