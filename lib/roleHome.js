// Espaces réservés par rôle (19/10/2026) : une seule règle pour la connexion, le menu de l'avatar
// et les pages protégées. Corrige les redirections « parfois » ratées : l'adresse mémorisée
// (redirect_after_login) pouvait venir d'une autre visite (fiche produit, dashboard point de retrait…)
// et passait avant le rôle du compte.

export const ROLE_SPACES = {
    sponsor: "/sponsor",
    super_pickuppoint: "/pickup-dashboard",
    doctor: "/medecin",
    health_center: "/centre",
};

// Pages réservées à un rôle : un autre compte n'y est jamais renvoyé après connexion
const RESERVED = Object.entries(ROLE_SPACES).map(([role, path]) => ({ role, path }));

const startsWithPath = (url, path) => url === path || url.startsWith(`${path}?`) || url.startsWith(`${path}/`) || url.startsWith(`${path}#`);

/** Espace d'accueil du rôle (null = client ou admin : pas d'espace dédié sur le site) */
export function roleHome(role) {
    return ROLE_SPACES[role] || null;
}

// Adresse du site seulement (06/11/2026) : « //autre-site » ou « /\autre-site » commencent aussi par « / »
// et mèneraient à un autre site. L'adresse est lue comme le ferait le navigateur, sur une origine fictive :
// elle n'est gardée que si elle y reste. Le chemin rendu est normalisé (« /a/../b » devient « /b »).
const BASE = "https://edoto.invalid";
function samePath(stored) {
    if (typeof stored !== "string" || !stored.startsWith("/")) return "";
    try {
        const u = new URL(stored, BASE);
        return u.origin === BASE ? u.pathname + u.search + u.hash : "";
    } catch {
        return "";
    }
}

/** Page où envoyer le compte juste connecté */
export function pathAfterLogin(role, stored) {
    const wanted = samePath(stored);
    const home = roleHome(role);
    if (home) {
        // Compte à espace dédié : l'adresse mémorisée n'est suivie que si elle est dans son espace
        // (ou, pour un centre, la fiche ouverte par le code QR)
        if (wanted && startsWithPath(wanted, home)) return wanted;
        if (role === "health_center" && wanted && startsWithPath(wanted, "/dossier")) return wanted;
        return home;
    }
    // Client : l'adresse mémorisée est suivie sauf si elle appartient à l'espace d'un autre rôle
    if (wanted && !RESERVED.some((r) => startsWithPath(wanted, r.path))) return wanted;
    return "/";
}

export function rememberRedirect(path) {
    try { localStorage.setItem("redirect_after_login", path); } catch { }
}

export function takeRedirect() {
    try {
        const v = localStorage.getItem("redirect_after_login");
        localStorage.removeItem("redirect_after_login");
        return v;
    } catch {
        return null;
    }
}
