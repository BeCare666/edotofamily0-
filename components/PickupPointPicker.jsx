"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { List, Map as MapIcon, Search, LocateFixed, Loader2, MapPinOff, Navigation } from "lucide-react";
import { NEARBY_RADIUS_KM } from "./map/mapConfig";
import { formatDistance, formatWithdrawals } from "./map/geo";

const PickupPointsMap = dynamic(() => import("./map/PickupPointsMap"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center bg-gray-50">
            <Loader2 className="animate-spin text-[#FF6EA9]" />
        </div>
    ),
});

const API = process.env.NEXT_PUBLIC_REST_API_ENDPOINT;
const PAGE_SIZE = 6;

async function fetchPoints(params) {
    const qs = new URLSearchParams({ role: "super_pickuppoint", ...params });
    const res = await fetch(`${API}/users?${qs.toString()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data?.data) ? data.data : [];
}

/**
 * Choix d'un point de retrait : les points à moins de 5 km de l'utilisateur, triés par distance,
 * en liste ou sur carte. Si aucun point proche : message + recherche parmi tous les points.
 * Les points bloqués restent visibles mais ne sont pas sélectionnables.
 */
export default function PickupPointPicker({ selectedId, onSelect }) {
    const [view, setView] = useState("list"); // list | map
    const [geo, setGeo] = useState({ status: "locating", position: null });
    const [scope, setScope] = useState("nearby"); // nearby | all
    const [points, setPoints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    const locate = useCallback(() => {
        if (!navigator.geolocation) {
            setGeo({ status: "unavailable", position: null });
            setScope("all");
            return;
        }
        setGeo({ status: "locating", position: null });
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setGeo({ status: "ok", position: { lat: pos.coords.latitude, lng: pos.coords.longitude } });
                setScope("nearby");
            },
            (err) => {
                setGeo({ status: err.code === 1 ? "denied" : "unavailable", position: null });
                setScope("all");
            },
            { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
        );
    }, []);

    useEffect(() => { locate(); }, [locate]);

    // Chargement des points selon le périmètre
    useEffect(() => {
        if (geo.status === "locating") return;
        let cancelled = false;
        setLoading(true);
        setError(null);
        const params = { limit: scope === "nearby" ? "50" : "200" };
        if (geo.position) {
            params.lat = String(geo.position.lat);
            params.lng = String(geo.position.lng);
        }
        if (scope === "nearby" && geo.position) params.radius_km = String(NEARBY_RADIUS_KM);
        fetchPoints(params)
            .then((rows) => { if (!cancelled) setPoints(rows); })
            .catch(() => { if (!cancelled) setError("Impossible de charger les points de retrait."); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [geo, scope]);

    useEffect(() => { setPage(1); }, [scope, search]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (scope !== "all" || !q) return points;
        return points.filter((p) =>
            (p.name || "").toLowerCase().includes(q) || (p.pickup_address || "").toLowerCase().includes(q));
    }, [points, search, scope]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const noNearby = scope === "nearby" && !loading && !error && points.length === 0;

    const choose = useCallback((p) => {
        if (p.status === "blocked") return;
        onSelect?.(p);
    }, [onSelect]);

    return (
        <div className="flex flex-col gap-3">
            {/* En-tête : périmètre + bascule liste / carte */}
            <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-gray-600 flex items-center gap-1.5 min-w-0">
                    {geo.status === "locating" ? (
                        <><Loader2 size={15} className="animate-spin shrink-0" /> Recherche de votre position…</>
                    ) : scope === "nearby" ? (
                        <><Navigation size={15} className="text-[#FF6EA9] shrink-0" /> Points à moins de {NEARBY_RADIUS_KM} km</>
                    ) : (
                        <span className="truncate">Tous les points de retrait</span>
                    )}
                </p>
                <div className="flex rounded-full bg-gray-100 p-1 shrink-0" role="tablist" aria-label="Affichage">
                    {[["list", "Liste", List], ["map", "Carte", MapIcon]].map(([key, label, Icon]) => (
                        <button key={key} role="tab" aria-selected={view === key} onClick={() => setView(key)}
                            className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition ${view === key ? "bg-white shadow text-[#0F172A]" : "text-gray-500"}`}>
                            <Icon size={15} /> {label}
                        </button>
                    ))}
                </div>
            </div>

            {(geo.status === "denied" || geo.status === "unavailable") && (
                <div className="rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm px-3 py-2 flex items-center justify-between gap-2">
                    <span>
                        {geo.status === "denied"
                            ? "Autorisez votre position pour voir les points les plus proches."
                            : "Position indisponible : voici tous les points de retrait."}
                    </span>
                    <button onClick={locate} className="shrink-0 font-semibold flex items-center gap-1 underline">
                        <LocateFixed size={14} /> Réessayer
                    </button>
                </div>
            )}

            {scope === "all" && (
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input type="search" placeholder="Rechercher un point de retrait ou un quartier…"
                        aria-label="Rechercher un point de retrait"
                        className="w-full pl-10 pr-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300"
                        value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
            )}

            {/* Contenu */}
            {loading || geo.status === "locating" ? (
                <div className="py-10 flex justify-center"><Loader2 className="animate-spin text-[#FF6EA9]" /></div>
            ) : error ? (
                <p className="py-6 text-center text-sm text-red-600">{error}</p>
            ) : noNearby ? (
                <div className="py-8 px-4 text-center">
                    <MapPinOff className="mx-auto text-gray-300 mb-3" size={40} />
                    <p className="font-semibold text-[#0F172A]">Aucun point de retrait proche</p>
                    <p className="text-sm text-gray-500 mt-1">Aucun point de retrait à moins de {NEARBY_RADIUS_KM} km de votre position.</p>
                    <button onClick={() => setScope("all")}
                        className="mt-4 px-5 py-2.5 rounded-xl bg-[#FF6EA9] text-white text-sm font-semibold hover:bg-[#ff579d] transition">
                        Rechercher d'autres points de retrait
                    </button>
                </div>
            ) : view === "map" ? (
                <div className="h-[340px] rounded-2xl overflow-hidden border border-gray-100">
                    <PickupPointsMap
                        points={filtered}
                        userPosition={geo.position}
                        radiusKm={scope === "nearby" ? NEARBY_RADIUS_KM : null}
                        selectedId={selectedId}
                        onSelect={choose}
                    />
                </div>
            ) : (
                <>
                    <ul className="max-h-80 overflow-y-auto pr-1 space-y-2.5">
                        {pageData.map((p) => {
                            const blocked = p.status === "blocked";
                            const selected = Number(p.id) === Number(selectedId);
                            return (
                                <li key={p.id}>
                                    <button type="button" onClick={() => choose(p)} disabled={blocked} aria-pressed={selected}
                                        className={`w-full text-left p-3.5 border rounded-xl transition flex items-start justify-between gap-3 ${blocked
                                            ? "bg-gray-50 opacity-60 cursor-not-allowed"
                                            : selected ? "bg-pink-50 border-pink-500" : "hover:border-pink-400"}`}>
                                        <span className="min-w-0">
                                            <span className="flex items-center gap-2">
                                                <span className="font-semibold truncate">{p.name}</span>
                                                {blocked && (
                                                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-200 text-gray-600 shrink-0">Bloqué</span>
                                                )}
                                            </span>
                                            {p.pickup_address && <span className="block text-sm text-gray-500 truncate">{p.pickup_address}</span>}
                                            <span className="block text-xs text-gray-500 mt-0.5">{formatWithdrawals(p.withdrawals_count)}</span>
                                        </span>
                                        {p.distance_km != null && (
                                            <span className="shrink-0 text-sm font-semibold text-[#0B57D0]">{formatDistance(p.distance_km * 1000)}</span>
                                        )}
                                    </button>
                                </li>
                            );
                        })}
                        {pageData.length === 0 && <li className="text-center text-gray-500 py-6 text-sm">Aucun résultat</li>}
                    </ul>
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between text-sm">
                            <button disabled={page === 1} onClick={() => setPage((n) => n - 1)}
                                className="px-3 py-1 border rounded-lg disabled:opacity-30">Précédent</button>
                            <span className="text-gray-500">{page} / {totalPages}</span>
                            <button disabled={page === totalPages} onClick={() => setPage((n) => n + 1)}
                                className="px-3 py-1 border rounded-lg disabled:opacity-30">Suivant</button>
                        </div>
                    )}
                </>
            )}

            {scope === "all" && geo.status === "ok" && (
                <button onClick={() => setScope("nearby")} className="text-sm text-[#FF6EA9] font-medium hover:underline self-center">
                    Revenir aux points les plus proches
                </button>
            )}
        </div>
    );
}
