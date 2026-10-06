// Villes proposées sur la page Campagnes (même liste qu'avant la refonte) et coordonnées des
// centres-villes connus. Les villes sans coordonnées ici sont géocodées à la demande
// (OpenStreetMap / Nominatim) puis gardées en mémoire dans le navigateur.
export const BENIN_CITIES = [
    "Abomey", "Abomey-Calavi", "Adjohoun", "Adjarra", "Agbangnizoun", "Allada", "Aplahoué", "Avrankou",
    "Banikoara", "Bantè", "Bassila", "Bembèrèkè", "Bohicon", "Bonou", "Boukoumbé", "Cotonou", "Cobly",
    "Dangbo", "Dassa-Zoumè", "Dogbo", "Djougou", "Glazoué", "Ifangni", "Kalalé", "Kandi", "Kétou",
    "Klouékanmè", "Kouandé", "Lalo", "Lokossa", "Malanville", "Matéri", "Natitingou", "Nikki", "Ouèssè",
    "Ouidah", "Parakou", "Pobè", "Porto-Novo", "Pèrèrè", "Sakété", "Savalou", "Savè", "Sèmè-Kpodji",
    "Sinendé", "Tanguiéta", "Tchaourou", "Toffo", "Togba", "Toucountouna", "Toviklin", "Za-Kpota", "Zè",
    "Zogbodomey",
];

// [longitude, latitude] des centres-villes
const COORDS = {
    abomey: [1.9912, 7.1829],
    "abomey-calavi": [2.3557, 6.4485],
    allada: [2.1511, 6.6658],
    aplahoue: [1.6833, 6.9333],
    banikoara: [2.4386, 11.2985],
    bassila: [1.6654, 9.0081],
    bembereke: [2.6634, 10.2283],
    bohicon: [2.0667, 7.1782],
    cotonou: [2.4183, 6.3654],
    "dassa-zoume": [2.1833, 7.75],
    djougou: [1.666, 9.7085],
    dogbo: [1.7833, 6.8],
    glazoue: [2.24, 7.9739],
    kandi: [2.9386, 11.1342],
    ketou: [2.6, 7.3633],
    kouande: [1.6914, 10.3317],
    lokossa: [1.7168, 6.6387],
    malanville: [3.3862, 11.8616],
    natitingou: [1.3796, 10.3042],
    nikki: [3.2108, 9.9401],
    ouidah: [2.0851, 6.3631],
    parakou: [2.6303, 9.3372],
    pobe: [2.6649, 6.98],
    "porto-novo": [2.6289, 6.4969],
    sakete: [2.6587, 6.7362],
    savalou: [1.9756, 7.9281],
    save: [2.4866, 8.0342],
    tanguieta: [1.265, 10.6212],
    tchaourou: [2.5975, 8.8865],
};

// Comparaison sans accents ni majuscules ni espaces superflus
export const normCity = (s) =>
    String(s || "")
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();

export function knownCoords(city) {
    return COORDS[normCity(city)] || null;
}

// Ville de la liste correspondant à un nom (accents et majuscules ignorés)
export function matchCity(name, list = BENIN_CITIES) {
    const n = normCity(name);
    if (!n) return null;
    return list.find((c) => normCity(c) === n) || null;
}

const toRad = (d) => (d * Math.PI) / 180;
export function distanceKm(a, b) {
    const dLat = toRad(b[1] - a[1]);
    const dLng = toRad(b[0] - a[0]);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a[1])) * Math.cos(toRad(b[1])) * Math.sin(dLng / 2) ** 2;
    return 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(h)));
}

// Ville connue la plus proche (secours si le service d'adresse ne répond pas) ; null au-delà de maxKm
export function nearestKnownCity(lng, lat, maxKm = 12) {
    let best = null;
    for (const city of BENIN_CITIES) {
        const c = knownCoords(city);
        if (!c) continue;
        const d = distanceKm([lng, lat], c);
        if (d <= maxKm && (!best || d < best.d)) best = { city, d };
    }
    return best ? best.city : null;
}

const GEO_CACHE = "edoto_city_coords_v1";

function readGeoCache() {
    try {
        return JSON.parse(localStorage.getItem(GEO_CACHE) || "{}");
    } catch {
        return {};
    }
}

// Coordonnées d'une ville : table ci-dessus, sinon cache du navigateur, sinon Nominatim
export async function cityCoords(city) {
    const known = knownCoords(city);
    if (known) return known;
    const cache = readGeoCache();
    const key = normCity(city);
    if (cache[key]) return cache[key];
    try {
        const ctrl = new AbortController();
        const tm = setTimeout(() => ctrl.abort(), 4000);
        const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=bj&accept-language=fr&q=${encodeURIComponent(city)}`,
            { signal: ctrl.signal },
        );
        clearTimeout(tm);
        const data = await res.json();
        if (Array.isArray(data) && data[0]) {
            const c = [Number(data[0].lon), Number(data[0].lat)];
            try {
                localStorage.setItem(GEO_CACHE, JSON.stringify({ ...readGeoCache(), [key]: c }));
            } catch {}
            return c;
        }
    } catch {}
    return null;
}

// ------------------------------------------------------------------ Ville de l'utilisateur
// Rapide : ville mémorisée (24 h) affichée tout de suite ; position « réseau » (sans GPS, 6 s max,
// position récente acceptée) ; adresse via Nominatim (3 s max), sinon ville connue la plus proche.
const MY_CITY = "edoto_my_city_v1";
const DAY = 24 * 60 * 60 * 1000;

export function savedCity() {
    try {
        const v = JSON.parse(localStorage.getItem(MY_CITY) || "null");
        if (v && v.city && Date.now() - v.at < DAY) return v;
    } catch {}
    return null;
}

export function saveCity(city, source, position) {
    try {
        localStorage.setItem(MY_CITY, JSON.stringify({ city, source, position: position || null, at: Date.now() }));
    } catch {}
}

export async function detectCity() {
    if (typeof navigator === "undefined" || !navigator.geolocation) return { status: "unavailable" };
    try {
        if (navigator.permissions?.query) {
            const p = await navigator.permissions.query({ name: "geolocation" });
            if (p.state === "denied") return { status: "denied" };
        }
    } catch {}
    let pos;
    try {
        pos = await new Promise((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: false, timeout: 6000, maximumAge: 30 * 60 * 1000 }),
        );
    } catch (e) {
        return { status: e?.code === 1 ? "denied" : "unavailable" };
    }
    const { latitude: lat, longitude: lng } = pos.coords;
    const position = { lat, lng };
    let city = null;
    try {
        const ctrl = new AbortController();
        const tm = setTimeout(() => ctrl.abort(), 3000);
        const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&zoom=10&lat=${lat}&lon=${lng}&accept-language=fr`,
            { signal: ctrl.signal },
        );
        clearTimeout(tm);
        const a = (await res.json())?.address || {};
        const raw = a.city || a.town || a.municipality || a.village || a.county || null;
        city = matchCity(raw) || (raw ? String(raw) : null);
    } catch {}
    if (!city) city = nearestKnownCity(lng, lat);
    if (!city) return { status: "unknown", position };
    saveCity(city, "detected", position);
    return { status: "ok", city, position };
}
