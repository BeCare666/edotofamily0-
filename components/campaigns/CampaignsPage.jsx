"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { MapPin, Search, SlidersHorizontal, X, LocateFixed, Loader2, ArrowRight, Check } from "lucide-react";
import { CampaignRequestFlow, kitSteps } from "./CampaignKit";
import CampaignDetail, { Ring } from "./CampaignDetail";
import { STATUS, beninDay, daysUntil, endMoment, nf, shortDate, startMoment } from "./campaignUtils";
import { BENIN_CITIES, detectCity, normCity, saveCity, savedCity } from "../../lib/beninCities";
import { deviceMarks } from "../../lib/deviceIdentity";

const CampaignsMap = dynamic(() => import("./CampaignsMap"), {
    ssr: false,
    loading: () => <div className="flex h-full min-h-[320px] items-center justify-center text-[#A8A29B]"><Loader2 className="animate-spin" /></div>,
});

const API = process.env.NEXT_PUBLIC_REST_API_ENDPOINT;

const SORTS = [
    { value: "ending", label: "Clôture la plus proche" },
    { value: "recent", label: "Plus récentes" },
    { value: "objective", label: "Plus de kits prévus" },
    { value: "progress", label: "Progression" },
];

const asList = (d) => (Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : []);
const hasCity = (c, city) => !!city && (c.cities || []).some((x) => normCity(x) === normCity(city));

// Onglet de statut : texte souligné, sobre
function Seg({ active, onClick, children, count }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`relative shrink-0 pb-3 pt-1 text-[14px] transition ${active ? "font-medium text-[#161412]" : "text-[#8A847D] hover:text-[#161412]"}`}
        >
            {children}
            {count != null && <span className="ml-1.5 tabular-nums text-[#A8A29B]">{count}</span>}
            {active && <motion.span layoutId="seg" className="absolute inset-x-0 -bottom-px h-[2px] bg-[#161412]" transition={{ type: "spring", stiffness: 420, damping: 36 }} />}
        </button>
    );
}

function Chip({ active, onClick, children, count }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] transition ${active ? "border-[#161412] bg-[#161412] text-white" : "border-[#E2DCD5] bg-white text-[#3A3632] hover:border-[#161412]"}`}
        >
            {children}
            {count != null && <span className={`tabular-nums ${active ? "text-white/60" : "text-[#A8A29B]"}`}>{count}</span>}
        </button>
    );
}

// Carte d'une campagne dans la liste
function CampaignCard({ c, myCity, registration, onOpen, onRequest, index }) {
    const st = STATUS[c.status] || STATUS.en_cours;
    const live = c.status === "en_cours";
    const objective = Number(c.objective_kits) || 0;
    const left = live ? daysUntil(endMoment(c)) : daysUntil(startMoment(c));
    const near = hasCity(c, myCity);
    const track = registration ? kitSteps(registration) : null;
    return (
        <motion.article
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0, transition: { delay: Math.min(index, 6) * 0.04 } }}
            exit={{ opacity: 0 }}
            className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[#E7E2DC] bg-white transition hover:border-[#CFC8C0] hover:shadow-[0_20px_50px_-35px_rgba(22,20,18,0.45)]"
        >
            <button type="button" onClick={() => onOpen(c)} className="block text-left">
                {c.image_url ? (
                    <div className="aspect-[16/10] overflow-hidden bg-[#F4F1ED]">
                        <img src={c.image_url} alt="" loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" />
                    </div>
                ) : (
                    <div className="aspect-[16/10] bg-[#F4F1ED]" />
                )}
                <div className="px-5 pt-5">
                    <div className="flex items-center justify-between gap-2 text-[12px]">
                        <span className={`inline-flex items-center gap-1.5 font-medium ${st.text}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                            {st.label}
                        </span>
                        {near && <span className="text-[#77716B]">Près de chez vous</span>}
                    </div>
                    <h3 className="mt-2 line-clamp-2 font-brand text-[26px] font-semibold leading-[1.1] text-[#161412]">{c.title}</h3>
                    <p className="mt-1 flex items-center gap-1.5 text-[13px] text-[#77716B]">
                        <MapPin size={13} strokeWidth={1.8} /> {(c.cities || []).join(" · ") || c.location || "Ville non renseignée"}
                    </p>
                </div>
            </button>

            <div className="flex flex-1 flex-col px-5 pb-5">
                <div className="mt-5 flex items-center gap-5 border-t border-[#EDE8E2] pt-5">
                    <Ring value={Number(c.picked_up_count) || 0} max={objective} size={76} stroke={4} caption="retirés" />
                    <dl className="grid flex-1 grid-cols-2 gap-x-3 gap-y-3 text-[12px]">
                        <div><dt className="text-[#8A847D]">Kits prévus</dt><dd className="text-[15px] font-medium tabular-nums text-[#161412]">{nf(objective)}</dd></div>
                        <div><dt className="text-[#8A847D]">Demandes</dt><dd className="text-[15px] font-medium tabular-nums text-[#161412]">{nf(c.registrations_count)}</dd></div>
                        <div className="col-span-2">
                            <dt className="text-[#8A847D]">{live ? "Clôture" : "Ouverture"}</dt>
                            <dd className="text-[13px] font-medium text-[#161412]">
                                {live ? (c.date_end ? shortDate(c.date_end) : "Non définie") : shortDate(c.date_start)}
                                {left != null && <span className="ml-1.5 font-normal text-[#77716B]">· {left === 0 ? "aujourd'hui" : `dans ${left} j`}</span>}
                            </dd>
                        </div>
                    </dl>
                </div>

                {track && (
                    <p className="mt-4 flex items-center gap-2 text-[13px] text-[#3A3632]">
                        <Check size={14} strokeWidth={2.2} />
                        {track.withdrawn ? "Kit retiré" : track.validated ? "Code validé au point" : track.expired ? "Code expiré : à renouveler" : "Demande envoyée · code reçu par e-mail"}
                    </p>
                )}

                <div className="mt-auto flex gap-2 pt-5">
                    <button type="button" onClick={() => onOpen(c)} className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full border border-[#E2DCD5] text-[13px] font-medium text-[#161412] transition hover:border-[#161412]">
                        Voir la campagne
                    </button>
                    {live && !registration && (
                        <button type="button" onClick={() => onRequest(c)} className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full bg-[#161412] text-[13px] font-medium text-white transition hover:bg-black">
                            Demander mon kit
                        </button>
                    )}
                </div>
            </div>
        </motion.article>
    );
}

export default function CampaignsPage() {
    const router = useRouter();
    const [active, setActive] = useState([]);
    const [upcoming, setUpcoming] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [regs, setRegs] = useState([]);

    // Ville de l'utilisatrice
    const [me, setMe] = useState({ city: null, source: null, position: null, status: "idle" });
    const [cityPicker, setCityPicker] = useState(false);
    const [citySearch, setCitySearch] = useState("");

    // Filtres (par défaut : campagnes en cours)
    const [status, setStatus] = useState("en_cours");
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [cityFilter, setCityFilter] = useState("");
    const [mineOnly, setMineOnly] = useState(false);
    const [sort, setSort] = useState("ending");
    const [panel, setPanel] = useState(false);

    const [detail, setDetail] = useState(null);
    const [flow, setFlow] = useState(null);
    const [blocked, setBlocked] = useState(null);
    const [checking, setChecking] = useState(null);
    const [regenerating, setRegenerating] = useState(false);
    const [focusCity, setFocusCity] = useState(null);
    const mapBox = useRef(null);

    const loadCampaigns = useCallback(async () => {
        try {
            const [a, u] = await Promise.all([fetch(`${API}/campaigns/active`), fetch(`${API}/campaigns/upcoming`)]);
            if (!a.ok || !u.ok) throw new Error();
            setActive(asList(await a.json().catch(() => null)));
            setUpcoming(asList(await u.json().catch(() => null)));
            setLoadError(false);
        } catch {
            setLoadError(true);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadRegs = useCallback(async () => {
        const token = localStorage.getItem("token");
        if (!token) return setRegs([]);
        try {
            const r = await fetch(`${API}/campaign-registrations/mine`, { headers: { Authorization: `Bearer ${token}` } });
            const d = await r.json().catch(() => []);
            setRegs(r.ok && Array.isArray(d) ? d : []);
        } catch {
            setRegs([]);
        }
    }, []);

    const locate = useCallback(async () => {
        setMe((m) => ({ ...m, status: "locating" }));
        const r = await detectCity();
        if (r.status === "ok") setMe({ city: r.city, source: "detected", position: r.position, status: "ok" });
        else setMe((m) => ({ ...m, position: r.position || m.position, status: r.status }));
    }, []);

    useEffect(() => {
        loadCampaigns();
        loadRegs();
        // Ville mémorisée : affichée immédiatement ; sinon détection en arrière-plan (la page ne l'attend pas)
        const saved = savedCity();
        if (saved) setMe({ city: saved.city, source: saved.source, position: saved.position, status: "ok" });
        else locate();
    }, [loadCampaigns, loadRegs, locate]);

    useEffect(() => {
        const t = setTimeout(() => setSearch(searchInput.trim()), 250);
        return () => clearTimeout(t);
    }, [searchInput]);

    const all = useMemo(() => [...active, ...upcoming], [active, upcoming]);
    const regByCampaign = useMemo(() => {
        const m = new Map();
        regs.forEach((r) => !m.has(Number(r.campaign_id)) && m.set(Number(r.campaign_id), r));
        return m;
    }, [regs]);

    // Villes présentes dans les campagnes (avec leur nombre, selon le statut choisi)
    const scope = status === "en_cours" ? active : status === "a_venir" ? upcoming : all;
    const cityCounts = useMemo(() => {
        const m = new Map();
        scope.forEach((c) => (c.cities || []).forEach((x) => m.set(x, (m.get(x) || 0) + 1)));
        return [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    }, [scope]);

    const list = useMemo(() => {
        const q = normCity(search);
        let out = scope.filter((c) => {
            if (cityFilter && !hasCity(c, cityFilter)) return false;
            if (mineOnly && !hasCity(c, me.city)) return false;
            if (q && !normCity(`${c.title} ${(c.cities || []).join(" ")} ${c.description || ""}`).includes(q)) return false;
            return true;
        });
        const prog = (c) => (Number(c.objective_kits) ? (Number(c.picked_up_count) || 0) / Number(c.objective_kits) : 0);
        const ending = (c) => (c.status === "en_cours" ? endMoment(c)?.getTime() ?? Infinity : startMoment(c)?.getTime() ?? Infinity);
        out = [...out].sort((a, b) => {
            if (sort === "recent") return String(beninDay(b.date_start)).localeCompare(String(beninDay(a.date_start)));
            if (sort === "objective") return (Number(b.objective_kits) || 0) - (Number(a.objective_kits) || 0);
            if (sort === "progress") return prog(b) - prog(a);
            // en cours avant à venir, puis la plus proche de sa clôture / ouverture
            return (a.status === b.status ? 0 : a.status === "en_cours" ? -1 : 1) || ending(a) - ending(b);
        });
        // Les campagnes de ma ville en premier
        if (me.city) out.sort((a, b) => Number(hasCity(b, me.city)) - Number(hasCity(a, me.city)));
        return out;
    }, [scope, search, cityFilter, mineOnly, sort, me.city]);

    // Zones de la carte : chaque ville, avec les campagnes qui s'y déroulent (en cours prioritaire)
    const zones = useMemo(() => {
        const m = new Map();
        all.forEach((c) =>
            (c.cities || []).forEach((city) => {
                const k = normCity(city);
                const z = m.get(k) || { city, status: "a_venir", campaigns: [] };
                if (c.status === "en_cours") z.status = "en_cours";
                z.campaigns.push(c.title);
                m.set(k, z);
            }),
        );
        return [...m.values()];
    }, [all]);

    const kpis = useMemo(() => {
        const cities = new Set();
        active.forEach((c) => (c.cities || []).forEach((x) => cities.add(normCity(x))));
        return {
            live: active.length,
            cities: cities.size,
            planned: active.reduce((s, c) => s + (Number(c.objective_kits) || 0), 0),
            withdrawn: active.reduce((s, c) => s + (Number(c.picked_up_count) || 0), 0),
            requests: active.reduce((s, c) => s + (Number(c.registrations_count) || 0), 0),
        };
    }, [active]);

    const liveHere = me.city ? active.filter((c) => hasCity(c, me.city)) : [];
    const soonHere = me.city ? upcoming.filter((c) => hasCity(c, me.city)) : [];

    const chooseCity = (city) => {
        setMe((m) => ({ ...m, city, source: "chosen", status: "ok" }));
        saveCity(city, "chosen", me.position);
        setCityPicker(false);
        setCitySearch("");
        setFocusCity(city);
    };

    const showCity = (city) => {
        setDetail(null);
        setFocusCity(null);
        requestAnimationFrame(() => setFocusCity(city));
        mapBox.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    // « Demander mon kit » : connexion, demande déjà faite, puis contrôle appareil / connexion par l'API
    const request = async (c) => {
        const token = localStorage.getItem("token");
        if (!token) {
            localStorage.setItem("redirect_after_login", "/campaigns");
            toast("Connectez-vous pour demander votre kit.", { icon: "🔒" });
            router.push("/login");
            return;
        }
        if (regByCampaign.has(Number(c.id))) {
            setDetail(c);
            return;
        }
        setChecking(c.id);
        try {
            const res = await fetch(`${API}/campaigns/${c.id}/eligibility`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(await deviceMarks()),
            });
            if (res.status === 401) {
                localStorage.setItem("redirect_after_login", "/campaigns");
                router.push("/login");
                return;
            }
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data?.message);
            if (!data.eligible) {
                setBlocked({ campaign: c, ...data });
                return;
            }
            setDetail(null);
            setFlow(c);
        } catch (e) {
            toast.error(e?.message || "Vérification impossible. Réessayez.");
        } finally {
            setChecking(null);
        }
    };

    const regenerate = async (reg) => {
        setRegenerating(true);
        try {
            const res = await fetch(`${API}/campaign-registrations/${reg.id}/regenerate-otp`, {
                method: "POST",
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) return toast.error(data?.message || "Impossible de générer un nouveau code.");
            toast.success(data.message || "Un nouveau code vous a été envoyé par e-mail.");
            await loadRegs();
        } catch {
            toast.error("Erreur réseau. Veuillez réessayer.");
        } finally {
            setRegenerating(false);
        }
    };

    const resetFilters = () => {
        setSearchInput("");
        setSearch("");
        setCityFilter("");
        setMineOnly(false);
        setSort("ending");
    };
    const advanced = (cityFilter ? 1 : 0) + (mineOnly ? 1 : 0) + (sort !== "ending" ? 1 : 0);
    const filteredCities = BENIN_CITIES.filter((c) => normCity(c).includes(normCity(citySearch)));
    const detailReg = detail ? regByCampaign.get(Number(detail.id)) : null;

    return (
        <div className="min-h-screen bg-[#FAF8F5] pb-28 sm:pb-16">
            {/* ------------------------------------------------ En-tête de page */}
            <section className="border-b border-[#E7E2DC]">
                <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-12 pt-10 sm:px-6 grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-14 lg:px-8 lg:pb-16 lg:pt-16">
                    <div className="flex flex-col justify-center">
                        <p className="text-[13px] text-[#8A847D]">Campagnes solidaires E.doto</p>
                        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-3 font-brand text-[46px] font-semibold leading-[1.02] tracking-tight text-[#161412] sm:text-[60px] lg:text-[66px]">
                            Des kits d’hygiène offerts, près de chez vous.
                        </motion.h1>
                        <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-[#5E5953]">
                            Choisissez votre campagne et votre point de retrait, puis recevez votre code par e-mail. Une demande par personne, suivie étape par étape.
                        </p>

                        {/* Ville */}
                        <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[#E7E2DC] pt-6">
                            <button type="button" onClick={() => setCityPicker(true)} className="group text-left">
                                <span className="block text-[12px] text-[#8A847D]">Votre ville</span>
                                <span className="mt-0.5 flex items-center gap-2 text-[17px] font-medium text-[#161412]">
                                    {me.status === "locating" ? <Loader2 size={15} className="animate-spin text-[#8A847D]" /> : <MapPin size={16} strokeWidth={1.8} />}
                                    {me.city || (me.status === "locating" ? "Détection…" : "Choisir ma ville")}
                                    {me.city && <span className="text-[13px] font-normal text-[#8A847D] underline-offset-4 group-hover:underline">{me.source === "detected" ? "détectée" : "choisie"} · changer</span>}
                                </span>
                            </button>
                            {me.status !== "locating" && (
                                <button type="button" onClick={locate} className="inline-flex items-center gap-1.5 text-[13px] text-[#5E5953] underline-offset-4 hover:text-[#161412] hover:underline">
                                    <LocateFixed size={14} strokeWidth={1.8} /> Me localiser
                                </button>
                            )}
                        </div>
                        {me.city && !loading && (
                            <p className="mt-2 text-[14px] text-[#5E5953]">
                                {liveHere.length > 0 ? (
                                    <><span className="font-medium text-[#B8336A]">{liveHere.length} campagne{liveHere.length > 1 ? "s" : ""} en cours</span> à {me.city}.</>
                                ) : soonHere.length > 0 ? (
                                    <>Aucune campagne en cours à {me.city} ; <span className="font-medium text-[#161412]">{soonHere.length} à venir</span>.</>
                                ) : (
                                    <>Aucune campagne à {me.city} pour le moment.</>
                                )}
                            </p>
                        )}
                        {me.status === "denied" && !me.city && <p className="mt-2 text-[13px] text-[#8A847D]">Localisation refusée : choisissez votre ville.</p>}

                        {/* Chiffres réels des campagnes en cours */}
                        <dl className="mt-10 grid grid-cols-2 gap-y-6 sm:grid-cols-4 sm:divide-x sm:divide-[#E7E2DC]">
                            {[
                                ["Campagnes en cours", kpis.live],
                                ["Villes", kpis.cities],
                                ["Kits prévus", kpis.planned],
                                ["Kits retirés", kpis.withdrawn],
                            ].map(([k, v]) => (
                                <div key={k} className="sm:px-5 sm:first:pl-0">
                                    <dd className="font-brand text-[36px] font-semibold leading-none tabular-nums text-[#161412]">{loading ? "…" : nf(v)}</dd>
                                    <dt className="mt-1.5 text-[12px] text-[#8A847D]">{k}</dt>
                                </div>
                            ))}
                        </dl>
                    </div>

                    {/* Carte : villes des campagnes encerclées */}
                    <div ref={mapBox} className="relative overflow-hidden rounded-2xl border border-[#E7E2DC] bg-[#F4F1ED]">
                        <div className="h-[340px] sm:h-[420px] lg:h-full lg:min-h-[500px]">
                            <CampaignsMap zones={zones} userPosition={me.position} myCity={me.city} focusCity={focusCity} onCityClick={(city) => { setCityFilter(city); setStatus("all"); }} height="100%" />
                        </div>
                        <div className="pointer-events-none absolute bottom-3 left-3 flex flex-wrap items-center gap-3 rounded-lg border border-[#E7E2DC] bg-white/95 px-3 py-2 text-[11px] text-[#3A3632]">
                            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#D6457F]" /> En cours</span>
                            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#6F6A64]" /> À venir</span>
                            {me.position && <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#161412]" /> Vous</span>}
                        </div>
                    </div>
                </div>
            </section>

            {/* ------------------------------------------------ Filtres */}
            <div className="sticky top-[80px] z-30 border-b border-[#E7E2DC] bg-[#FAF8F5]/95 backdrop-blur">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-3 pt-3 lg:flex-row lg:items-end lg:justify-between">
                        <div className="flex gap-7 overflow-x-auto [scrollbar-width:none]">
                            <Seg active={status === "en_cours"} onClick={() => setStatus("en_cours")} count={active.length}>En cours</Seg>
                            <Seg active={status === "a_venir"} onClick={() => setStatus("a_venir")} count={upcoming.length}>À venir</Seg>
                            <Seg active={status === "all"} onClick={() => setStatus("all")} count={all.length}>Toutes</Seg>
                        </div>
                        <div className="flex gap-2 pb-3 lg:w-[460px]">
                            <label className="relative flex-1">
                                <Search size={16} strokeWidth={1.8} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8A847D]" />
                                <input
                                    type="search"
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    placeholder="Rechercher une campagne, une ville"
                                    aria-label="Rechercher une campagne"
                                    className="h-10 w-full rounded-full border border-[#E2DCD5] bg-white pl-10 pr-9 text-[14px] text-[#161412] placeholder:text-[#A8A29B] focus:border-[#161412] focus:outline-none"
                                />
                                {searchInput && (
                                    <button type="button" onClick={() => setSearchInput("")} aria-label="Effacer" className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#8A847D]">
                                        <X size={14} />
                                    </button>
                                )}
                            </label>
                            <button
                                type="button"
                                onClick={() => setPanel(true)}
                                className={`flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-[13px] font-medium transition ${advanced ? "border-[#161412] bg-[#161412] text-white" : "border-[#E2DCD5] bg-white text-[#161412] hover:border-[#161412]"}`}
                            >
                                <SlidersHorizontal size={15} strokeWidth={1.8} />
                                <span className="hidden sm:inline">Filtres</span>
                                {advanced > 0 && <span className="tabular-nums">{advanced}</span>}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ------------------------------------------------ Liste */}
            <main className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
                {cityCounts.length > 0 && (
                    <div className="-mx-4 mb-7 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
                        <Chip active={!cityFilter && !mineOnly} onClick={() => { setCityFilter(""); setMineOnly(false); }}>Toutes les villes</Chip>
                        {me.city && <Chip active={mineOnly} onClick={() => { setMineOnly((v) => !v); setCityFilter(""); }}>Ma ville</Chip>}
                        {cityCounts.map(([city, n]) => (
                            <Chip key={city} active={normCity(cityFilter) === normCity(city)} onClick={() => { setCityFilter(normCity(cityFilter) === normCity(city) ? "" : city); setMineOnly(false); setFocusCity(city); }} count={n}>
                                {city}
                            </Chip>
                        ))}
                    </div>
                )}

                <div className="mb-6 flex items-end justify-between gap-3">
                    <h2 className="font-brand text-[30px] font-semibold leading-none text-[#161412] sm:text-[34px]">
                        {loading ? "Chargement…" : loadError ? "Campagnes" : `${list.length} campagne${list.length > 1 ? "s" : ""}`}
                    </h2>
                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        aria-label="Trier"
                        className="hidden border-0 bg-transparent py-1 pl-2 pr-7 text-[13px] text-[#3A3632] focus:outline-none focus:ring-0 sm:block"
                    >
                        {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                </div>

                {loadError ? (
                    <div className="rounded-2xl border border-[#E7E2DC] bg-white p-10 text-center">
                        <p className="text-sm text-[#5E5953]">Impossible de charger les campagnes.</p>
                        <button type="button" onClick={() => { setLoading(true); loadCampaigns(); }} className="mt-4 rounded-full bg-[#161412] px-6 py-2.5 text-sm font-medium text-white">Réessayer</button>
                    </div>
                ) : loading ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {[0, 1, 2].map((i) => <div key={i} className="h-[440px] animate-pulse rounded-2xl border border-[#E7E2DC] bg-white" />)}
                    </div>
                ) : list.length === 0 ? (
                    <div className="rounded-2xl border border-[#E7E2DC] bg-white px-6 py-16 text-center">
                        <p className="font-brand text-[26px] font-semibold text-[#161412]">
                            {status === "en_cours" && !cityFilter && !mineOnly && !search ? "Aucune campagne en cours" : "Aucune campagne ne correspond"}
                        </p>
                        <p className="mx-auto mt-2 max-w-sm text-sm text-[#77716B]">
                            {status === "en_cours" && upcoming.length > 0 ? "Découvrez les prochaines distributions." : "Modifiez les filtres pour voir plus de campagnes."}
                        </p>
                        <div className="mt-6 flex flex-wrap justify-center gap-2">
                            {(cityFilter || mineOnly || search || sort !== "ending") && <button type="button" onClick={resetFilters} className="rounded-full border border-[#E2DCD5] px-5 py-2.5 text-sm text-[#3A3632]">Effacer les filtres</button>}
                            {status === "en_cours" && upcoming.length > 0 && <button type="button" onClick={() => setStatus("a_venir")} className="inline-flex items-center gap-1.5 rounded-full bg-[#161412] px-5 py-2.5 text-sm font-medium text-white">Campagnes à venir <ArrowRight size={15} /></button>}
                        </div>
                    </div>
                ) : (
                    <motion.div layout className="grid grid-cols-[minmax(0,1fr)] gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        <AnimatePresence initial={false}>
                            {list.map((c, i) => (
                                <CampaignCard key={c.id} c={c} index={i} myCity={me.city} registration={regByCampaign.get(Number(c.id))} onOpen={setDetail} onRequest={request} />
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* Les étapes réelles d'une demande */}
                <section className="mt-20 border-t border-[#E7E2DC] pt-10">
                    <h2 className="font-brand text-[30px] font-semibold text-[#161412]">Votre kit, en quatre étapes</h2>
                    <ol className="mt-8 grid gap-8 sm:grid-cols-4 sm:gap-6">
                        {[
                            ["Demande", "Choisissez votre ville et votre point de retrait."],
                            ["Code par e-mail", "Votre code de retrait vous est envoyé aussitôt."],
                            ["Validation", "Le point de retrait vérifie votre code."],
                            ["Kit remis", "Vous repartez avec votre kit."],
                        ].map(([t, d], i) => (
                            <li key={t}>
                                <span className="text-[13px] tabular-nums text-[#A8A29B]">0{i + 1}</span>
                                <p className="mt-2 border-t border-[#161412] pt-3 font-medium text-[#161412]">{t}</p>
                                <p className="mt-1 text-[14px] leading-relaxed text-[#77716B]">{d}</p>
                            </li>
                        ))}
                    </ol>
                    <p className="mt-8 text-[13px] text-[#8A847D]">Une seule demande par personne et par campagne.</p>
                </section>
            </main>

            {/* ------------------------------------------------ Panneau de filtres */}
            <AnimatePresence>
                {panel && (
                    <>
                        <motion.div className="fixed inset-0 z-[65] bg-[#161412]/30" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPanel(false)} />
                        <motion.div
                            role="dialog"
                            aria-label="Filtres des campagnes"
                            className="fixed inset-x-0 bottom-0 z-[66] max-h-[88vh] overflow-y-auto rounded-t-2xl bg-white p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-2xl sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-[520px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl"
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", stiffness: 380, damping: 38 }}
                        >
                            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#E2DCD5] sm:hidden" />
                            <div className="mb-6 flex items-center justify-between">
                                <p className="font-brand text-[28px] font-semibold text-[#161412]">Filtres</p>
                                <button type="button" onClick={() => setPanel(false)} aria-label="Fermer" className="rounded-full p-2 text-[#77716B] hover:bg-[#F4F1ED]"><X size={18} /></button>
                            </div>
                            <div className="space-y-7">
                                <section>
                                    <p className="mb-3 text-[13px] text-[#8A847D]">Statut</p>
                                    <div className="flex flex-wrap gap-2">
                                        <Chip active={status === "en_cours"} onClick={() => setStatus("en_cours")} count={active.length}>En cours</Chip>
                                        <Chip active={status === "a_venir"} onClick={() => setStatus("a_venir")} count={upcoming.length}>À venir</Chip>
                                        <Chip active={status === "all"} onClick={() => setStatus("all")} count={all.length}>Toutes</Chip>
                                    </div>
                                </section>
                                <section>
                                    <p className="mb-3 text-[13px] text-[#8A847D]">Ville</p>
                                    <div className="flex flex-wrap gap-2">
                                        {me.city && <Chip active={mineOnly} onClick={() => { setMineOnly((v) => !v); setCityFilter(""); }}>Ma ville ({me.city})</Chip>}
                                        {cityCounts.map(([city, n]) => (
                                            <Chip key={city} active={normCity(cityFilter) === normCity(city)} onClick={() => { setCityFilter(normCity(cityFilter) === normCity(city) ? "" : city); setMineOnly(false); }} count={n}>{city}</Chip>
                                        ))}
                                        {cityCounts.length === 0 && <p className="text-[13px] text-[#A8A29B]">Aucune ville pour ce statut.</p>}
                                    </div>
                                </section>
                                <section>
                                    <p className="mb-3 text-[13px] text-[#8A847D]">Trier par</p>
                                    <div className="flex flex-wrap gap-2">
                                        {SORTS.map((s) => <Chip key={s.value} active={sort === s.value} onClick={() => setSort(s.value)}>{s.label}</Chip>)}
                                    </div>
                                </section>
                            </div>
                            <div className="mt-8 flex gap-2">
                                <button type="button" onClick={resetFilters} className="h-12 flex-1 rounded-full border border-[#E2DCD5] text-sm text-[#3A3632]">Réinitialiser</button>
                                <button type="button" onClick={() => setPanel(false)} className="h-12 flex-[2] rounded-full bg-[#161412] text-sm font-medium text-white">
                                    Voir {list.length} campagne{list.length > 1 ? "s" : ""}
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* ------------------------------------------------ Choix de la ville */}
            <AnimatePresence>
                {cityPicker && (
                    <>
                        <motion.div className="fixed inset-0 z-[400] bg-[#161412]/30" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCityPicker(false)} />
                        <motion.div
                            role="dialog"
                            aria-label="Choisir ma ville"
                            className="fixed inset-y-0 right-0 z-[410] flex w-full max-w-md flex-col bg-white shadow-2xl"
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", stiffness: 320, damping: 36 }}
                        >
                            <div className="flex items-center justify-between px-6 pb-4 pt-6">
                                <p className="font-brand text-[30px] font-semibold text-[#161412]">Votre ville</p>
                                <button type="button" onClick={() => setCityPicker(false)} aria-label="Fermer" className="rounded-full p-2 text-[#77716B] hover:bg-[#F4F1ED]"><X size={18} /></button>
                            </div>
                            <div className="px-6">
                                <button type="button" onClick={() => { setCityPicker(false); locate(); }} className="mb-3 flex w-full items-center gap-3 rounded-xl border border-[#E2DCD5] px-4 py-3 text-left text-[14px] font-medium text-[#161412] hover:border-[#161412]">
                                    <LocateFixed size={17} strokeWidth={1.8} /> Utiliser ma position
                                </button>
                                <label className="relative block">
                                    <Search size={16} strokeWidth={1.8} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8A847D]" />
                                    <input autoFocus value={citySearch} onChange={(e) => setCitySearch(e.target.value)} placeholder="Rechercher une ville" className="h-11 w-full rounded-xl border border-[#E2DCD5] bg-white pl-11 pr-4 text-[14px] text-[#161412] placeholder:text-[#A8A29B] focus:border-[#161412] focus:outline-none" />
                                </label>
                            </div>
                            <ul className="mt-3 flex-1 divide-y divide-[#EDE8E2] overflow-y-auto px-6 pb-8">
                                {filteredCities.map((city) => {
                                    const live = active.some((c) => hasCity(c, city));
                                    const soon = !live && upcoming.some((c) => hasCity(c, city));
                                    const current = me.city && normCity(me.city) === normCity(city);
                                    return (
                                        <li key={city}>
                                            <button type="button" onClick={() => chooseCity(city)} className="flex w-full items-center justify-between py-3.5 text-left">
                                                <span className={`text-[15px] ${current ? "font-medium text-[#161412]" : "text-[#3A3632]"}`}>{city}</span>
                                                <span className="flex items-center gap-2 text-[12px]">
                                                    {live && <span className="inline-flex items-center gap-1.5 text-[#B8336A]"><span className="h-1.5 w-1.5 rounded-full bg-[#D6457F]" />En cours</span>}
                                                    {soon && <span className="text-[#77716B]">À venir</span>}
                                                    {current && <Check size={15} className="text-[#161412]" />}
                                                </span>
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* ------------------------------------------------ Fiche, demande, refus */}
            <AnimatePresence>
                {detail && (
                    <CampaignDetail
                        key={detail.id}
                        campaign={detail}
                        registration={detailReg}
                        myCity={me.city}
                        onClose={() => setDetail(null)}
                        onRequest={request}
                        onShowCity={showCity}
                        onRegenerate={regenerate}
                        regenerating={regenerating}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {flow && (
                    <CampaignRequestFlow
                        campaign={flow}
                        initialCity={(flow.cities || []).find((c) => me.city && normCity(c) === normCity(me.city)) || ""}
                        onClose={() => setFlow(null)}
                        onDone={() => {
                            loadRegs();
                            loadCampaigns();
                        }}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {blocked && (
                    <motion.div className="fixed inset-0 z-[300] flex items-center justify-center bg-[#161412]/40 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setBlocked(null)}>
                        <motion.div onClick={(e) => e.stopPropagation()} initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 12, opacity: 0 }} className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl">
                            <p className="font-brand text-[28px] font-semibold leading-tight text-[#161412]">{blocked.reason === "not_active" ? "Demandes fermées" : "Demande déjà faite"}</p>
                            <p className="mt-3 text-[14px] leading-relaxed text-[#5E5953]">{blocked.message}</p>
                            <button type="button" onClick={() => setBlocked(null)} className="mt-7 h-12 w-full rounded-full bg-[#161412] text-sm font-medium text-white">J’ai compris</button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {checking && (
                <div className="fixed inset-0 z-[290] flex items-center justify-center bg-[#161412]/15">
                    <div className="flex items-center gap-3 rounded-full bg-white px-5 py-3 text-sm text-[#161412] shadow-xl"><Loader2 size={16} className="animate-spin" /> Vérification…</div>
                </div>
            )}
        </div>
    );
}
