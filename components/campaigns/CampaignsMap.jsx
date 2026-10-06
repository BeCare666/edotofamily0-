"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { circlePolygon } from "../map/geo";
import { cityCoords, normCity } from "../../lib/beninCities";

// Rayon du cercle autour d'une ville de campagne (zone indicative, centre-ville)
const RADIUS_M = 9000;
// Fond de carte clair et sobre (OpenFreeMap « positron », gratuit, sans clé)
const STYLE = "https://tiles.openfreemap.org/styles/positron";
const ROSE = "#D6457F";
const GREY = "#6F6A64";
const esc = (v) => String(v).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);

/**
 * Carte claire : chaque ville d'une campagne est encerclée (rose = en cours, gris = à venir),
 * la ville de l'utilisatrice est marquée. zones : [{ city, status, campaigns: [titres] }].
 * focusCity : ville à centrer (clic sur une ville dans la page).
 */
export default function CampaignsMap({ zones, userPosition, myCity, focusCity, onCityClick, height = 360 }) {
    const box = useRef(null);
    const mapRef = useRef(null);
    const markers = useRef([]);
    const [ready, setReady] = useState(false);
    const [coords, setCoords] = useState({});

    // Coordonnées des villes (table locale ou géocodage mis en cache)
    useEffect(() => {
        let alive = true;
        (async () => {
            const out = {};
            await Promise.all(
                (zones || []).map(async (z) => {
                    const c = await cityCoords(z.city);
                    if (c) out[normCity(z.city)] = c;
                }),
            );
            if (alive) setCoords(out);
        })();
        return () => {
            alive = false;
        };
    }, [zones]);

    useEffect(() => {
        const map = new maplibregl.Map({
            container: box.current,
            style: STYLE,
            center: [2.3158, 9.3077], // Bénin entier
            zoom: 5.6,
            attributionControl: false,
            cooperativeGestures: true,
        });
        map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-left");
        map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
        map.on("load", () => {
            const empty = { type: "FeatureCollection", features: [] };
            map.addSource("zones", { type: "geojson", data: empty });
                        map.addLayer({ id: "zones-fill", type: "fill", source: "zones", paint: { "fill-color": ["get", "color"], "fill-opacity": 0.07 } });
            map.addLayer({ id: "zones-line", type: "line", source: "zones", paint: { "line-color": ["get", "color"], "line-width": 1.2 } });
            setReady(true);
        });
        mapRef.current = map;
        return () => {
            markers.current.forEach((m) => m.remove());
            map.remove();
            mapRef.current = null;
        };
    }, []);

    // Cercles, étiquettes, position de l'utilisatrice, cadrage
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !ready) return;
        markers.current.forEach((m) => m.remove());
        markers.current = [];

        const placed = (zones || []).filter((z) => coords[normCity(z.city)]);
        map.getSource("zones")?.setData({
            type: "FeatureCollection",
            features: placed.map((z) => {
                const f = circlePolygon(coords[normCity(z.city)], RADIUS_M);
                f.properties = { color: z.status === "en_cours" ? ROSE : GREY };
                return f;
            }),
        });

        placed.forEach((z) => {
            const live = z.status === "en_cours";
            const mine = myCity && normCity(myCity) === normCity(z.city);
            const el = document.createElement("button");
            el.type = "button";
            el.className = "edoto-zone";
            el.setAttribute("aria-label", `${z.city} : ${z.campaigns.join(", ")}`);
            el.innerHTML = `
              <span class="edoto-zone-dot ${live ? "is-live" : "is-soon"}"></span>
              <span class="edoto-zone-label">${esc(z.city)}${mine ? " · vous" : ""}<em>${live ? "En cours" : "À venir"}${z.campaigns.length > 1 ? ` · ${z.campaigns.length}` : ""}</em></span>`;
            el.addEventListener("click", (e) => {
                e.stopPropagation();
                onCityClick?.(z.city);
            });
            markers.current.push(new maplibregl.Marker({ element: el, anchor: "left", offset: [-7, 0] }).setLngLat(coords[normCity(z.city)]).addTo(map));
        });

        if (userPosition) {
            const me = document.createElement("div");
            me.className = "edoto-me";
            me.setAttribute("aria-label", "Votre position");
            markers.current.push(new maplibregl.Marker({ element: me }).setLngLat([userPosition.lng, userPosition.lat]).addTo(map));
        }

        const pts = placed.map((z) => coords[normCity(z.city)]);
        if (userPosition) pts.push([userPosition.lng, userPosition.lat]);
        if (pts.length) {
            const b = pts.reduce((acc, p) => acc.extend(p), new maplibregl.LngLatBounds(pts[0], pts[0]));
            map.fitBounds(b, { padding: { top: 70, bottom: 50, left: 50, right: 110 }, maxZoom: 10, duration: 900 });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ready, coords, zones, userPosition, myCity]);

    useEffect(() => {
        const map = mapRef.current;
        const c = focusCity && coords[normCity(focusCity)];
        if (map && ready && c) map.flyTo({ center: c, zoom: 10.2, duration: 1100, essential: true });
    }, [focusCity, coords, ready]);

    return <div ref={box} className="w-full" style={{ height }} />;
}
