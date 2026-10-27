// MapLibre GL 6 pour toutes les cartes du site (audit 2.1, 27/10/2026).
// maplibre-gl 6 n'a que des exports nommés et cherche son worker à côté de son propre fichier
// (import.meta.url) ; une fois bundlé par webpack, cette adresse devient file:/// et la carte
// échoue (« Worker failed to load »). On fait donc émettre le worker par webpack (même origine,
// compatible avec worker-src 'self') et on donne son adresse à MapLibre.
import * as maplibregl from "maplibre-gl";

maplibregl.setWorkerUrl(
    new URL("../../node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url).href
);

export default maplibregl;
