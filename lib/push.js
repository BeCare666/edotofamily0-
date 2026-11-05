import { useCallback, useEffect, useState } from "react";

// Notifications push (04/11/2026, rapports/PLAN_NOTIFICATIONS_PUSH.md, étape 2.2).
// Activation seulement à la demande de la personne (bouton dans Mon espace, ou proposition après une action) :
// jamais à l'ouverture du site. L'abonnement est rattaché au compte connecté (API /push/subscribe).
const API = process.env.NEXT_PUBLIC_REST_API_ENDPOINT;
const LATER_KEY = "edoto-push-later"; // « Plus tard » sur la proposition après action : 30 jours sans la reproposer
const LATER_DAYS = 30;

const token = () => {
    try { return localStorage.getItem("token"); } catch { return null; }
};

export function pushSupported() {
    return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

const toKey = (b64) => {
    const pad = "=".repeat((4 - (b64.length % 4)) % 4);
    const raw = atob((b64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
    return Uint8Array.from(raw, (c) => c.charCodeAt(0));
};
const b64url = (buf) =>
    btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

async function registration() {
    // Le service worker est enregistré au chargement (lib/registerServiceWorker.js) ; on attend qu'il soit prêt
    const existing = await navigator.serviceWorker.getRegistration();
    if (!existing) await navigator.serviceWorker.register("/sw.js");
    return navigator.serviceWorker.ready;
}

/** "unsupported" | "denied" | "on" | "off" */
export async function pushState() {
    if (!pushSupported()) return "unsupported";
    if (Notification.permission === "denied") return "denied";
    try {
        const reg = await navigator.serviceWorker.getRegistration();
        const sub = reg ? await reg.pushManager.getSubscription() : null;
        return sub && Notification.permission === "granted" ? "on" : "off";
    } catch {
        return "off";
    }
}

/** Demande l'autorisation, abonne l'appareil et l'enregistre pour le compte connecté. Renvoie le nouvel état. */
export async function enablePush() {
    if (!pushSupported()) return "unsupported";
    const t = token();
    if (!t) throw new Error("Connectez-vous pour activer les notifications.");
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return permission === "denied" ? "denied" : "off";
    const res = await fetch(`${API}/push/public-key`);
    const { key } = res.ok ? await res.json() : {};
    if (!key) throw new Error("Les notifications ne sont pas encore disponibles. Réessayez plus tard.");
    const reg = await registration();
    let sub = await reg.pushManager.getSubscription();
    if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: toKey(key) });
    const save = await fetch(`${API}/push/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${t}` },
        body: JSON.stringify({ endpoint: sub.endpoint, p256dh: b64url(sub.getKey("p256dh")), auth: b64url(sub.getKey("auth")) }),
    });
    if (!save.ok) throw new Error("Impossible d'activer les notifications. Réessayez dans quelques instants.");
    return "on";
}

/** Retire l'appareil (navigateur et compte). Renvoie le nouvel état. */
export async function disablePush() {
    if (!pushSupported()) return "unsupported";
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = reg ? await reg.pushManager.getSubscription() : null;
    if (sub) {
        const t = token();
        if (t) {
            await fetch(`${API}/push/subscribe`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${t}` },
                body: JSON.stringify({ endpoint: sub.endpoint }),
            }).catch(() => undefined);
        }
        await sub.unsubscribe().catch(() => undefined);
    }
    return "off";
}

export function usePush() {
    const [state, setState] = useState("loading");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        let alive = true;
        pushState().then((s) => alive && setState(s));
        return () => { alive = false; };
    }, []);

    const run = useCallback(async (fn) => {
        setBusy(true);
        setError("");
        try {
            setState(await fn());
        } catch (e) {
            setError(e?.message || "Une erreur est survenue.");
        } finally {
            setBusy(false);
        }
    }, []);

    return { state, busy, error, enable: () => run(enablePush), disable: () => run(disablePush) };
}

/** Proposition après action : seulement si l'appareil peut les recevoir, n'est pas abonné, et pas « Plus tard » récent */
export function shouldOfferPush(state) {
    if (state !== "off") return false;
    try {
        const later = Number(localStorage.getItem(LATER_KEY) || 0);
        return !(later && Date.now() - later < LATER_DAYS * 86400000);
    } catch {
        return true;
    }
}

export function pushLater() {
    try { localStorage.setItem(LATER_KEY, String(Date.now())); } catch { /* sans stockage : la proposition reviendra */ }
}
