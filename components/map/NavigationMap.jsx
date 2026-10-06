"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
    ArrowUp, ArrowUpLeft, ArrowUpRight, CornerUpLeft, CornerUpRight, Undo2, RotateCw, Flag, Navigation,
    Car, Footprints, Box, Compass, Moon, Sun, Volume2, VolumeX, LocateFixed, Route, X, Loader2,
    AlertTriangle, ExternalLink, RefreshCw,
} from "lucide-react";
import { COLORS, MAP_STYLES, USING_DEMO_ROUTING } from "./mapConfig";
import { bearing, circlePolygon, formatDistance, formatDuration, haversine, lineFeature, projectOnLine } from "./geo";
import { fetchRoute } from "./routing";

const OFF_ROUTE_M = 40;
const REROUTE_MIN_MS = 15000;
const ARRIVAL_M = 30;
const EMPTY = { type: "FeatureCollection", features: [] };

const MANEUVER_ICONS = {
    straight: ArrowUp, left: CornerUpLeft, right: CornerUpRight, "slight-left": ArrowUpLeft,
    "slight-right": ArrowUpRight, uturn: Undo2, roundabout: RotateCw, arrive: Flag, depart: Navigation,
};

const formatClock = (d) => d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

function speak(text) {
    try {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = "fr-FR";
        u.rate = 1;
        window.speechSynthesis.speak(u);
    } catch { /* synthèse vocale indisponible */ }
}

// Distance prononcée : « 150 mètres », « 1,2 kilomètre(s) »
function spokenDistance(m) {
    if (m < 1000) return `${Math.max(10, Math.round(m / 10) * 10)} mètres`;
    const km = (m / 1000).toFixed(1).replace(".", ",").replace(",0", "");
    return `${km} ${km === "1" ? "kilomètre" : "kilomètres"}`;
}

function createUserElement() {
    const el = document.createElement("div");
    el.className = "edoto-user";
    el.innerHTML = '<div class="edoto-user-cone"></div><div class="edoto-user-pulse"></div><div class="edoto-user-dot"></div>';
    return el;
}

function createDestinationElement(name) {
    const el = document.createElement("div");
    el.className = "edoto-dest";
    el.innerHTML = `
      <div class="edoto-dest-label"></div>
      <svg width="40" height="52" viewBox="0 0 40 52" aria-hidden="true">
        <path d="M20 51s17-18.3 17-31A17 17 0 0 0 3 20c0 12.7 17 31 17 31z" fill="${COLORS.brand}" stroke="#fff" stroke-width="3"/>
        <circle cx="20" cy="20" r="6.5" fill="#fff"/>
      </svg>`;
    el.querySelector(".edoto-dest-label").textContent = name || "Point de retrait";
    return el;
}

/**
 * Navigation temps réel vers un point de retrait.
 * Fond OpenFreeMap (OpenStreetMap), rendu MapLibre GL, itinéraire OSRM.
 */
export default function NavigationMap({ destLat, destLng, destName, onClose }) {
    const dest = [Number(destLng), Number(destLat)];
    const validDest = Number.isFinite(dest[0]) && Number.isFinite(dest[1]);

    const containerRef = useRef(null);
    const mapRef = useRef(null);
    const userMarkerRef = useRef(null);
    const destMarkerRef = useRef(null);
    const routeRef = useRef(null);
    const progressRef = useRef({ done: [], remaining: [] });
    const posRef = useRef(null);
    const accuracyRef = useRef(0);
    const headingRef = useRef(null);
    const animRef = useRef(0);
    const watchRef = useRef(null);
    const lastRouteAtRef = useRef(0);
    const abortRef = useRef(null);
    const spokenRef = useRef({ step: -1, near: false, arrived: false });
    const prefs = useRef({ mode: "car", camera: "overview", orientation: "heading", view3d: true, voice: false });

    const [ready, setReady] = useState(false);
    const [theme, setTheme] = useState("light");
    const [mode, setMode] = useState("car");
    const [camera, setCamera] = useState("overview"); // overview | follow | free
    const [orientation, setOrientation] = useState("heading"); // heading | north
    const [view3d, setView3d] = useState(true);
    const [voice, setVoice] = useState(false);
    const [mapBearing, setMapBearing] = useState(0);
    const [geo, setGeo] = useState({ status: "locating", message: null });
    const [routeState, setRouteState] = useState({ status: "idle", message: null });
    const [info, setInfo] = useState(null);
    const [arrived, setArrived] = useState(false);

    // Préférences lues par les callbacks GPS
    useEffect(() => {
        prefs.current = { mode, camera, orientation, view3d, voice };
    }, [mode, camera, orientation, view3d, voice]);

    /* ------------------------------------------------------------ couches de la carte */
    const pushData = useCallback(() => {
        const map = mapRef.current;
        if (!map || !map.getSource("edoto-route-remaining")) return;
        map.getSource("edoto-route-remaining").setData(lineFeature(progressRef.current.remaining));
        map.getSource("edoto-route-done").setData(lineFeature(progressRef.current.done));
        map.getSource("edoto-accuracy").setData(
            posRef.current && accuracyRef.current > 0
                ? circlePolygon(posRef.current, Math.min(accuracyRef.current, 150))
                : EMPTY
        );
    }, []);

    const ensureLayers = useCallback(() => {
        const map = mapRef.current;
        if (!map || map.getSource("edoto-route-remaining")) return;
        // Tracé sous les libellés (comme Google Maps)
        const firstSymbol = map.getStyle().layers.find((l) => l.type === "symbol")?.id;
        map.addSource("edoto-route-done", { type: "geojson", data: lineFeature([]) });
        map.addSource("edoto-route-remaining", { type: "geojson", data: lineFeature([]) });
        map.addSource("edoto-accuracy", { type: "geojson", data: EMPTY });
        const width = (a, b) => ["interpolate", ["exponential", 1.5], ["zoom"], 10, a, 18, b];
        map.addLayer({ id: "edoto-accuracy", type: "fill", source: "edoto-accuracy",
            paint: { "fill-color": COLORS.user, "fill-opacity": 0.12 } }, firstSymbol);
        map.addLayer({ id: "edoto-route-done", type: "line", source: "edoto-route-done",
            layout: { "line-cap": "round", "line-join": "round" },
            paint: { "line-color": COLORS.routeDone, "line-width": width(4, 11), "line-opacity": 0.9 } }, firstSymbol);
        map.addLayer({ id: "edoto-route-casing", type: "line", source: "edoto-route-remaining",
            layout: { "line-cap": "round", "line-join": "round" },
            paint: { "line-color": COLORS.routeCasing, "line-width": width(7, 16) } }, firstSymbol);
        map.addLayer({ id: "edoto-route-line", type: "line", source: "edoto-route-remaining",
            layout: { "line-cap": "round", "line-join": "round" },
            paint: { "line-color": COLORS.route, "line-width": width(4.5, 11) } }, firstSymbol);
        pushData();
    }, [pushData]);

    /* ------------------------------------------------------------ progression */
    const updateProgress = useCallback((p) => {
        const route = routeRef.current;
        if (!route) return null;
        const proj = projectOnLine(p, route.coords, route.cum);
        progressRef.current = {
            done: [...route.coords.slice(0, proj.index + 1), proj.point],
            remaining: [proj.point, ...route.coords.slice(proj.index + 1)],
        };
        pushData();

        const total = route.cum[route.cum.length - 1] || route.distance;
        const remainingM = Math.max(0, total - proj.along);
        const remainingS = route.duration * (total > 0 ? remainingM / total : 0);
        let stepIndex = route.steps.findIndex((s, i) => i > 0 && s.along > proj.along + 3);
        if (stepIndex === -1) stepIndex = route.steps.length - 1;
        const step = route.steps[stepIndex];
        const stepDist = Math.max(0, step.along - proj.along);
        const toDest = haversine(p, dest);
        const isArrived = toDest <= ARRIVAL_M;

        setArrived(isArrived);
        setInfo({ remainingM, remainingS, eta: new Date(Date.now() + remainingS * 1000), step, stepDist });

        // Guidage vocal : annonce à chaque nouvelle étape, puis à l'approche
        const spoken = spokenRef.current;
        if (prefs.current.voice && prefs.current.camera === "follow") {
            if (isArrived && !spoken.arrived) {
                speak("Vous êtes arrivé à destination.");
                spoken.arrived = true;
            } else if (!isArrived && spoken.step !== stepIndex) {
                speak(`Dans ${spokenDistance(stepDist)}, ${step.instruction}`);
                spokenRef.current = { ...spoken, step: stepIndex, near: false };
            } else if (!isArrived && !spoken.near && stepDist < 40) {
                speak(step.instruction);
                spokenRef.current = { ...spoken, near: true };
            }
        }
        return proj.distance;
    }, [pushData, dest[0], dest[1]]);

    /* ------------------------------------------------------------ calcul d'itinéraire */
    const loadRoute = useCallback(async (from, travelMode, { fit } = {}) => {
        abortRef.current?.abort();
        const ctrl = new AbortController();
        abortRef.current = ctrl;
        lastRouteAtRef.current = Date.now();
        setRouteState((s) => ({ status: s.status === "ok" ? "rerouting" : "loading", message: null }));
        try {
            const route = await fetchRoute(from, dest, travelMode, ctrl.signal);
            routeRef.current = route;
            spokenRef.current = { step: -1, near: false, arrived: false };
            setRouteState({ status: "ok", message: null });
            updateProgress(posRef.current || from);
            const map = mapRef.current;
            if (fit && map) {
                const b = new maplibregl.LngLatBounds();
                route.coords.forEach((c) => b.extend(c));
                map.fitBounds(b, { padding: { top: 140, bottom: 220, left: 50, right: 70 }, bearing: 0, pitch: 0, duration: 900 });
            }
        } catch (e) {
            if (e.name === "AbortError") return;
            setRouteState({
                status: "error",
                message: e.code === "NoRoute"
                    ? "Aucun itinéraire trouvé pour ce mode de déplacement."
                    : "Itinéraire indisponible pour le moment.",
            });
        }
    }, [updateProgress, dest[0], dest[1]]);

    /* ------------------------------------------------------------ caméra */
    const followCamera = useCallback((target, immediate) => {
        const map = mapRef.current;
        if (!map) return;
        const { orientation: o, view3d: v } = prefs.current;
        map.easeTo({
            center: target,
            bearing: o === "heading" && headingRef.current != null ? headingRef.current : 0,
            pitch: v ? 55 : 0,
            zoom: immediate ? Math.max(map.getZoom(), 17) : undefined,
            duration: immediate ? 800 : 900,
            easing: (t) => t,
        });
    }, []);

    const animateUser = useCallback((to) => {
        const marker = userMarkerRef.current;
        if (!marker) return;
        const from = marker.getLngLat();
        const start = performance.now();
        cancelAnimationFrame(animRef.current);
        const frame = (now) => {
            const t = Math.min(1, (now - start) / 900);
            const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
            marker.setLngLat([from.lng + (to[0] - from.lng) * e, from.lat + (to[1] - from.lat) * e]);
            if (t < 1) animRef.current = requestAnimationFrame(frame);
        };
        animRef.current = requestAnimationFrame(frame);
    }, []);

    /* ------------------------------------------------------------ GPS */
    const onPosition = useCallback((pos) => {
        const map = mapRef.current;
        if (!map) return;
        const p = [pos.coords.longitude, pos.coords.latitude];
        const prev = posRef.current;

        // cap : celui de l'appareil en mouvement, sinon calculé entre deux positions
        const h = pos.coords.heading;
        if (Number.isFinite(h) && (pos.coords.speed ?? 1) > 0.5) headingRef.current = h;
        else if (prev && haversine(prev, p) > 4) headingRef.current = bearing(prev, p);

        posRef.current = p;
        accuracyRef.current = pos.coords.accuracy || 0;
        setGeo({ status: "ok", message: null });

        if (!userMarkerRef.current) {
            userMarkerRef.current = new maplibregl.Marker({
                element: createUserElement(), rotationAlignment: "map", pitchAlignment: "map",
            }).setLngLat(p).addTo(map);
        } else {
            animateUser(p);
        }
        const el = userMarkerRef.current.getElement();
        el.classList.toggle("has-heading", headingRef.current != null);
        userMarkerRef.current.setRotation(headingRef.current ?? 0);

        if (!routeRef.current) {
            if (!lastRouteAtRef.current) loadRoute(p, prefs.current.mode, { fit: true });
            pushData();
            return;
        }
        const offRoute = updateProgress(p);
        if (prefs.current.camera === "follow") followCamera(p);
        if (offRoute > OFF_ROUTE_M && Date.now() - lastRouteAtRef.current > REROUTE_MIN_MS && haversine(p, dest) > ARRIVAL_M) {
            loadRoute(p, prefs.current.mode);
        }
    }, [animateUser, followCamera, loadRoute, pushData, updateProgress, dest[0], dest[1]]);

    const startGps = useCallback(() => {
        if (!navigator.geolocation) {
            setGeo({ status: "error", message: "La localisation n'est pas disponible sur cet appareil." });
            return;
        }
        if (watchRef.current != null) navigator.geolocation.clearWatch(watchRef.current);
        setGeo({ status: "locating", message: null });
        watchRef.current = navigator.geolocation.watchPosition(
            onPosition,
            (err) => setGeo({
                status: "error",
                message: err.code === 1
                    ? "Autorisez l'accès à votre position pour afficher l'itinéraire en temps réel."
                    : "Position introuvable pour le moment.",
            }),
            { enableHighAccuracy: true, maximumAge: 2000, timeout: 20000 }
        );
    }, [onPosition]);

    /* ------------------------------------------------------------ initialisation */
    useEffect(() => {
        if (!validDest || !containerRef.current) return;
        if (USING_DEMO_ROUTING && process.env.NODE_ENV === "production") {
            console.warn("[carte] Serveur d'itinéraire de démonstration utilisé en production : configurer NEXT_PUBLIC_OSRM_CAR_URL.");
        }
        const map = new maplibregl.Map({
            container: containerRef.current,
            style: MAP_STYLES.light,
            center: dest,
            zoom: 15,
            maxPitch: 70,
            attributionControl: false,
        });
        mapRef.current = map;
        map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-left");
        map.setPadding({ top: 120, bottom: 200, left: 0, right: 0 });

        destMarkerRef.current = new maplibregl.Marker({ element: createDestinationElement(destName), anchor: "bottom" })
            .setLngLat(dest).addTo(map);

        map.on("style.load", () => {
            ensureLayers();
            setReady(true);
        });
        // Toute manipulation par l'utilisateur quitte le suivi automatique
        const leaveFollow = (e) => {
            if (e.originalEvent && prefs.current.camera !== "free") setCamera("free");
        };
        map.on("dragstart", leaveFollow);
        map.on("rotatestart", leaveFollow);
        let raf = 0;
        map.on("rotate", () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => setMapBearing(map.getBearing()));
        });

        startGps();

        return () => {
            abortRef.current?.abort();
            cancelAnimationFrame(animRef.current);
            cancelAnimationFrame(raf);
            if (watchRef.current != null) navigator.geolocation.clearWatch(watchRef.current);
            try { window.speechSynthesis?.cancel(); } catch { /* ignore */ }
            map.remove();
            mapRef.current = null;
            userMarkerRef.current = null;
            routeRef.current = null;
            lastRouteAtRef.current = 0;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [destLat, destLng]);

    /* ------------------------------------------------------------ actions */
    const changeTheme = () => {
        const next = theme === "light" ? "dark" : "light";
        setTheme(next);
        mapRef.current?.setStyle(MAP_STYLES[next]);
    };

    const changeMode = (m) => {
        if (m === mode) return;
        setMode(m);
        prefs.current.mode = m;
        routeRef.current = null;
        progressRef.current = { done: [], remaining: [] };
        pushData();
        setInfo(null);
        if (posRef.current) loadRoute(posRef.current, m, { fit: camera !== "follow" });
    };

    const startNavigation = () => {
        setCamera("follow");
        prefs.current.camera = "follow";
        if (voice && info) speak(info.step.instruction);
        if (posRef.current) followCamera(posRef.current, true);
    };

    const showOverview = () => {
        const map = mapRef.current;
        const route = routeRef.current;
        setCamera("overview");
        if (!map) return;
        const b = new maplibregl.LngLatBounds();
        (route ? route.coords : [dest]).forEach((c) => b.extend(c));
        if (posRef.current) b.extend(posRef.current);
        map.fitBounds(b, { padding: { top: 140, bottom: 220, left: 50, right: 70 }, bearing: 0, pitch: 0, duration: 900 });
    };

    const toggle3d = () => {
        const v = !view3d;
        setView3d(v);
        prefs.current.view3d = v;
        mapRef.current?.easeTo({ pitch: v ? 55 : 0, duration: 600 });
    };

    const toggleOrientation = () => {
        const o = orientation === "heading" ? "north" : "heading";
        setOrientation(o);
        prefs.current.orientation = o;
        const map = mapRef.current;
        if (!map) return;
        if (o === "north") map.easeTo({ bearing: 0, duration: 500 });
        else if (camera === "follow" && posRef.current) followCamera(posRef.current);
    };

    const toggleVoice = () => {
        const v = !voice;
        setVoice(v);
        prefs.current.voice = v;
        if (!v) try { window.speechSynthesis?.cancel(); } catch { /* ignore */ }
        else if (info && camera === "follow") speak(info.step.instruction);
    };

    const recenter = () => {
        setCamera("follow");
        prefs.current.camera = "follow";
        if (posRef.current) followCamera(posRef.current, true);
    };

    const retryRoute = () => {
        if (posRef.current) loadRoute(posRef.current, mode, { fit: camera !== "follow" });
        else startGps();
    };

    const externalUrl = `https://www.google.com/maps/dir/?api=1&destination=${dest[1]},${dest[0]}&travelmode=${mode === "foot" ? "walking" : "driving"}`;
    const ManeuverIcon = info ? MANEUVER_ICONS[info.step.icon] || ArrowUp : Navigation;
    const dark = theme === "dark";
    const panel = dark ? "bg-[#1f2328] text-white" : "bg-white text-[#0F172A]";
    const muted = dark ? "text-gray-300" : "text-gray-500";
    const ctrlBtn = `w-11 h-11 rounded-full shadow-lg flex items-center justify-center transition ${dark ? "bg-[#2b3036] text-white" : "bg-white text-gray-800"}`;

    if (!validDest) {
        return (
            <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">
                Position du point de retrait inconnue.
            </div>
        );
    }

    return (
        <div className="edoto-nav relative w-full h-full overflow-hidden bg-[#e9eef2]">
            <div ref={containerRef} style={{ position: "absolute", inset: 0 }} aria-label={`Carte : itinéraire vers ${destName || "le point de retrait"}`} />

            {!ready && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
                    <Loader2 className="animate-spin" size={30} color={COLORS.brand} />
                </div>
            )}

            {/* ---------------- Bandeau haut : manœuvre / état */}
            <div className="absolute top-0 inset-x-0 p-3 flex items-start gap-2 z-20 pointer-events-none" style={{ paddingTop: "max(12px, env(safe-area-inset-top))" }}>
                {onClose && (
                    <button onClick={onClose} aria-label="Fermer la carte" className={`${ctrlBtn} pointer-events-auto shrink-0`}>
                        <X size={20} />
                    </button>
                )}
                <div className="flex-1 min-w-0 max-w-md space-y-2 pointer-events-auto">
                    {arrived ? (
                        <div className="rounded-2xl bg-[#188038] text-white shadow-xl px-4 py-3 flex items-center gap-3">
                            <Flag size={26} />
                            <div className="min-w-0">
                                <p className="font-semibold text-lg leading-tight">Vous êtes arrivé</p>
                                <p className="text-sm opacity-90 truncate">{destName}</p>
                            </div>
                        </div>
                    ) : info && camera !== "overview" ? (
                        <div className="rounded-2xl bg-[#0B57D0] text-white shadow-xl px-4 py-3 flex items-center gap-3">
                            <ManeuverIcon size={34} strokeWidth={2.4} className="shrink-0" />
                            <div className="min-w-0">
                                <p className="text-2xl font-bold leading-tight">{formatDistance(info.stepDist)}</p>
                                <p className="text-[15px] leading-snug opacity-95">{info.step.instruction}</p>
                            </div>
                        </div>
                    ) : (
                        <div className={`rounded-2xl shadow-xl px-4 py-3 ${panel}`}>
                            <p className={`text-xs uppercase tracking-wide ${muted}`}>Itinéraire vers</p>
                            <p className="font-semibold truncate">{destName || "Point de retrait"}</p>
                        </div>
                    )}
                    {(geo.status === "error" || routeState.status === "error") && (
                        <div role="alert" className="rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 shadow-xl px-4 py-3 text-sm flex items-start gap-2">
                            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                            <span className="flex-1">{geo.message || routeState.message}</span>
                            <button onClick={retryRoute} className="shrink-0 font-semibold underline flex items-center gap-1">
                                <RefreshCw size={14} /> Réessayer
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* ---------------- Commandes latérales */}
            <div className="absolute right-3 z-20 flex flex-col gap-2.5" style={{ top: "40%" }}>
                <button onClick={toggleOrientation} className={ctrlBtn}
                    aria-label={orientation === "heading" ? "Orientation : sens de la marche (passer au Nord)" : "Orientation : Nord (passer au sens de la marche)"}
                    title={orientation === "heading" ? "Sens de la marche" : "Nord en haut"}>
                    <Compass size={20} style={{ transform: `rotate(${-mapBearing}deg)`, transition: "transform .2s" }}
                        color={orientation === "heading" ? COLORS.route : undefined} />
                </button>
                <button onClick={toggle3d} className={ctrlBtn} aria-pressed={view3d} aria-label="Vue 3D" title="Vue 3D">
                    <Box size={20} color={view3d ? COLORS.route : undefined} />
                </button>
                <button onClick={changeTheme} className={ctrlBtn} aria-label={dark ? "Thème clair" : "Thème sombre"} title={dark ? "Thème clair" : "Thème sombre"}>
                    {dark ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <button onClick={toggleVoice} className={ctrlBtn} aria-pressed={voice} aria-label="Guidage vocal" title="Guidage vocal">
                    {voice ? <Volume2 size={20} color={COLORS.route} /> : <VolumeX size={20} />}
                </button>
                <button onClick={showOverview} className={ctrlBtn} aria-label="Voir tout l'itinéraire" title="Aperçu de l'itinéraire">
                    <Route size={20} />
                </button>
            </div>

            {camera === "free" && posRef.current && (
                <button onClick={recenter}
                    className="absolute z-20 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-full shadow-xl bg-white text-[#0B57D0] font-semibold text-sm flex items-center gap-2"
                    style={{ bottom: 210 }}>
                    <LocateFixed size={18} /> Recentrer
                </button>
            )}

            {/* ---------------- Panneau bas */}
            <div className={`absolute bottom-0 inset-x-0 z-20 rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.15)] px-5 pt-3 ${panel}`}
                style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom))" }}>
                <div className={`mx-auto mb-3 h-1.5 w-10 rounded-full ${dark ? "bg-gray-600" : "bg-gray-300"}`} />
                <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                        {info ? (
                            <>
                                <p className="text-2xl font-bold text-[#188038] leading-tight">{formatDuration(info.remainingS)}</p>
                                <p className={`text-sm ${muted}`}>
                                    {formatDistance(info.remainingM)} · arrivée {formatClock(info.eta)}
                                </p>
                            </>
                        ) : (
                            <p className={`text-sm flex items-center gap-2 ${muted}`}>
                                {geo.status === "locating" || routeState.status === "loading"
                                    ? <><Loader2 size={16} className="animate-spin" /> {geo.status === "locating" ? "Localisation en cours…" : "Calcul de l'itinéraire…"}</>
                                    : "Itinéraire non disponible"}
                            </p>
                        )}
                    </div>
                    {routeState.status === "rerouting" && <Loader2 size={18} className="animate-spin text-gray-400" aria-label="Recalcul de l'itinéraire" />}
                    {info && camera === "overview" && !arrived && (
                        <button onClick={startNavigation}
                            className="shrink-0 px-6 py-3 rounded-full text-white font-semibold shadow-lg flex items-center gap-2"
                            style={{ background: COLORS.route }}>
                            <Navigation size={18} /> Démarrer
                        </button>
                    )}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                    <div className={`flex rounded-full p-1 ${dark ? "bg-[#2b3036]" : "bg-gray-100"}`} role="group" aria-label="Mode de déplacement">
                        {[["car", "Voiture / moto", Car], ["foot", "À pied", Footprints]].map(([key, label, Icon]) => (
                            <button key={key} onClick={() => changeMode(key)} aria-pressed={mode === key}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition ${mode === key ? "bg-[#0B57D0] text-white shadow" : ""}`}>
                                <Icon size={16} /> {label}
                            </button>
                        ))}
                    </div>
                    <a href={externalUrl} target="_blank" rel="noopener noreferrer"
                        className={`ml-auto flex items-center gap-1.5 text-sm font-medium ${dark ? "text-blue-300" : "text-[#0B57D0]"}`}>
                        <ExternalLink size={15} /> Ouvrir dans une app GPS
                    </a>
                </div>
            </div>

            <style jsx global>{`
                .edoto-nav .maplibregl-ctrl-bottom-left { bottom: 190px; }
                .edoto-user { width: 64px; height: 64px; position: relative; pointer-events: none; }
                .edoto-user-dot { position: absolute; left: 50%; top: 50%; width: 20px; height: 20px; margin: -10px 0 0 -10px;
                    border-radius: 50%; background: ${COLORS.user}; border: 3px solid #fff; box-shadow: 0 1px 6px rgba(0,0,0,.35); }
                .edoto-user-pulse { position: absolute; left: 50%; top: 50%; width: 20px; height: 20px; margin: -10px 0 0 -10px;
                    border-radius: 50%; background: ${COLORS.user}; opacity: .35; animation: edoto-pulse 2s ease-out infinite; }
                .edoto-user-cone { position: absolute; left: 50%; top: 0; width: 44px; height: 32px; margin-left: -22px; display: none;
                    background: radial-gradient(ellipse at 50% 100%, rgba(26,115,232,.55) 0%, rgba(26,115,232,0) 70%);
                    clip-path: polygon(50% 100%, 0 0, 100% 0); }
                .edoto-user.has-heading .edoto-user-cone { display: block; }
                @keyframes edoto-pulse { 0% { transform: scale(1); opacity: .45; } 100% { transform: scale(3.2); opacity: 0; } }
                .edoto-dest { display: flex; flex-direction: column; align-items: center; cursor: default; }
                .edoto-dest-label { margin-bottom: 4px; padding: 3px 10px; border-radius: 999px; background: #fff; color: #0F172A;
                    font: 600 12px/1.4 var(--edoto-font); box-shadow: 0 2px 8px rgba(0,0,0,.2); white-space: nowrap;
                    max-width: 180px; overflow: hidden; text-overflow: ellipsis; }
                @media (prefers-reduced-motion: reduce) { .edoto-user-pulse { animation: none; } }
            `}</style>
        </div>
    );
}
