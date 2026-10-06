// Marques de l'appareil envoyées avec une demande de kit (une seule demande par personne et par
// campagne, même avec un autre compte — l'API compare aussi l'adresse IP) :
// - identifiant tiré au hasard, conservé dans le navigateur (localStorage + cookie d'un an) ;
// - empreinte du navigateur : SHA-256 de caractéristiques stables (aucune donnée personnelle).
const KEY = "edoto_device_id";

function readCookie(name) {
    const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return m ? decodeURIComponent(m[1]) : null;
}

function randomId() {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    const b = new Uint8Array(16);
    window.crypto.getRandomValues(b);
    return Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
}

export function getDeviceId() {
    if (typeof window === "undefined") return null;
    let id = null;
    try {
        id = localStorage.getItem(KEY);
    } catch {}
    if (!id) id = readCookie(KEY);
    if (!id || !/^[A-Za-z0-9-]{16,64}$/.test(id)) id = randomId();
    try {
        localStorage.setItem(KEY, id);
    } catch {}
    document.cookie = `${KEY}=${encodeURIComponent(id)}; max-age=31536000; path=/; SameSite=Lax`;
    return id;
}

function canvasSignature() {
    try {
        const c = document.createElement("canvas");
        c.width = 220;
        c.height = 40;
        const ctx = c.getContext("2d");
        ctx.textBaseline = "top";
        ctx.font = "16px Arial";
        ctx.fillStyle = "#C2185B";
        ctx.fillRect(2, 2, 60, 20);
        ctx.fillStyle = "#1F1B16";
        ctx.fillText("E·Doto Family ✓ 2026", 4, 12);
        return c.toDataURL();
    } catch {
        return "";
    }
}

function webglRenderer() {
    try {
        const gl = document.createElement("canvas").getContext("webgl");
        const ext = gl && gl.getExtension("WEBGL_debug_renderer_info");
        return ext ? `${gl.getParameter(ext.UNMASKED_VENDOR_WEBGL)}|${gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)}` : "";
    } catch {
        return "";
    }
}

let cachedFingerprint = null;

// null si le navigateur ne permet pas le calcul (contexte non sécurisé)
export async function getDeviceFingerprint() {
    if (typeof window === "undefined" || !window.crypto?.subtle) return null;
    if (cachedFingerprint) return cachedFingerprint;
    const n = window.navigator;
    const parts = [
        n.userAgent,
        n.platform,
        n.language,
        (n.languages || []).join(","),
        n.hardwareConcurrency,
        n.deviceMemory,
        n.maxTouchPoints,
        `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`,
        window.devicePixelRatio,
        Intl.DateTimeFormat().resolvedOptions().timeZone,
        webglRenderer(),
        canvasSignature(),
    ].join("||");
    const buf = await window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(parts));
    cachedFingerprint = Array.from(new Uint8Array(buf), (x) => x.toString(16).padStart(2, "0")).join("");
    return cachedFingerprint;
}

export async function deviceMarks() {
    return { device_id: getDeviceId(), device_fingerprint: await getDeviceFingerprint().catch(() => null) };
}
