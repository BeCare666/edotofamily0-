// Outils géographiques (coordonnées au format [lng, lat], distances en mètres).

const R = 6371008.8;
const toRad = (d) => (d * Math.PI) / 180;
const toDeg = (r) => (r * 180) / Math.PI;

export function haversine(a, b) {
    const dLat = toRad(b[1] - a[1]);
    const dLng = toRad(b[0] - a[0]);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a[1])) * Math.cos(toRad(b[1])) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function bearing(a, b) {
    const y = Math.sin(toRad(b[0] - a[0])) * Math.cos(toRad(b[1]));
    const x =
        Math.cos(toRad(a[1])) * Math.sin(toRad(b[1])) -
        Math.sin(toRad(a[1])) * Math.cos(toRad(b[1])) * Math.cos(toRad(b[0] - a[0]));
    return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

// Distances cumulées le long d'une ligne
export function cumulativeDistances(coords) {
    const cum = [0];
    for (let i = 1; i < coords.length; i++) cum.push(cum[i - 1] + haversine(coords[i - 1], coords[i]));
    return cum;
}

/**
 * Projection d'un point sur une ligne (approximation plane locale, précise à l'échelle d'une ville).
 * Renvoie le segment, la position projetée, la distance au tracé et la distance parcourue.
 */
export function projectOnLine(point, coords, cum) {
    const k = Math.cos(toRad(point[1]));
    let best = { index: 0, t: 0, point: coords[0], distance: Infinity, along: 0 };
    for (let i = 0; i < coords.length - 1; i++) {
        const a = coords[i];
        const b = coords[i + 1];
        const ax = a[0] * k, ay = a[1], bx = b[0] * k, by = b[1], px = point[0] * k, py = point[1];
        const dx = bx - ax, dy = by - ay;
        const len2 = dx * dx + dy * dy;
        const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
        const proj = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
        const d = haversine(point, proj);
        if (d < best.distance) {
            best = { index: i, t, point: proj, distance: d, along: cum[i] + (cum[i + 1] - cum[i]) * t };
        }
    }
    return best;
}

// Cercle (polygone GeoJSON) de rayon donné en mètres
export function circlePolygon(center, radiusM, steps = 64) {
    const ring = [];
    const latR = radiusM / 111320;
    const lngR = radiusM / (111320 * Math.cos(toRad(center[1])));
    for (let i = 0; i <= steps; i++) {
        const a = (i / steps) * 2 * Math.PI;
        ring.push([center[0] + lngR * Math.cos(a), center[1] + latR * Math.sin(a)]);
    }
    return { type: "Feature", geometry: { type: "Polygon", coordinates: [ring] }, properties: {} };
}

export const lineFeature = (coords) => ({
    type: "Feature",
    geometry: { type: "LineString", coordinates: coords.length > 1 ? coords : [] },
    properties: {},
});

// D3 : nombre de retraits déjà effectués par un point de retrait (fourni par l'API)
export function formatWithdrawals(n) {
    const count = Number(n) || 0;
    if (count === 0) return "Aucun retrait effectué";
    return `${count.toLocaleString("fr-FR")} retrait${count > 1 ? "s" : ""} effectué${count > 1 ? "s" : ""}`;
}

export function formatDistance(m) {
    if (m == null || !Number.isFinite(m)) return "Distance inconnue";
    if (m < 1000) return `${Math.max(0, Math.round(m / 10) * 10)} m`;
    return `${(m / 1000).toFixed(m < 10000 ? 1 : 0).replace(".", ",")} km`;
}

export function formatDuration(s) {
    if (s == null || !Number.isFinite(s)) return "Durée inconnue";
    const min = Math.max(1, Math.round(s / 60));
    if (min < 60) return `${min} min`;
    return `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, "0")}`;
}
