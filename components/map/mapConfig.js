// Configuration commune des cartes (MapLibre GL + OpenStreetMap).

// Fonds de carte vectoriels OpenFreeMap : gratuits, usage commercial autorisé, sans clé.
export const MAP_STYLES = {
    light: "https://tiles.openfreemap.org/styles/liberty",
    dark: "https://tiles.openfreemap.org/styles/dark",
};

// Calcul d'itinéraire OSRM.
// Par défaut : serveurs de démonstration FOSSGIS, réservés au DÉVELOPPEMENT
// (usage non commercial, 1 requête/s max, sans garantie). En production, renseigner
// NEXT_PUBLIC_OSRM_CAR_URL et NEXT_PUBLIC_OSRM_FOOT_URL avec notre propre serveur OSRM.
export const ROUTING_URLS = {
    car: process.env.NEXT_PUBLIC_OSRM_CAR_URL || "https://routing.openstreetmap.de/routed-car/route/v1/driving",
    foot: process.env.NEXT_PUBLIC_OSRM_FOOT_URL || "https://routing.openstreetmap.de/routed-foot/route/v1/foot",
};
export const USING_DEMO_ROUTING = !process.env.NEXT_PUBLIC_OSRM_CAR_URL;

export const COLORS = {
    brand: "#FF6EA9",
    brandDark: "#E0528C",
    route: "#1A73E8",
    routeCasing: "#0B57D0",
    routeDone: "#9AA0A6",
    user: "#1A73E8",
    blocked: "#9CA3AF",
};

// Rayon de recherche des points de retrait « proches » (décision métier : 5 km)
export const NEARBY_RADIUS_KM = 5;
