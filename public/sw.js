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

// Notifications push (04/11/2026, rapports/PLAN_NOTIFICATIONS_PUSH.md) : affichées telles qu'envoyées par l'API,
// textes discrets ; rien n'est gardé sur le téléphone. Au toucher : la page indiquée, dans une fenêtre déjà ouverte si possible.
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = {};
  }
  const url = typeof data.url === "string" && data.url.startsWith("/") ? data.url : "/";
  event.waitUntil(
    self.registration.showNotification(data.title || "E.doto family", {
      body: data.body || "",
      icon: "/app/icon-192.png",
      tag: data.tag || "edoto",
      data: { url },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL((event.notification.data && event.notification.data.url) || "/", self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((wins) => {
      for (const w of wins) {
        if (w.url.startsWith(self.location.origin) && "focus" in w) {
          return w.navigate(url).then((c) => (c || w).focus()).catch(() => w.focus());
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
