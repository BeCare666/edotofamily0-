// Application installable (02/11/2026) : service worker public/sw.js (page hors connexion seulement).
// En production uniquement ; en cas d'échec, le site marche normalement.
export function registerServiceWorker() {
    if (typeof window === "undefined" || !("serviceWorker" in navigator) || process.env.NODE_ENV !== "production") return;
    const go = () => navigator.serviceWorker.register("/sw.js").catch(() => { /* sans service worker : le site marche normalement */ });
    // Page déjà chargée (cas habituel quand ce code s'exécute) : tout de suite ; sinon à la fin du chargement
    if (document.readyState === "complete") go();
    else window.addEventListener("load", go, { once: true });
}
