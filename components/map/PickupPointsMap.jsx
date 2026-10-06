"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { COLORS, MAP_STYLES } from "./mapConfig";
import { circlePolygon, formatWithdrawals } from "./geo";

function pinElement(point, selected) {
    const blocked = point.status === "blocked";
    const color = blocked ? COLORS.blocked : selected ? COLORS.brandDark : COLORS.brand;
    const size = selected ? 1.25 : 1;
    const el = document.createElement("button");
    el.type = "button";
    el.className = `edoto-pin${blocked ? " is-blocked" : ""}${selected ? " is-selected" : ""}`;
    el.setAttribute("aria-label", `${point.name}${blocked ? " (bloqué)" : ""}`);
    el.innerHTML = `
      <svg width="${32 * size}" height="${42 * size}" viewBox="0 0 32 42" aria-hidden="true">
        <path d="M16 41s14-15 14-25A14 14 0 0 0 2 16c0 10 14 25 14 25z" fill="${color}" stroke="#fff" stroke-width="2.5"/>
        <circle cx="16" cy="16" r="5.5" fill="#fff"/>
      </svg>`;
    return el;
}

/**
 * Carte des points de retrait (sélection). Clic sur une épingle → onSelect(point).
 * Les points bloqués restent visibles (gris) mais ne sont pas sélectionnables.
 */
export default function PickupPointsMap({ points, userPosition, radiusKm, selectedId, onSelect }) {
    const containerRef = useRef(null);
    const mapRef = useRef(null);
    const markersRef = useRef([]);
    const userMarkerRef = useRef(null);
    const popupRef = useRef(null);
    const lastFitRef = useRef("");

    // Initialisation
    useEffect(() => {
        const map = new maplibregl.Map({
            container: containerRef.current,
            style: MAP_STYLES.light,
            center: userPosition ? [userPosition.lng, userPosition.lat] : [2.4183, 6.3654], // Cotonou par défaut
            zoom: 12,
            attributionControl: false,
        });
        map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-left");
        map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
        map.on("style.load", () => {
            if (!map.getSource("edoto-radius")) {
                map.addSource("edoto-radius", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
                map.addLayer({ id: "edoto-radius-fill", type: "fill", source: "edoto-radius",
                    paint: { "fill-color": COLORS.brand, "fill-opacity": 0.06 } });
                map.addLayer({ id: "edoto-radius-line", type: "line", source: "edoto-radius",
                    paint: { "line-color": COLORS.brand, "line-width": 1.5, "line-dasharray": [2, 2], "line-opacity": 0.7 } });
            }
            map.fire("edoto:ready");
        });
        mapRef.current = map;
        return () => {
            map.remove();
            mapRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Données : points, position, rayon
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        const render = () => {
            markersRef.current.forEach((m) => m.remove());
            markersRef.current = [];

            const withCoords = (points || []).filter((p) => p.pickup_lat != null && p.pickup_lng != null);
            withCoords.forEach((p) => {
                const selected = Number(p.id) === Number(selectedId);
                const el = pinElement(p, selected);
                el.addEventListener("click", (e) => {
                    e.stopPropagation();
                    popupRef.current?.remove();
                    popupRef.current = new maplibregl.Popup({ offset: 30, closeButton: false, className: "edoto-popup" })
                        .setLngLat([Number(p.pickup_lng), Number(p.pickup_lat)])
                        .setHTML("")
                        .addTo(map);
                    const content = document.createElement("div");
                    const title = document.createElement("strong");
                    title.textContent = p.name;
                    content.appendChild(title);
                    const w = document.createElement("div");
                    w.textContent = formatWithdrawals(p.withdrawals_count);
                    w.style.color = "#6B7280";
                    content.appendChild(w);
                    if (p.status === "blocked") {
                        const b = document.createElement("div");
                        b.textContent = "Point bloqué";
                        b.style.color = "#6B7280";
                        content.appendChild(b);
                    }
                    popupRef.current.setDOMContent(content);
                    if (p.status !== "blocked") onSelect?.(p);
                });
                const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
                    .setLngLat([Number(p.pickup_lng), Number(p.pickup_lat)])
                    .addTo(map);
                if (selected) marker.getElement().style.zIndex = "2";
                markersRef.current.push(marker);
            });

            // Position de l'utilisateur et rayon de recherche
            userMarkerRef.current?.remove();
            userMarkerRef.current = null;
            const radiusSource = map.getSource("edoto-radius");
            if (userPosition) {
                const el = document.createElement("div");
                el.className = "edoto-me";
                userMarkerRef.current = new maplibregl.Marker({ element: el })
                    .setLngLat([userPosition.lng, userPosition.lat]).addTo(map);
                radiusSource?.setData(radiusKm
                    ? circlePolygon([userPosition.lng, userPosition.lat], radiusKm * 1000)
                    : { type: "FeatureCollection", features: [] });
            } else {
                radiusSource?.setData({ type: "FeatureCollection", features: [] });
            }

            // Cadrage : utilisateur + points affichés (pas à chaque sélection)
            const fitKey = `${withCoords.map((p) => p.id).join(",")}|${userPosition ? `${userPosition.lat},${userPosition.lng}` : ""}`;
            if (fitKey === lastFitRef.current) return;
            lastFitRef.current = fitKey;
            popupRef.current?.remove();
            const bounds = new maplibregl.LngLatBounds();
            withCoords.forEach((p) => bounds.extend([Number(p.pickup_lng), Number(p.pickup_lat)]));
            if (userPosition) bounds.extend([userPosition.lng, userPosition.lat]);
            if (!bounds.isEmpty()) {
                map.fitBounds(bounds, { padding: 60, maxZoom: 15, duration: 600 });
            }
        };

        if (map.isStyleLoaded() && map.getSource("edoto-radius")) render();
        else map.once("edoto:ready", render);
    }, [points, userPosition, radiusKm, selectedId, onSelect]);

    return (
        <div className="relative w-full h-full">
            <div ref={containerRef} style={{ position: "absolute", inset: 0 }} aria-label="Carte des points de retrait" />
            <style jsx global>{`
                .edoto-pin { background: none; border: 0; padding: 0; cursor: pointer; filter: drop-shadow(0 2px 3px rgba(0,0,0,.3)); }
                .edoto-pin.is-blocked { cursor: not-allowed; }
                .edoto-pin:focus-visible { outline: 2px solid ${COLORS.route}; outline-offset: 2px; border-radius: 6px; }
                .edoto-me { width: 18px; height: 18px; border-radius: 50%; background: ${COLORS.user}; border: 3px solid #fff;
                    box-shadow: 0 0 0 6px rgba(26,115,232,.2), 0 1px 4px rgba(0,0,0,.3); }
                .edoto-popup .maplibregl-popup-content { border-radius: 12px; padding: 8px 12px; font: 13px/1.4 Poppins, system-ui, sans-serif;
                    box-shadow: 0 6px 20px rgba(0,0,0,.18); }
            `}</style>
        </div>
    );
}
