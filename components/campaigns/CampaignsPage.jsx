"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import {
    MapPin, Search, SlidersHorizontal, X, Gift, CalendarDays, LocateFixed, Loader2, ArrowUpRight, Check,
    ShieldAlert, Users, PackageCheck, Building2, Radio,
} from "lucide-react";
import { CampaignRequestFlow, kitSteps } from "./CampaignKit";
import CampaignDetail, { Ring } from "./CampaignDetail";
import { STATUS, beninDay, daysUntil, endMoment, nf, shortDate, startMoment } from "./campaignUtils";
import { BENIN_CITIES, detectCity, normCity, saveCity, savedCity } from "../../lib/beninCities";
import { deviceMarks } from "../../lib/deviceIdentity";

const CampaignsMap = dynamic(() => import("./CampaignsMap"), {
    ssr: false,
    loading: () => <div className="flex h-full min-h-[320px] items-center justify-center text-white/40"><Loader2 className="animate-spin" /></div>,
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

function Seg({ active, onClick, children, count }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`relative inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold transition ${active ? "text-white" : "text-[#5C5249] hover:text-[#1F1B16]"}`}
        >
            {active && <motion.span layoutId="seg" className="absolute inset-0 rounded-full bg-[#1F1B16] shadow-[0_10px_24px_-12px_rgba(31,27,22,0.8)]" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
            <span className="relative">{children}</span>
            {count != null && <span className={`relative rounded-full px-1.5 text-[11px] tabular-nums ${active ? "bg-white/20" : "bg-[#F1ECE4] text-[#7A6E62]"}`}>{count}</span>}
        </button>
    );
}

function Chip({ active, onClick, children, count }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-medium transition ${active ? "bg-[#1F1B16] text-white" : "bg-white text-[#3B342D] ring-1 ring-[#EFE8DE] hover:ring-[#C9A96E]"}`}
        >
            {children}
            {count != null && <span className={`rounded-full px-1.5 text-[11px] tabular-nums ${active ? "bg-white/20" : "bg-[#F6F1EA] text-[#9A8E80]"}`}>{count}</span>}
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
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0, transition: { delay: Math.min(index, 6) * 0.05 } }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="group flex flex-col overflow-hidden rounded-[30px] bg-white ring-1 ring-[#EFE8DE] shadow-[0_24px_60px_-38px_rgba(31,27,22,0.55)] transition hover:-translate-y-1 hover:shadow-[0_34px_70px_-36px_rgba(194,24,91,0.45)]"
        >
            <button type="button" onClick={() => onOpen(c)} className="relative block h-52 overflow-hidden bg-[#1F1B16] text-left">
                {c.image_url ? (
                    <img src={c.image_url} alt="" loading="lazy" className="h-full w-full object-cover opacity-90 transition duration-700 group-hover:scale-105" />
                ) : (
                    <div className="h-full w-full bg-[radial-gradient(400px_220px_at_15%_10%,rgba(255,110,169,0.5),transparent_60%),radial-gradient(360px_200px_at_95%_95%,rgba(201,169,110,0.45),transparent_60%)]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F0C0A]/90 via-[#0F0C0A]/20 to-transparent" />
                <div className="absolute left-4 right-4 top-4 flex items-start justify-between gap-2">
                    <span className={`inline-flex items-center gap-1.5 rounded-full bg-black/30 px-3 py-1 text-[11px] font-semibold ring-1 backdrop-blur ${st.chip}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${st.dot} ${live ? "animate-pulse" : ""}`} />
                        {st.label}
                    </span>
                    {near && <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-[#1F1B16]">Près de chez vous</span>}
                </div>
                <div className="absolute inset-x-4 bottom-4">
                    <p className="flex items-center gap-1.5 text-[12px] text-white/75">
                        <MapPin size={13} /> {(c.cities || []).join(" · ") || c.location || "—"}
                    </p>
                    <h3 className="mt-1 line-clamp-2 font-brand text-[26px] font-semibold leading-[1.05] text-white">{c.title}</h3>
                </div>
            </button>

            <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center gap-4">
                    <Ring value={Number(c.picked_up_count) || 0} max={objective} size={84} stroke={8} caption="retirés" />
                    <dl className="grid flex-1 grid-cols-2 gap-x-3 gap-y-2.5 text-[12px]">
                        <div><dt className="text-[#9A8E80]">Kits prévus</dt><dd className="text-[15px] font-semibold tabular-nums text-[#1F1B16]">{nf(objective)}</dd></div>
                        <div><dt className="text-[#9A8E80]">Demandes</dt><dd className="text-[15px] font-semibold tabular-nums text-[#1F1B16]">{nf(c.registrations_count)}</dd></div>
                        <div className="col-span-2">
                            <dt className="text-[#9A8E80]">{live ? "Clôture" : "Ouverture"}</dt>
                            <dd className="text-[13px] font-medium text-[#1F1B16]">
                                {live ? (c.date_end ? shortDate(c.date_end) : "Non définie") : shortDate(c.date_start)}
                                {left != null && <span className="ml-1.5 text-[#C2185B]">· {left === 0 ? "aujourd'hui" : `${left} j`}</span>}
                            </dd>
                        </div>
                    </dl>
                </div>

                {track && (
                    <div className="mt-4 flex items-center gap-2 rounded-2xl bg-emerald-50/80 px-3.5 py-2.5 text-[12px] font-medium text-emerald-800 ring-1 ring-emerald-100">
                        <Check size={14} strokeWidth={3} />
                        {track.withdrawn ? "Kit retiré" : track.validated ? "Code validé au point" : track.expired ? "Code expiré : à renouveler" : "Demande envoyée · code reçu par e-mail"}
                    </div>
                )}

                <div className="mt-auto flex gap-2 pt-5">
                    <button type="button" onClick={() => onOpen(c)} className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-2xl bg-[#F6F1EA] text-[13px] font-semibold text-[#1F1B16] transition hover:bg-[#EFE8DE]">
                        Voir la campagne <ArrowUpRight size={15} />
                    </button>
                    {live && !registration && (
                        <button type="button" onClick={() => onRequest(c)} className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-[#FF6EA9] to-[#C2185B] text-[13px] font-semibold text-white shadow-[0_12px_26px_-14px_rgba(194,24,91,0.9)]">
                            <Gift size={15} /> Mon kit
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
        <div className="min-h-screen bg-[#FBF7F2] pb-28 sm:pb-16">
            {/* ------------------------------------------------ Héros */}
            <section className="relative overflow-hidden bg-[#0F0C0A] text-white">
                <div className="pointer-events-none absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-[#FF6EA9]/20 blur-[120px]" />
                <div className="pointer-events-none absolute -bottom-48 right-[-120px] h-[520px] w-[520px] rounded-full bg-[#C9A96E]/15 blur-[120px]" />
                <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:22px_22px]" />

                <div className="relative mx-auto grid max-w-7xl gap-8 px-4 pb-10 pt-10 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:px-8 lg:pb-14 lg:pt-14">
                    <div className="flex flex-col justify-center">
                        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex w-fit items-center gap-2 rounded-full bg-white/[0.06] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#F6C8DB] ring-1 ring-white/10">
                            <Radio size={13} className="text-[#FF6EA9]" /> Campagnes solidaires
                        </motion.p>
                        <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.05 } }} className="mt-5 font-brand text-[44px] font-semibold leading-[0.98] tracking-tight sm:text-[60px] lg:text-[68px]">
                            Des kits d’hygiène offerts,{" "}
                            <span className="bg-gradient-to-r from-[#FF9CC6] via-[#FF6EA9] to-[#E9D3A6] bg-clip-text text-transparent">près de chez vous.</span>
                        </motion.h1>
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.12 } }} className="mt-5 max-w-xl text-[15px] leading-relaxed text-white/65">
                            Choisissez votre campagne, votre point de retrait, et recevez votre code par e-mail. Une demande par personne, suivie étape par étape.
                        </motion.p>

                        {/* Ville */}
                        <div className="mt-7 flex flex-wrap items-center gap-2.5">
                            <button
                                type="button"
                                onClick={() => setCityPicker(true)}
                                className="inline-flex items-center gap-2.5 rounded-2xl bg-white/[0.07] py-2.5 pl-3 pr-4 text-left ring-1 ring-white/15 transition hover:bg-white/[0.12]"
                            >
                                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FF6EA9]/20 text-[#FF9CC6]">
                                    {me.status === "locating" ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} />}
                                </span>
                                <span>
                                    <span className="block text-[10px] uppercase tracking-[0.18em] text-white/45">Votre ville</span>
                                    <span className="block text-[14px] font-semibold">
                                        {me.city || (me.status === "locating" ? "Détection…" : "Choisir ma ville")}
                                        {me.city && <span className="ml-2 text-[12px] font-normal text-white/45">{me.source === "detected" ? "détectée" : "choisie"} · changer</span>}
                                    </span>
                                </span>
                            </button>
                            {me.status !== "locating" && (
                                <button type="button" onClick={locate} className="inline-flex items-center gap-1.5 rounded-2xl px-3 py-2.5 text-[12px] font-medium text-white/60 ring-1 ring-white/10 hover:text-white">
                                    <LocateFixed size={14} /> Me localiser
                                </button>
                            )}
                        </div>
                        {me.city && !loading && (
                            <p className="mt-3 text-[13px] text-white/60">
                                {liveHere.length > 0 ? (
                                    <><span className="font-semibold text-[#FF9CC6]">{liveHere.length} campagne{liveHere.length > 1 ? "s" : ""} en cours</span> à {me.city}.</>
                                ) : soonHere.length > 0 ? (
                                    <>Aucune campagne en cours à {me.city} ; <span className="font-semibold text-[#E9D3A6]">{soonHere.length} à venir</span>.</>
                                ) : (
                                    <>Aucune campagne à {me.city} pour le moment.</>
                                )}
                            </p>
                        )}
                        {me.status === "denied" && !me.city && <p className="mt-3 text-[12px] text-white/45">Localisation refusée : choisissez votre ville.</p>}

                        {/* Chiffres réels des campagnes en cours */}
                        <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {[
                                { k: "En cours", v: kpis.live, icon: Radio },
                                { k: "Villes", v: kpis.cities, icon: Building2 },
                                { k: "Kits prévus", v: kpis.planned, icon: Gift },
                                { k: "Kits retirés", v: kpis.withdrawn, icon: PackageCheck },
                            ].map(({ k, v, icon: Icon }) => (
                                <div key={k} className="rounded-2xl bg-white/[0.05] p-3.5 ring-1 ring-white/10">
                                    <Icon size={15} className="text-[#C9A96E]" />
                                    <dd className="mt-2 font-brand text-[30px] font-semibold leading-none tabular-nums">{loading ? "—" : nf(v)}</dd>
                                    <dt className="mt-1 text-[11px] text-white/50">{k}</dt>
                                </div>
                            ))}
                        </dl>
                    </div>

                    {/* Carte : villes des campagnes encerclées */}
                    <div ref={mapBox} className="relative overflow-hidden rounded-[32px] bg-[#16120F] ring-1 ring-white/10 shadow-[0_40px_90px_-40px_rgba(255,110,169,0.45)]">
                        <div className="h-[340px] sm:h-[420px] lg:h-full lg:min-h-[480px]">
                            <CampaignsMap zones={zones} userPosition={me.position} myCity={me.city} focusCity={focusCity} onCityClick={(city) => { setCityFilter(city); setStatus("all"); }} height="100%" />
                        </div>
                        <div className="pointer-events-none absolute inset-x-3 bottom-3 flex flex-wrap items-center gap-2 sm:inset-x-4 sm:bottom-4">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-[11px] text-white/85 backdrop-blur"><span className="h-2 w-2 rounded-full bg-[#FF6EA9]" /> En cours</span>
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-[11px] text-white/85 backdrop-blur"><span className="h-2 w-2 rounded-full bg-[#C9A96E]" /> À venir</span>
                            {me.position && <span className="inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-[11px] text-white/85 backdrop-blur"><span className="h-2 w-2 rounded-full bg-[#4AB3F4]" /> Vous</span>}
                        </div>
                    </div>
                </div>
            </section>

            {/* ------------------------------------------------ Filtres */}
            <div className="sticky top-[80px] z-30 border-b border-[#EFE8DE] bg-[#FBF7F2]/85 backdrop-blur-xl">
                <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                        <div className="-mx-1 flex gap-1 overflow-x-auto rounded-full bg-white p-1 ring-1 ring-[#EFE8DE] [scrollbar-width:none] lg:mx-0">
                            <Seg active={status === "en_cours"} onClick={() => setStatus("en_cours")} count={active.length}>En cours</Seg>
                            <Seg active={status === "a_venir"} onClick={() => setStatus("a_venir")} count={upcoming.length}>À venir</Seg>
                            <Seg active={status === "all"} onClick={() => setStatus("all")} count={all.length}>Toutes</Seg>
                        </div>
                        <div className="flex flex-1 gap-2">
                            <label className="relative flex-1">
                                <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9A8E80]" />
                                <input
                                    type="search"
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    placeholder="Campagne, ville…"
                                    aria-label="Rechercher une campagne"
                                    className="h-11 w-full rounded-2xl border-0 bg-white pl-11 pr-10 text-[14px] text-[#1F1B16] ring-1 ring-[#EFE8DE] placeholder:text-[#B3A89B] focus:outline-none focus:ring-2 focus:ring-[#FF6EA9]/50"
                                />
                                {searchInput && (
                                    <button type="button" onClick={() => setSearchInput("")} aria-label="Effacer" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-[#9A8E80]">
                                        <X size={15} />
                                    </button>
                                )}
                            </label>
                            <button
                                type="button"
                                onClick={() => setPanel(true)}
                                className={`relative flex h-11 shrink-0 items-center gap-2 rounded-2xl px-4 text-[13px] font-semibold transition ${advanced ? "bg-[#1F1B16] text-white" : "bg-white text-[#1F1B16] ring-1 ring-[#EFE8DE]"}`}
                            >
                                <SlidersHorizontal size={16} />
                                <span className="hidden sm:inline">Filtres</span>
                                {advanced > 0 && <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#FF6EA9] px-1 text-[11px] font-bold text-white">{advanced}</span>}
                            </button>
                        </div>
                    </div>
                    {/* Villes en un geste */}
                    {cityCounts.length > 0 && (
                        <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-0.5 [scrollbar-width:none] sm:mx-0 sm:px-0">
                            <Chip active={!cityFilter && !mineOnly} onClick={() => { setCityFilter(""); setMineOnly(false); }}>Toutes les villes</Chip>
                            {me.city && <Chip active={mineOnly} onClick={() => { setMineOnly((v) => !v); setCityFilter(""); }}><MapPin size={13} /> Ma ville</Chip>}
                            {cityCounts.map(([city, n]) => (
                                <Chip key={city} active={normCity(cityFilter) === normCity(city)} onClick={() => { setCityFilter(normCity(cityFilter) === normCity(city) ? "" : city); setMineOnly(false); setFocusCity(city); }} count={n}>
                                    {city}
                                </Chip>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ------------------------------------------------ Liste */}
            <main className="mx-auto max-w-7xl px-4 pt-7 sm:px-6 lg:px-8">
                <div className="mb-5 flex items-end justify-between gap-3">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#C2185B]">{status === "en_cours" ? "En ce moment" : status === "a_venir" ? "Bientôt" : "Toutes les campagnes"}</p>
                        <h2 className="mt-1 font-brand text-[32px] font-semibold leading-none text-[#1F1B16] sm:text-[38px]">
                            {loading ? "Chargement…" : `${list.length} campagne${list.length > 1 ? "s" : ""}`}
                        </h2>
                    </div>
                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        aria-label="Trier"
                        className="hidden rounded-xl border-0 bg-transparent py-1 pl-2 pr-7 text-[13px] font-medium text-[#3B342D] focus:outline-none focus:ring-2 focus:ring-[#FF6EA9]/40 sm:block"
                    >
                        {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                </div>

                {loadError ? (
                    <div className="rounded-[28px] bg-white p-10 text-center ring-1 ring-[#EFE8DE]">
                        <p className="text-sm text-[#7A6E62]">Impossible de charger les campagnes.</p>
                        <button type="button" onClick={() => { setLoading(true); loadCampaigns(); }} className="mt-4 rounded-full bg-[#1F1B16] px-5 py-2.5 text-sm font-semibold text-white">Réessayer</button>
                    </div>
                ) : loading ? (
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {[0, 1, 2].map((i) => <div key={i} className="h-[420px] animate-pulse rounded-[30px] bg-white ring-1 ring-[#EFE8DE]" />)}
                    </div>
                ) : list.length === 0 ? (
                    <div className="flex flex-col items-center rounded-[30px] bg-white px-6 py-16 text-center ring-1 ring-[#EFE8DE]">
                        <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#F6F1EA] text-[#C9A96E]"><CalendarDays size={28} strokeWidth={1.6} /></span>
                        <p className="mt-4 font-brand text-[24px] font-semibold text-[#1F1B16]">
                            {status === "en_cours" && !cityFilter && !mineOnly && !search ? "Aucune campagne en cours" : "Aucune campagne ne correspond"}
                        </p>
                        <p className="mt-1 max-w-sm text-sm text-[#7A6E62]">
                            {status === "en_cours" && upcoming.length > 0 ? "Découvrez les prochaines distributions." : "Modifiez les filtres pour voir plus de campagnes."}
                        </p>
                        <div className="mt-5 flex flex-wrap justify-center gap-2">
                            {(cityFilter || mineOnly || search || sort !== "ending") && <button type="button" onClick={resetFilters} className="rounded-full bg-[#F1ECE4] px-5 py-2.5 text-sm font-semibold text-[#3B342D]">Effacer les filtres</button>}
                            {status === "en_cours" && upcoming.length > 0 && <button type="button" onClick={() => setStatus("a_venir")} className="rounded-full bg-[#1F1B16] px-5 py-2.5 text-sm font-semibold text-white">Voir les campagnes à venir</button>}
                        </div>
                    </div>
                ) : (
                    <motion.div layout className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        <AnimatePresence initial={false}>
                            {list.map((c, i) => (
                                <CampaignCard key={c.id} c={c} index={i} myCity={me.city} registration={regByCampaign.get(Number(c.id))} onOpen={setDetail} onRequest={request} />
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* Comment ça marche : les étapes réelles d'une demande */}
                <section className="mt-14 overflow-hidden rounded-[32px] bg-[#1F1B16] p-6 text-white sm:p-10">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#F6C8DB]">Votre kit en 4 étapes</p>
                    <ol className="mt-6 grid gap-4 sm:grid-cols-4">
                        {[
                            ["Demande", "Choisissez votre ville et votre point de retrait."],
                            ["Code par e-mail", "Votre code de retrait vous est envoyé aussitôt."],
                            ["Validation", "Le point de retrait vérifie votre code."],
                            ["Kit remis", "Vous repartez avec votre kit."],
                        ].map(([t, d], i) => (
                            <li key={t} className="relative rounded-2xl bg-white/[0.05] p-5 ring-1 ring-white/10">
                                <span className="font-brand text-[40px] font-semibold leading-none text-[#C9A96E]">0{i + 1}</span>
                                <p className="mt-3 font-semibold">{t}</p>
                                <p className="mt-1 text-[13px] leading-relaxed text-white/55">{d}</p>
                            </li>
                        ))}
                    </ol>
                    <p className="mt-6 flex items-center gap-2 text-[12px] text-white/45"><Users size={14} /> Une seule demande par personne et par campagne.</p>
                </section>
            </main>

            {/* ------------------------------------------------ Panneau de filtres */}
            <AnimatePresence>
                {panel && (
                    <>
                        <motion.div className="fixed inset-0 z-[65] bg-[#0F0C0A]/35 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPanel(false)} />
                        <motion.div
                            role="dialog"
                            aria-label="Filtres des campagnes"
                            className="fixed inset-x-0 bottom-0 z-[66] max-h-[88vh] overflow-y-auto rounded-t-[32px] bg-[#FBF7F2] p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-[540px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[32px]"
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", stiffness: 380, damping: 36 }}
                        >
                            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[#E5DDD2] sm:hidden" />
                            <div className="mb-5 flex items-center justify-between">
                                <p className="font-brand text-[26px] font-semibold text-[#1F1B16]">Filtres</p>
                                <button type="button" onClick={() => setPanel(false)} aria-label="Fermer" className="rounded-full bg-[#F1ECE4] p-2 text-[#3B342D]"><X size={16} /></button>
                            </div>
                            <div className="space-y-6">
                                <section>
                                    <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9A8E80]">Statut</p>
                                    <div className="flex flex-wrap gap-2">
                                        <Chip active={status === "en_cours"} onClick={() => setStatus("en_cours")} count={active.length}>En cours</Chip>
                                        <Chip active={status === "a_venir"} onClick={() => setStatus("a_venir")} count={upcoming.length}>À venir</Chip>
                                        <Chip active={status === "all"} onClick={() => setStatus("all")} count={all.length}>Toutes</Chip>
                                    </div>
                                </section>
                                <section>
                                    <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9A8E80]">Ville</p>
                                    <div className="flex flex-wrap gap-2">
                                        {me.city && <Chip active={mineOnly} onClick={() => { setMineOnly((v) => !v); setCityFilter(""); }}><MapPin size={13} /> Ma ville ({me.city})</Chip>}
                                        {cityCounts.map(([city, n]) => (
                                            <Chip key={city} active={normCity(cityFilter) === normCity(city)} onClick={() => { setCityFilter(normCity(cityFilter) === normCity(city) ? "" : city); setMineOnly(false); }} count={n}>{city}</Chip>
                                        ))}
                                        {cityCounts.length === 0 && <p className="text-[13px] text-[#9A8E80]">Aucune ville pour ce statut.</p>}
                                    </div>
                                </section>
                                <section>
                                    <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9A8E80]">Trier par</p>
                                    <div className="flex flex-wrap gap-2">
                                        {SORTS.map((s) => <Chip key={s.value} active={sort === s.value} onClick={() => setSort(s.value)}>{s.label}</Chip>)}
                                    </div>
                                </section>
                            </div>
                            <div className="mt-7 flex gap-2">
                                <button type="button" onClick={resetFilters} className="h-12 flex-1 rounded-2xl bg-[#F1ECE4] text-sm font-semibold text-[#3B342D]">Réinitialiser</button>
                                <button type="button" onClick={() => setPanel(false)} className="h-12 flex-[2] rounded-2xl bg-[#1F1B16] text-sm font-semibold text-white">
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
                        <motion.div className="fixed inset-0 z-[400] bg-[#0F0C0A]/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCityPicker(false)} />
                        <motion.div
                            role="dialog"
                            aria-label="Choisir ma ville"
                            className="fixed inset-y-0 right-0 z-[410] flex w-full max-w-md flex-col bg-[#0F0C0A] text-white"
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", stiffness: 320, damping: 34 }}
                        >
                            <div className="flex items-center justify-between px-6 pb-4 pt-6">
                                <p className="font-brand text-[28px] font-semibold">Votre ville</p>
                                <button type="button" onClick={() => setCityPicker(false)} aria-label="Fermer" className="rounded-full bg-white/10 p-2"><X size={18} /></button>
                            </div>
                            <div className="px-6">
                                <button type="button" onClick={() => { setCityPicker(false); locate(); }} className="mb-3 flex w-full items-center gap-3 rounded-2xl bg-[#FF6EA9]/15 px-4 py-3.5 text-left text-[14px] font-semibold text-[#FFB8D5] ring-1 ring-[#FF6EA9]/30">
                                    <LocateFixed size={18} /> Utiliser ma position
                                </button>
                                <label className="relative block">
                                    <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                                    <input autoFocus value={citySearch} onChange={(e) => setCitySearch(e.target.value)} placeholder="Rechercher une ville…" className="h-12 w-full rounded-2xl border-0 bg-white/[0.06] pl-11 pr-4 text-[14px] text-white ring-1 ring-white/10 placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-[#FF6EA9]/50" />
                                </label>
                            </div>
                            <ul className="mt-4 flex-1 space-y-1.5 overflow-y-auto px-6 pb-8">
                                {filteredCities.map((city) => {
                                    const live = active.some((c) => hasCity(c, city));
                                    const soon = !live && upcoming.some((c) => hasCity(c, city));
                                    const current = me.city && normCity(me.city) === normCity(city);
                                    return (
                                        <li key={city}>
                                            <button type="button" onClick={() => chooseCity(city)} className={`flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-left transition ${current ? "bg-white text-[#1F1B16]" : "bg-white/[0.04] hover:bg-white/[0.09]"}`}>
                                                <span className="font-medium">{city}</span>
                                                {live ? <span className="rounded-full bg-[#FF6EA9]/20 px-2.5 py-0.5 text-[11px] font-semibold text-[#FF9CC6]">En cours</span> : soon ? <span className="rounded-full bg-[#C9A96E]/20 px-2.5 py-0.5 text-[11px] font-semibold text-[#E9D3A6]">À venir</span> : current ? <Check size={16} /> : null}
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
                    <motion.div className="fixed inset-0 z-[300] flex items-center justify-center bg-[#0F0C0A]/60 p-4 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setBlocked(null)}>
                        <motion.div onClick={(e) => e.stopPropagation()} initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.94, opacity: 0 }} className="w-full max-w-md rounded-[32px] bg-[#FBF7F2] p-8 text-center shadow-2xl">
                            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#1F1B16] text-[#C9A96E]"><ShieldAlert size={28} /></span>
                            <p className="mt-5 font-brand text-[26px] font-semibold leading-tight text-[#1F1B16]">{blocked.reason === "not_active" ? "Demandes fermées" : "Demande déjà faite"}</p>
                            <p className="mt-2 text-sm leading-relaxed text-[#6B6158]">{blocked.message}</p>
                            <button type="button" onClick={() => setBlocked(null)} className="mt-7 h-12 w-full rounded-2xl bg-[#1F1B16] text-sm font-semibold text-white">J’ai compris</button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {checking && (
                <div className="fixed inset-0 z-[290] flex items-center justify-center bg-[#0F0C0A]/30 backdrop-blur-[2px]">
                    <div className="flex items-center gap-3 rounded-2xl bg-[#1F1B16] px-5 py-4 text-sm text-white shadow-2xl"><Loader2 size={18} className="animate-spin text-[#FF6EA9]" /> Vérification…</div>
                </div>
            )}
        </div>
    );
}
