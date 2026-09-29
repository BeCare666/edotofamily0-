"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { COLORS, MAP_STYLES } from "./mapConfig";

function pinElement() {
    const el = document.createElement("div");
    el.className = "edoto-drop-pin";
    el.innerHTML = `
      <svg width="36" height="47" viewBox="0 0 32 42" aria-hidden="true">
        <path d="M16 41s14-15 14-25A14 14 0 0 0 2 16c0 10 14 25 14 25z" fill="${COLORS.brand}" stroke="#fff" stroke-width="2.5"/>
        <circle cx="16" cy="16" r="5.5" fill="#fff"/>
      </svg>`;
    return el;
}

/**
 * Choix d'un lieu précis : clic sur la carte ou déplacement du repère → onChange({ lat, lng }).
 * `value` peut aussi venir de « Utiliser ma position » : la carte se recentre dessus.
 */
export default function LocationPickerMap({ value, onChange, ariaLabel = "Carte : placez le repère sur le lieu de livraison" }) {
    const containerRef = useRef(null);
    const mapRef = useRef(null);
    const markerRef = useRef(null);
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    useEffect(() => {
        const map = new maplibregl.Map({
            container: containerRef.current,
            style: MAP_STYLES.light,
            center: value ? [value.lng, value.lat] : [2.4183, 6.3654], // Cotonou par défaut
            zoom: value ? 16 : 12,
            attributionControl: false,
        });
        map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-left");
        map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
        map.on("click", (e) => onChangeRef.current({ lat: e.lngLat.lat, lng: e.lngLat.lng }));
        mapRef.current = map;
        return () => {
            markerRef.current = null;
            map.remove();
            mapRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;
        if (!value) {
            markerRef.current?.remove();
            markerRef.current = null;
            return;
        }
        const lngLat = [value.lng, value.lat];
        if (!markerRef.current) {
            const marker = new maplibregl.Marker({ element: pinElement(), anchor: "bottom", draggable: true })
                .setLngLat(lngLat)
                .addTo(map);
            marker.on("dragend", () => {
                const p = marker.getLngLat();
                onChangeRef.current({ lat: p.lat, lng: p.lng });
            });
            markerRef.current = marker;
        } else {
            markerRef.current.setLngLat(lngLat);
        }
        const bounds = map.getBounds();
        if (!bounds.contains(lngLat) || map.getZoom() < 14) {
            map.easeTo({ center: lngLat, zoom: Math.max(map.getZoom(), 16), duration: 600 });
        }
    }, [value]);

    return (
        <div className="relative w-full h-full">
            <div ref={containerRef} style={{ position: "absolute", inset: 0 }} aria-label={ariaLabel} />
            <style jsx global>{`
                .edoto-drop-pin { cursor: grab; filter: drop-shadow(0 2px 3px rgba(0,0,0,.3)); }
                .edoto-drop-pin:active { cursor: grabbing; }
            `}</style>
        </div>
    );
}
