"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { circlePolygon } from "../map/geo";
import { cityCoords, normCity } from "../../lib/beninCities";

// Carte en direct de l'espace sponsor (15/10/2026) : même fond que la page Campagnes (OpenFreeMap « positron »).
// Villes des campagnes encerclées (zone indicative) ; points de retrait placés à leurs vraies coordonnées GPS,
// taille selon le nombre d'inscrits, anneau animé quand un kit y a été retiré aujourd'hui.
const STYLE = "https://tiles.openfreemap.org/styles/positron";
const RADIUS_M = 9000;
const ROSE = "#D6457F";
const GREY = "#6F6A64";
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);
const pct = (v) => (v === null || v === undefined ? "non calculé" : `${String(v).replace(".", ",")} %`);

export default function LiveMap({ cities = [], points = [], focus, onSelectPoint, height = 460 }) {
    const box = useRef(null);
    const mapRef = useRef(null);
    const markers = useRef([]);
    const fitted = useRef(false);
    const [ready, setReady] = useState(false);
    const [coords, setCoords] = useState({});

    // Coordonnées des villes (table locale du site ou géocodage mis en cache)
    const cityKey = cities.map((c) => c.city).join("|");
    useEffect(() => {
        let alive = true;
        (async () => {
            const out = {};
            await Promise.all(cities.map(async (z) => {
                const c = await cityCoords(z.city);
                if (c) out[normCity(z.city)] = c;
            }));
            if (alive) setCoords(out);
        })();
        return () => { alive = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cityKey]);

    useEffect(() => {
        const map = new maplibregl.Map({
            container: box.current,
            style: STYLE,
            center: [2.3158, 9.3077],
            zoom: 5.6,
            attributionControl: false,
            cooperativeGestures: true,
        });
        map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-left");
        map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
        map.addControl(new maplibregl.FullscreenControl(), "top-right");
        map.on("load", () => {
            map.addSource("zones", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
            map.addLayer({ id: "zones-fill", type: "fill", source: "zones", paint: { "fill-color": ["get", "color"], "fill-opacity": 0.07 } });
            map.addLayer({ id: "zones-line", type: "line", source: "zones", paint: { "line-color": ["get", "color"], "line-width": 1.2, "line-dasharray": [2, 2] } });
            setReady(true);
        });
        mapRef.current = map;
        return () => {
            markers.current.forEach((m) => m.remove());
            map.remove();
            mapRef.current = null;
        };
    }, []);

    // Zones des villes + marqueurs des points ; cadrage au premier affichage seulement (la carte ne saute pas à chaque rafraîchissement)
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !ready) return;
        markers.current.forEach((m) => m.remove());
        markers.current = [];
        const bounds = new maplibregl.LngLatBounds();

        const features = [];
        for (const z of cities) {
            const c = coords[normCity(z.city)];
            if (!c) continue;
            const color = z.in_progress ? ROSE : GREY;
            features.push({ type: "Feature", properties: { color }, geometry: { type: "Polygon", coordinates: [circlePolygon(c, RADIUS_M)] } });
            bounds.extend(c);
            const el = document.createElement("div");
            el.className = "pointer-events-none select-none rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium shadow-sm border";
            el.style.borderColor = color;
            el.style.color = color;
            el.textContent = z.city;
            markers.current.push(new maplibregl.Marker({ element: el, anchor: "bottom", offset: [0, -14] }).setLngLat(c).addTo(map));
        }
        map.getSource("zones")?.setData({ type: "FeatureCollection", features });

        const max = Math.max(1, ...points.map((p) => p.registrations));
        for (const p of points) {
            if (p.lat === null || p.lng === null || !Number.isFinite(p.lat) || !Number.isFinite(p.lng)) continue;
            const size = Math.round(16 + (p.registrations / max) * 22);
            const el = document.createElement("button");
            el.type = "button";
            el.setAttribute("aria-label", `${p.name} : ${p.registrations} inscrit(s), ${p.withdrawn} kit(s) retiré(s)`);
            el.className = "sponsor-live-point";
            el.style.width = `${size}px`;
            el.style.height = `${size}px`;
            el.innerHTML = `${p.today_withdrawn > 0 ? '<span class="sponsor-live-pulse"></span>' : ""}<span class="sponsor-live-dot">${p.registrations}</span>`;
            const popup = new maplibregl.Popup({ offset: size / 2 + 4, closeButton: false, maxWidth: "260px" }).setHTML(`
                <div style="font-family: inherit; color:#1A1814">
                  <p style="font-weight:600; margin:0 0 2px">${esc(p.name)}</p>
                  ${p.address ? `<p style="margin:0 0 8px; color:#6B655D; font-size:12px">${esc(p.address)}</p>` : ""}
                  <p style="margin:0; font-size:12px">Inscrits : <b>${p.registrations}</b></p>
                  <p style="margin:0; font-size:12px">Codes validés : <b>${p.validated}</b></p>
                  <p style="margin:0; font-size:12px">Kits retirés : <b>${p.withdrawn}</b> (${pct(p.rate)})</p>
                  <p style="margin:6px 0 0; font-size:12px; color:${p.today_withdrawn ? ROSE : "#8A837A"}">Retirés aujourd’hui : <b>${p.today_withdrawn}</b></p>
                </div>`);
            el.addEventListener("click", () => onSelectPoint?.(p));
            markers.current.push(new maplibregl.Marker({ element: el }).setLngLat([p.lng, p.lat]).setPopup(popup).addTo(map));
            bounds.extend([p.lng, p.lat]);
        }
        if (!fitted.current && !bounds.isEmpty()) {
            map.fitBounds(bounds, { padding: 60, maxZoom: 13, duration: 600 });
            fitted.current = true;
        }
    }, [ready, cities, points, coords, onSelectPoint]);

    // Centrage demandé depuis la liste (point ou ville)
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !ready || !focus) return;
        if (Number.isFinite(focus.lng) && Number.isFinite(focus.lat)) map.flyTo({ center: [focus.lng, focus.lat], zoom: 14, duration: 700 });
    }, [focus, ready]);

    return (
        <div className="relative overflow-hidden rounded-2xl border border-[#E9E5DF] bg-[#F1ECE6]" style={{ height }}>
            <div ref={box} className="absolute inset-0" />
            <div className="pointer-events-none absolute left-3 top-3 rounded-2xl bg-white/90 px-3 py-2 text-[11px] text-[#3D3934] shadow-sm backdrop-blur">
                <p className="flex items-center gap-2"><span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: ROSE }} /> Point de retrait (taille : inscrits)</p>
                <p className="mt-1 flex items-center gap-2"><span className="inline-block h-2.5 w-2.5 rounded-full border-2" style={{ borderColor: ROSE }} /> Kit retiré aujourd’hui</p>
                <p className="mt-1 flex items-center gap-2"><span className="inline-block h-0 w-4 border-t border-dashed" style={{ borderColor: ROSE }} /> Ville de campagne</p>
            </div>
        </div>
    );
}
