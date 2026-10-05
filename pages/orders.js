"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Package,
    Truck,
    CheckCircle2,
    XCircle,
    Clock,
    CreditCard,
    ChevronRight,
    ChevronLeft,
    Search,
    SlidersHorizontal,
    MapPin,
    X,
    RotateCcw,
    Wallet,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import CampaignKitsSection from "../components/CampaignKitsSection";

// « Mes commandes » : liste et filtres côté serveur (GET /orders et /orders/facets, limités par
// l'API au compte connecté). Chaque option de filtre et chaque chiffre viennent de la base.
const API = process.env.NEXT_PUBLIC_REST_API_ENDPOINT;
const PAGE_SIZE = 8;

const ORDER_STATUS = {
    "order-pending": { label: "En attente", tone: "amber", icon: Clock },
    "order-processing": { label: "En traitement", tone: "sky", icon: RotateCcw },
    "order-at-local-facility": { label: "Au point de retrait", tone: "violet", icon: MapPin },
    "order-out-for-delivery": { label: "En livraison", tone: "violet", icon: Truck },
    "order-completed": { label: "Retirée / livrée", tone: "green", icon: CheckCircle2 },
    "order-cancelled": { label: "Annulée", tone: "slate", icon: XCircle },
    "order-refunded": { label: "Remboursée", tone: "slate", icon: RotateCcw },
    "order-failed": { label: "Échouée", tone: "red", icon: XCircle },
};
const PAYMENT_STATUS = {
    "payment-success": { label: "Payée", tone: "green" },
    "payment-pending": { label: "Paiement en attente", tone: "amber" },
    "payment-processing": { label: "Paiement en cours", tone: "sky" },
    "payment-failed": { label: "Paiement échoué", tone: "red" },
    "payment-cash-on-delivery": { label: "Paiement à la livraison", tone: "slate" },
    "payment-cash": { label: "Espèces", tone: "slate" },
    "payment-wallet": { label: "Portefeuille", tone: "slate" },
    "payment-awaiting-for-approval": { label: "En attente de validation", tone: "amber" },
};
const DELIVERY = { PICKUP: "Point de retrait", CUSTOM: "Livraison à domicile" };
const TONE = {
    amber: "bg-amber-50 text-amber-700 ring-amber-200/70",
    sky: "bg-sky-50 text-sky-700 ring-sky-200/70",
    violet: "bg-violet-50 text-violet-700 ring-violet-200/70",
    green: "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
    slate: "bg-slate-100 text-slate-600 ring-slate-200/70",
    red: "bg-rose-50 text-rose-700 ring-rose-200/70",
};
const ICON_TONE = {
    amber: "from-amber-100 to-amber-50 text-amber-600",
    sky: "from-sky-100 to-sky-50 text-sky-600",
    violet: "from-violet-100 to-violet-50 text-violet-600",
    green: "from-emerald-100 to-emerald-50 text-emerald-600",
    slate: "from-slate-100 to-slate-50 text-slate-500",
    red: "from-rose-100 to-rose-50 text-rose-600",
};
const SORTS = [
    { value: "created_at:desc", label: "Plus récentes" },
    { value: "created_at:asc", label: "Plus anciennes" },
    { value: "total:desc", label: "Montant décroissant" },
    { value: "total:asc", label: "Montant croissant" },
];
const EMPTY = { order_status: "", payment_status: "", delivery_type: "", date_from: "", date_to: "", min_total: "", max_total: "" };

const fcfa = (n) => `${Math.round(Number(n) || 0).toLocaleString("fr-FR")} FCFA`;
const fmtDate = (d) => new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
const fmtShort = (s) => new Date(`${s}T00:00:00`).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });

async function getJson(path) {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API}/${path}`, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || "Erreur serveur");
    return data;
}

// Étapes réelles d'une commande : commandée → payée → retirée / livrée
function steps(o) {
    const paid = o.payment_status === "payment-success";
    const done = o.order_status === "order-completed";
    return [
        { label: "Commandée", on: true },
        { label: "Payée", on: paid || done },
        { label: o.delivery_type === "CUSTOM" ? "Livrée" : "Retirée", on: done },
    ];
}

function Chip({ active, onClick, children, count }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium transition ${
                active
                    ? "bg-slate-900 text-white shadow-[0_8px_20px_-10px_rgba(15,23,42,0.7)]"
                    : "bg-white text-slate-700 ring-1 ring-slate-200 hover:ring-slate-300"
            }`}
        >
            {children}
            {count != null && (
                <span className={`rounded-full px-1.5 text-[11px] tabular-nums ${active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>{count}</span>
            )}
        </button>
    );
}

export default function OrdersPage() {
    const router = useRouter();
    const [ready, setReady] = useState(false);
    const [orders, setOrders] = useState([]);
    const [meta, setMeta] = useState({ total: 0, last_page: 1 });
    const [facets, setFacets] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [values, setValues] = useState(EMPTY);
    const [sort, setSort] = useState("created_at:desc");
    const [panel, setPanel] = useState(false);

    // Connexion requise
    useEffect(() => {
        if (!localStorage.getItem("token")) {
            localStorage.setItem("redirect_after_login", window.location.pathname);
            router.push("/login");
            return;
        }
        setReady(true);
    }, [router]);

    useEffect(() => {
        const tm = setTimeout(() => {
            setSearch(searchInput.trim());
            setPage(1);
        }, 400);
        return () => clearTimeout(tm);
    }, [searchInput]);

    // Compteurs réels (tout le périmètre du compte)
    useEffect(() => {
        if (!ready) return;
        getJson("orders/facets").then(setFacets).catch(() => setFacets(null));
    }, [ready]);

    const load = useCallback(async () => {
        if (!ready) return;
        setLoading(true);
        setError(null);
        try {
            const [orderBy, sortedBy] = sort.split(":");
            const qs = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE), orderBy, sortedBy });
            if (search) qs.set("search", search);
            Object.entries(values).forEach(([k, v]) => v && qs.set(k, v));
            const data = await getJson(`orders?${qs.toString()}`);
            setOrders(data.data || []);
            setMeta({ total: Number(data.total || 0), last_page: Math.max(1, Number(data.last_page || 1)) });
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [ready, page, search, values, sort]);

    // Petite pause : la saisie d'un montant ne lance pas une requête par chiffre
    useEffect(() => {
        const tm = setTimeout(load, 250);
        return () => clearTimeout(tm);
    }, [load]);

    const set = (patch) => {
        setValues((v) => ({ ...v, ...patch }));
        setPage(1);
    };
    const reset = () => {
        setValues(EMPTY);
        setSearchInput("");
        setSearch("");
        setSort("created_at:desc");
        setPage(1);
    };

    // Chiffres du compte, à partir des compteurs réels
    const stats = useMemo(() => {
        if (!facets) return null;
        const pay = Object.fromEntries((facets.payment_status || []).map((p) => [p.value, p.count]));
        const st = Object.fromEntries((facets.order_status || []).map((p) => [p.value, p.count]));
        return {
            total: facets.total || 0,
            toPay: pay["payment-pending"] || 0,
            done: st["order-completed"] || 0,
        };
    }, [facets]);

    const pills = [];
    if (values.payment_status) pills.push({ k: "payment_status", label: PAYMENT_STATUS[values.payment_status]?.label || values.payment_status, clear: { payment_status: "" } });
    if (values.delivery_type) pills.push({ k: "delivery_type", label: DELIVERY[values.delivery_type] || values.delivery_type, clear: { delivery_type: "" } });
    if (values.date_from || values.date_to)
        pills.push({
            k: "dates",
            label: values.date_from && values.date_to ? `${fmtShort(values.date_from)} → ${fmtShort(values.date_to)}` : values.date_from ? `Depuis le ${fmtShort(values.date_from)}` : `Jusqu'au ${fmtShort(values.date_to)}`,
            clear: { date_from: "", date_to: "" },
        });
    if (values.min_total || values.max_total)
        pills.push({
            k: "amount",
            label: values.min_total && values.max_total ? `${fcfa(values.min_total)} – ${fcfa(values.max_total)}` : values.min_total ? `≥ ${fcfa(values.min_total)}` : `≤ ${fcfa(values.max_total)}`,
            clear: { min_total: "", max_total: "" },
        });
    const advancedCount = pills.length;
    const anyFilter = advancedCount > 0 || values.order_status || search;

    if (!ready) return null;

    return (
        <div className="relative min-h-screen bg-[radial-gradient(1200px_500px_at_10%_-10%,#FFE4F0_0%,transparent_60%),radial-gradient(900px_400px_at_100%_0%,#E0F2FE_0%,transparent_55%)]">
            <div className="mx-auto max-w-5xl px-4 pb-16 pt-8 sm:px-6 sm:pt-12">
                {/* En-tête */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-7">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#E0457F]">Mon espace</p>
                    <h1 className="mt-1.5 text-[32px] font-semibold leading-tight tracking-tight text-slate-900 sm:text-[40px]">Mes commandes</h1>
                    <p className="mt-1.5 text-sm text-slate-500">Suivez le paiement et le retrait de chacune de vos commandes.</p>
                </motion.div>

                {/* Chiffres réels du compte */}
                <div className="-mx-4 mb-6 flex snap-x gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0">
                    {[
                        { label: "Commandes", value: stats?.total, icon: Package, tone: "from-slate-900 to-slate-700 text-white", sub: "au total" },
                        { label: "À payer", value: stats?.toPay, icon: CreditCard, tone: "from-[#FF6EA9] to-[#C2185B] text-white", sub: "paiement en attente", filter: { payment_status: "payment-pending" } },
                        { label: "Retirées / livrées", value: stats?.done, icon: CheckCircle2, tone: "from-emerald-500 to-emerald-600 text-white", sub: "terminées", quick: "order-completed" },
                    ].map((c) => (
                        <button
                            key={c.label}
                            type="button"
                            onClick={() => (c.filter ? set({ ...c.filter }) : c.quick ? set({ order_status: c.quick }) : reset())}
                            className="group relative min-w-[200px] snap-start overflow-hidden rounded-3xl bg-white/80 p-4 text-left ring-1 ring-white shadow-[0_14px_40px_-22px_rgba(15,23,42,0.35)] backdrop-blur transition hover:-translate-y-0.5 sm:min-w-0"
                        >
                            <span className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br ${c.tone} shadow-sm`}>
                                <c.icon size={19} strokeWidth={1.8} />
                            </span>
                            <p className="mt-3 text-[26px] font-semibold tabular-nums leading-none text-slate-900">{c.value ?? "—"}</p>
                            <p className="mt-1.5 text-[13px] font-medium text-slate-700">{c.label}</p>
                            <p className="text-[11px] text-slate-400">{c.sub}</p>
                        </button>
                    ))}
                </div>

                {/* Recherche, tri, filtres */}
                <div className="sticky top-[84px] z-20 -mx-4 mb-5 bg-gradient-to-b from-white/90 via-white/80 to-white/0 px-4 pb-3 pt-2 backdrop-blur-md sm:static sm:mx-0 sm:bg-none sm:px-0 sm:pt-0 sm:backdrop-blur-0">
                    <div className="flex gap-2">
                        <label className="relative flex-1">
                            <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="search"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="N° de commande ou code de retrait"
                                aria-label="Rechercher une commande"
                                className="h-12 w-full rounded-2xl border-0 bg-white pl-11 pr-10 text-[14px] text-slate-800 shadow-[0_8px_24px_-16px_rgba(15,23,42,0.4)] ring-1 ring-slate-200/80 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF6EA9]/50"
                            />
                            {searchInput && (
                                <button type="button" onClick={() => setSearchInput("")} aria-label="Effacer" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:text-slate-600">
                                    <X size={16} />
                                </button>
                            )}
                        </label>
                        <button
                            type="button"
                            onClick={() => setPanel(true)}
                            className={`relative flex h-12 shrink-0 items-center gap-2 rounded-2xl px-4 text-[13px] font-semibold shadow-[0_8px_24px_-16px_rgba(15,23,42,0.4)] transition ${
                                advancedCount ? "bg-slate-900 text-white" : "bg-white text-slate-800 ring-1 ring-slate-200/80"
                            }`}
                        >
                            <SlidersHorizontal size={17} />
                            <span className="hidden sm:inline">Filtres</span>
                            {advancedCount > 0 && (
                                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#FF6EA9] px-1 text-[11px] font-bold text-white">{advancedCount}</span>
                            )}
                        </button>
                    </div>

                    {/* Statuts présents sur le compte, avec leur nombre */}
                    <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0">
                        <Chip active={!values.order_status} onClick={() => set({ order_status: "" })} count={facets?.total}>
                            Toutes
                        </Chip>
                        {(facets?.order_status || []).map((s) => (
                            <Chip key={s.value} active={values.order_status === s.value} onClick={() => set({ order_status: values.order_status === s.value ? "" : s.value })} count={s.count}>
                                {ORDER_STATUS[s.value]?.label || s.value}
                            </Chip>
                        ))}
                    </div>

                    {(pills.length > 0 || anyFilter) && (
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            {pills.map((p) => (
                                <button key={p.k} type="button" onClick={() => set(p.clear)} className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF1F7] py-1 pl-3 pr-2 text-[12px] font-medium text-[#C2185B] ring-1 ring-[#FFD0E4]">
                                    {p.label}
                                    <X size={13} />
                                </button>
                            ))}
                            <button type="button" onClick={reset} className="ml-auto text-[12px] font-semibold text-slate-500 underline-offset-4 hover:text-slate-800 hover:underline">
                                Tout effacer
                            </button>
                        </div>
                    )}
                </div>

                {/* Résultats */}
                <div className="mb-3 flex items-center justify-between text-[13px] text-slate-500">
                    <span>{loading ? "Recherche…" : `${meta.total} commande${meta.total > 1 ? "s" : ""}`}</span>
                    <select
                        value={sort}
                        onChange={(e) => {
                            setSort(e.target.value);
                            setPage(1);
                        }}
                        aria-label="Trier"
                        className="rounded-xl border-0 bg-transparent py-1 pl-2 pr-7 text-[13px] font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#FF6EA9]/40"
                    >
                        {SORTS.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                    </select>
                </div>

                {error ? (
                    <div className="rounded-3xl bg-white p-8 text-center text-sm text-rose-600 ring-1 ring-rose-100">{error}</div>
                ) : loading && orders.length === 0 ? (
                    <div className="space-y-3">
                        {[0, 1, 2].map((i) => (
                            <div key={i} className="h-36 animate-pulse rounded-3xl bg-white/70 ring-1 ring-slate-100" />
                        ))}
                    </div>
                ) : orders.length === 0 ? (
                    <div className="flex flex-col items-center rounded-3xl bg-white/80 px-6 py-16 text-center ring-1 ring-slate-100">
                        <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-[#FFE4F0] to-[#FFF6FA] text-[#E0457F]">
                            <Package size={28} strokeWidth={1.6} />
                        </span>
                        <p className="mt-4 text-[15px] font-semibold text-slate-800">{anyFilter ? "Aucune commande ne correspond" : "Aucune commande pour le moment"}</p>
                        <p className="mt-1 max-w-xs text-sm text-slate-500">
                            {anyFilter ? "Modifiez ou effacez les filtres pour voir plus de commandes." : "Vos commandes s'afficheront ici une fois passées."}
                        </p>
                        {anyFilter ? (
                            <button type="button" onClick={reset} className="mt-5 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white">Effacer les filtres</button>
                        ) : (
                            <button type="button" onClick={() => router.push("/category/categories_id=all")} className="mt-5 rounded-full bg-gradient-to-r from-[#FF6EA9] to-[#C2185B] px-5 py-2.5 text-sm font-semibold text-white shadow-md">
                                Découvrir nos produits
                            </button>
                        )}
                    </div>
                ) : (
                    <motion.ul layout className={`space-y-3 transition-opacity ${loading ? "opacity-60" : ""}`}>
                        <AnimatePresence initial={false}>
                            {orders.map((o, idx) => {
                                const st = ORDER_STATUS[o.order_status] || { label: o.order_status, tone: "slate", icon: Package };
                                const pay = PAYMENT_STATUS[o.payment_status] || { label: o.payment_status, tone: "slate" };
                                const Icon = st.icon;
                                const s = steps(o);
                                const lastOn = s.filter((x) => x.on).length - 1;
                                const stopped = ["order-cancelled", "order-failed", "order-refunded"].includes(o.order_status);
                                return (
                                    <motion.li
                                        key={o.id}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0, transition: { delay: idx * 0.03 } }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => router.push(`/orders/${o.id}`)}
                                            className="group block w-full overflow-hidden rounded-3xl bg-white/90 text-left ring-1 ring-slate-100 shadow-[0_14px_40px_-26px_rgba(15,23,42,0.45)] backdrop-blur transition hover:-translate-y-0.5 hover:shadow-[0_22px_50px_-26px_rgba(194,24,91,0.35)] active:scale-[0.99]"
                                        >
                                            <div className="flex items-start gap-3.5 p-4 sm:p-5">
                                                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${ICON_TONE[st.tone]}`}>
                                                    <Icon size={21} strokeWidth={1.8} />
                                                </span>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="min-w-0">
                                                            <p className="truncate text-[15px] font-semibold text-slate-900">{o.tracking_number || `Commande #${o.id}`}</p>
                                                            <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-slate-500">
                                                                <span>{fmtDate(o.created_at)}</span>
                                                                <span className="text-slate-300">•</span>
                                                                <span className="inline-flex items-center gap-1">
                                                                    {o.delivery_type === "CUSTOM" ? <Truck size={12} /> : <MapPin size={12} />}
                                                                    {DELIVERY[o.delivery_type] || "Point de retrait"}
                                                                </span>
                                                            </p>
                                                        </div>
                                                        <div className="shrink-0 text-right">
                                                            <p className="text-[17px] font-semibold tabular-nums text-slate-900">{fcfa(o.total)}</p>
                                                            {Number(o.delivery_fee) > 0 && <p className="text-[11px] text-slate-400">dont livraison {fcfa(o.delivery_fee)}</p>}
                                                        </div>
                                                    </div>
                                                    <div className="mt-3 flex flex-wrap gap-1.5">
                                                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${TONE[st.tone]}`}>{st.label}</span>
                                                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${TONE[pay.tone]}`}>
                                                            <Wallet size={11} />
                                                            {pay.label}
                                                        </span>
                                                    </div>
                                                </div>
                                                <ChevronRight size={18} className="mt-1 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#E0457F]" />
                                            </div>

                                            {/* Progression réelle */}
                                            {!stopped && (
                                                <div className="border-t border-slate-100/80 bg-gradient-to-b from-slate-50/60 to-white px-4 py-3 sm:px-5">
                                                    <div className="flex items-center">
                                                        {s.map((step, i) => (
                                                            <div key={step.label} className={`flex items-center ${i < s.length - 1 ? "flex-1" : ""}`}>
                                                                <div className="flex items-center gap-1.5">
                                                                    <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${step.on ? "bg-gradient-to-br from-[#FF6EA9] to-[#C2185B] text-white" : "bg-slate-200 text-slate-500"}`}>
                                                                        {step.on ? "✓" : i + 1}
                                                                    </span>
                                                                    <span className={`text-[11px] font-medium ${step.on ? "text-slate-800" : "text-slate-400"}`}>{step.label}</span>
                                                                </div>
                                                                {i < s.length - 1 && (
                                                                    <span className="mx-2 h-[2px] flex-1 overflow-hidden rounded-full bg-slate-200">
                                                                        <span className={`block h-full rounded-full bg-gradient-to-r from-[#FF6EA9] to-[#C2185B] transition-all ${i < lastOn ? "w-full" : "w-0"}`} />
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </button>
                                    </motion.li>
                                );
                            })}
                        </AnimatePresence>
                    </motion.ul>
                )}

                {/* Pagination */}
                {meta.last_page > 1 && (
                    <div className="mt-6 flex items-center justify-between rounded-2xl bg-white/80 p-2 ring-1 ring-slate-100">
                        <button
                            type="button"
                            disabled={page <= 1}
                            onClick={() => setPage((p) => p - 1)}
                            className="flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-35"
                        >
                            <ChevronLeft size={16} /> Précédent
                        </button>
                        <span className="text-[13px] tabular-nums text-slate-500">
                            Page {page} / {meta.last_page}
                        </span>
                        <button
                            type="button"
                            disabled={page >= meta.last_page}
                            onClick={() => setPage((p) => p + 1)}
                            className="flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-35"
                        >
                            Suivant <ChevronRight size={16} />
                        </button>
                    </div>
                )}

                <div className="mt-12">
                    <CampaignKitsSection />
                </div>
            </div>

            {/* Panneau des filtres avancés (feuille en bas sur mobile, fenêtre centrée sur ordinateur) */}
            <AnimatePresence>
                {panel && (
                    <>
                        <motion.div
                            className="fixed inset-0 z-[65] bg-slate-900/30 backdrop-blur-[2px]"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setPanel(false)}
                        />
                        <motion.div
                            role="dialog"
                            aria-label="Filtres des commandes"
                            className="fixed inset-x-0 bottom-0 z-[66] max-h-[88vh] overflow-y-auto rounded-t-[32px] bg-[#FFFDFB] p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-[520px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[32px]"
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", stiffness: 380, damping: 36 }}
                        >
                            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-200 sm:hidden" />
                            <div className="mb-5 flex items-center justify-between">
                                <p className="text-lg font-semibold text-slate-900">Filtres</p>
                                <button type="button" onClick={() => setPanel(false)} aria-label="Fermer" className="rounded-full bg-slate-100 p-2 text-slate-600">
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <section>
                                    <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Paiement</p>
                                    <div className="flex flex-wrap gap-2">
                                        {(facets?.payment_status || []).map((p) => (
                                            <Chip key={p.value} active={values.payment_status === p.value} onClick={() => set({ payment_status: values.payment_status === p.value ? "" : p.value })} count={p.count}>
                                                {PAYMENT_STATUS[p.value]?.label || p.value}
                                            </Chip>
                                        ))}
                                    </div>
                                </section>
                                {(facets?.delivery_type || []).length > 0 && (
                                    <section>
                                        <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Mode de retrait</p>
                                        <div className="flex flex-wrap gap-2">
                                            {facets.delivery_type.map((d) => (
                                                <Chip key={d.value} active={values.delivery_type === d.value} onClick={() => set({ delivery_type: values.delivery_type === d.value ? "" : d.value })} count={d.count}>
                                                    {DELIVERY[d.value] || d.value}
                                                </Chip>
                                            ))}
                                        </div>
                                    </section>
                                )}
                                <section>
                                    <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Période</p>
                                    <div className="flex items-center gap-2">
                                        <input type="date" value={values.date_from} max={values.date_to || undefined} onChange={(e) => set({ date_from: e.target.value })} aria-label="Du" className="h-11 min-w-0 flex-1 rounded-2xl bg-white px-3 text-sm text-slate-800 ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-[#FF6EA9]/50" />
                                        <span className="text-slate-400">→</span>
                                        <input type="date" value={values.date_to} min={values.date_from || undefined} onChange={(e) => set({ date_to: e.target.value })} aria-label="Au" className="h-11 min-w-0 flex-1 rounded-2xl bg-white px-3 text-sm text-slate-800 ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-[#FF6EA9]/50" />
                                    </div>
                                </section>
                                <section>
                                    <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Montant (FCFA)</p>
                                    <div className="flex items-center gap-2">
                                        <input type="number" min={0} inputMode="numeric" placeholder="Min" value={values.min_total} onChange={(e) => set({ min_total: e.target.value })} className="h-11 min-w-0 flex-1 rounded-2xl bg-white px-3 text-sm text-slate-800 ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-[#FF6EA9]/50" />
                                        <span className="text-slate-400">–</span>
                                        <input type="number" min={0} inputMode="numeric" placeholder="Max" value={values.max_total} onChange={(e) => set({ max_total: e.target.value })} className="h-11 min-w-0 flex-1 rounded-2xl bg-white px-3 text-sm text-slate-800 ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-[#FF6EA9]/50" />
                                    </div>
                                    {facets?.total_range?.max != null && (
                                        <p className="mt-1.5 text-[11px] text-slate-400">
                                            Vos commandes : de {fcfa(facets.total_range.min)} à {fcfa(facets.total_range.max)}
                                        </p>
                                    )}
                                </section>
                            </div>

                            <div className="mt-7 flex gap-2">
                                <button type="button" onClick={reset} className="h-12 flex-1 rounded-2xl bg-slate-100 text-sm font-semibold text-slate-700">
                                    Réinitialiser
                                </button>
                                <button type="button" onClick={() => setPanel(false)} className="h-12 flex-[2] rounded-2xl bg-gradient-to-r from-[#FF6EA9] to-[#C2185B] text-sm font-semibold text-white shadow-md">
                                    Voir {meta.total} commande{meta.total > 1 ? "s" : ""}
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
