// Appels du dashboard du point de retrait (le point est identifié par son jeton côté API)
export const API = process.env.NEXT_PUBLIC_REST_API_ENDPOINT;

export function token() {
    try {
        return localStorage.getItem("token");
    } catch {
        return null;
    }
}

export async function api(path, init = {}) {
    const t = token();
    const res = await fetch(`${API}/${path}`, {
        ...init,
        headers: {
            "Content-Type": "application/json",
            ...(t ? { Authorization: `Bearer ${t}` } : {}),
            ...(init.headers || {}),
        },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        const err = new Error(Array.isArray(data?.message) ? data.message.join(", ") : data?.message || "Erreur serveur");
        err.status = res.status;
        throw err;
    }
    return data;
}

export const qs = (params) => {
    const p = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") p.set(k, String(v));
    });
    const s = p.toString();
    return s ? `?${s}` : "";
};

export const fcfa = (n) => `${Math.round(Number(n) || 0).toLocaleString("fr-FR")} FCFA`;

// Dates renvoyées en UTC par l'API ; affichées à l'heure du Bénin
const TZ = "Africa/Porto-Novo";
export const dateTime = (iso) =>
    iso ? new Date(iso).toLocaleString("fr-FR", { timeZone: TZ, day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";
export const dateOnly = (iso) =>
    iso ? new Date(iso).toLocaleDateString("fr-FR", { timeZone: TZ, day: "2-digit", month: "short", year: "numeric" }) : "—";

export const isExpired = (iso) => !!iso && new Date(iso).getTime() < Date.now();

// Valeurs par défaut des filtres de période, à la date du jour au Bénin
export function todayKeys() {
    const d = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    return { day: d.slice(0, 10), month: d.slice(0, 7), year: d.slice(0, 4) };
}
