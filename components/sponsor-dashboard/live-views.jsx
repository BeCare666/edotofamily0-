"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Radio, RefreshCw, UserPlus, KeyRound, PackageCheck, MapPin, Building2, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { api, dateTime, qs } from "../pickup-dashboard/api";
import { Badge, Card, Empty, ErrorBox, SectionTitle, Skeleton, StatCard } from "../pickup-dashboard/ui";
import { HBars, PALETTE, StackedBars } from "../dashboard-ui/charts";
import { Chips, DateField, FilterPanel, SearchField, SelectField, dateFr, labelOf, useFilterState, useSponsorFilters } from "./filters";

const LiveMap = dynamic(() => import("./LiveMap"), { ssr: false, loading: () => <Skeleton className="h-[460px]" /> });

const REFRESH_MS = 30000; // carte en direct : nouvelle lecture toutes les 30 secondes
const pct = (v) => (v === null || v === undefined ? "non calculé" : `${String(v).replace(".", ",")} %`);
const n = (v) => Number(v || 0).toLocaleString("fr-FR");
const EVENT_ICON = { registration: UserPlus, validated: KeyRound, withdrawn: PackageCheck };
const EVENT_TONE = { registration: "ink", validated: "wait", withdrawn: "rose" };
const STATUS_TONE = { a_venir: "wait", en_cours: "rose", terminee: "ok" };
const SCOPE_OPTIONS = [
    { value: "en_cours", label: "En cours" },
    { value: "a_venir", label: "À venir" },
    { value: "terminee", label: "Terminées" },
    { value: "all", label: "Toutes" },
];

function ago(iso, now) {
    if (!iso) return "";
    const s = Math.max(0, Math.round((now - Date.parse(iso)) / 1000));
    if (s < 60) return "à l’instant";
    if (s < 3600) return `il y a ${Math.floor(s / 60)} min`;
    if (s < 86400) return `il y a ${Math.floor(s / 3600)} h`;
    return dateTime(iso);
}

function useNow(ms = 15000) {
    const [now, setNow] = useState(Date.now());
    useEffect(() => {
        const t = setInterval(() => setNow(Date.now()), ms);
        return () => clearInterval(t);
    }, [ms]);
    return now;
}

// Lecture d'une route avec rechargement automatique facultatif (onglet visible uniquement)
function usePolling(path, every) {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const alive = useRef(true);
    const load = useCallback(async () => {
        setLoading(true);
        try {
            const d = await api(path);
            if (alive.current) { setData(d); setError(null); }
        } catch (e) {
            if (alive.current) setError(e.message);
        } finally {
            if (alive.current) setLoading(false);
        }
    }, [path]);
    useEffect(() => {
        alive.current = true;
        setData(null);
        load();
        return () => { alive.current = false; };
    }, [load]);
    useEffect(() => {
        if (!every) return;
        const t = setInterval(() => document.visibilityState === "visible" && load(), every);
        return () => clearInterval(t);
    }, [every, load]);
    return { data, error, loading, load };
}

function EventRow({ e, now }) {
    const Icon = EVENT_ICON[e.type] || Radio;
    return (
        <li className="flex gap-3 py-3">
            <span className={`mt-0.5 w-9 h-9 shrink-0 rounded-xl flex items-center justify-center ${e.type === "withdrawn" ? "bg-[#FBEEF3] text-[#C2185B]" : e.type === "validated" ? "bg-[#FDF1E0] text-[#9A5B13]" : "bg-[#ECE9E4] text-[#3D3934]"}`}>
                <Icon size={16} />
            </span>
            <span className="min-w-0 flex-1">
                <span className="block text-sm text-[#1A1814]">{e.label}</span>
                <span className="block text-xs text-[#6B655D] truncate">{[e.point_name, e.city].filter(Boolean).join(" · ") || "Lieu non renseigné"}</span>
                <span className="block text-[11px] text-[#8A837A] truncate">{e.campaign_title}</span>
            </span>
            <span className="shrink-0 text-[11px] text-[#8A837A] whitespace-nowrap">{ago(e.at, now)}</span>
        </li>
    );
}

function Pager({ page, last, onPage }) {
    if (last <= 1) return null;
    return (
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-[#EFECE7] text-sm">
            <button disabled={page <= 1} onClick={() => onPage(page - 1)} className="inline-flex items-center gap-1 text-[#3D3934] disabled:opacity-30"><ChevronLeft size={16} /> Précédent</button>
            <span className="text-[#8A837A]">Page {page} sur {last}</span>
            <button disabled={page >= last} onClick={() => onPage(page + 1)} className="inline-flex items-center gap-1 text-[#3D3934] disabled:opacity-30">Suivant <ChevronRight size={16} /></button>
        </div>
    );
}

// ------------------------------------------------------------------ Carte en direct
const LIVE_INITIAL = { status: "en_cours", campaign: "" };
export function LiveView({ onOpenCampaign }) {
    const options = useSponsorFilters();
    const [f, set, reset] = useFilterState(LIVE_INITIAL);
    const [auto, setAuto] = useState(true);
    const [focus, setFocus] = useState(null);
    const now = useNow(10000);
    const { data, error, loading, load } = usePolling(`sponsor/live${qs({ campaign: f.campaign, status: f.campaign ? "" : f.status })}`, auto ? REFRESH_MS : 0);

    const active = [
        f.campaign && { key: "campaign", label: labelOf(options?.campaigns, f.campaign) },
        !f.campaign && f.status !== "en_cours" && { key: "status", label: labelOf(SCOPE_OPTIONS, f.status) },
    ].filter(Boolean);

    return (
        <div className="space-y-6">
            <SectionTitle
                title="Carte en direct"
                subtitle="Le déroulement de vos campagnes, point de retrait par point de retrait, mis à jour automatiquement."
                action={
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-2 rounded-full bg-white border border-[#E9E5DF] px-3 py-2 text-xs text-[#3D3934]">
                            <span className={`h-2 w-2 rounded-full ${auto ? "bg-[#3F6B45] animate-pulse" : "bg-[#8A837A]"}`} />
                            {data ? `Mis à jour ${ago(data.generated_at, now)}` : "Chargement"}
                        </span>
                        <button onClick={() => setAuto((v) => !v)} className="w-10 h-10 rounded-2xl bg-white border border-[#E9E5DF] flex items-center justify-center text-[#3D3934]" aria-label={auto ? "Suspendre la mise à jour automatique" : "Reprendre la mise à jour automatique"} title={auto ? "Suspendre" : "Reprendre"}>
                            {auto ? <Pause size={16} /> : <Play size={16} />}
                        </button>
                        <button onClick={load} className="w-10 h-10 rounded-2xl bg-white border border-[#E9E5DF] flex items-center justify-center text-[#3D3934]" aria-label="Actualiser maintenant" title="Actualiser">
                            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                        </button>
                    </div>
                }
            />

            <FilterPanel
                main={<>
                    <SelectField label="Campagnes" value={f.campaign ? "" : f.status} allLabel={null} options={SCOPE_OPTIONS} onChange={(v) => set({ status: v, campaign: "" })} />
                    <SelectField label="Une campagne précise" value={f.campaign} allLabel="Toutes celles du choix ci-contre" options={options?.campaigns || []} onChange={(v) => set({ campaign: v })} />
                </>}
                active={active}
                onRemove={(k) => set(k === "campaign" ? { campaign: "" } : { status: "en_cours" })}
                onReset={reset}
                result={data ? `${data.campaigns.length} campagne(s) · ${data.points.length} point(s) de retrait` : ""}
            />

            {error ? <ErrorBox message={error} onRetry={load} /> : !data ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)}</div>
            ) : (
                <>
                    <div className="dash-stagger grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard label="Inscriptions aujourd’hui" value={n(data.today.registrations)} hint={`${n(data.totals.registrations)} au total`} icon={UserPlus} tone="ink" />
                        <StatCard label="Codes validés aujourd’hui" value={n(data.today.validated)} hint={`${n(data.totals.validated)} au total`} icon={KeyRound} tone="sand" />
                        <StatCard label="Kits retirés aujourd’hui" value={n(data.today.withdrawn)} hint={`${n(data.totals.withdrawn)} au total`} icon={PackageCheck} tone="rose" />
                        <StatCard label="Avancement" value={pct(data.totals.objective_kits ? Math.round((data.totals.withdrawn / data.totals.objective_kits) * 1000) / 10 : null)} hint={`${n(data.totals.withdrawn)} kits retirés sur ${n(data.totals.objective_kits)} fournis`} icon={Radio} tone="sage" />
                    </div>

                    {data.campaigns.length === 0 ? (
                        <Card><Empty title="Aucune campagne dans ce choix" text="Choisissez « Toutes » ou une autre période pour voir vos campagnes." /></Card>
                    ) : (
                        <div className="grid grid-cols-[minmax(0,1fr)] xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-6">
                            <div className="space-y-4 min-w-0">
                                <LiveMap cities={data.cities} points={data.points} focus={focus} />
                                {data.points.some((p) => p.lat === null) && (
                                    <p className="text-xs text-[#8A837A]">Certains points de retrait n’ont pas encore de position GPS : ils figurent dans la liste mais pas sur la carte.</p>
                                )}
                            </div>
                            <Card className="p-5 min-w-0">
                                <h2 className="font-serif text-lg text-[#1A1814] flex items-center gap-2"><Radio size={17} className="text-[#C2185B]" /> En direct</h2>
                                <p className="text-xs text-[#8A837A] mt-1">Les 15 derniers événements, sans aucune donnée personnelle.</p>
                                {data.recent.length ? (
                                    <ul className="divide-y divide-[#EFECE7] mt-2 max-h-[420px] overflow-y-auto pr-1">{data.recent.map((e, i) => <EventRow key={`${e.type}-${e.at}-${i}`} e={e} now={now} />)}</ul>
                                ) : <Empty title="Aucune activité" text="Les inscriptions et retraits apparaîtront ici." />}
                            </Card>
                        </div>
                    )}

                    {data.campaigns.length > 0 && (
                        <div className="grid grid-cols-[minmax(0,1fr)] xl:grid-cols-2 gap-6">
                            <Card className="p-0 overflow-hidden">
                                <div className="px-5 pt-5 pb-3">
                                    <h2 className="font-serif text-lg text-[#1A1814]">Points de retrait</h2>
                                    <p className="text-xs text-[#8A837A]">Cliquez sur un point pour le centrer sur la carte.</p>
                                </div>
                                {data.points.length ? (
                                    <ul className="divide-y divide-[#EFECE7] max-h-[360px] overflow-y-auto">
                                        {data.points.map((p) => (
                                            <li key={p.id ?? p.name}>
                                                <button disabled={p.lat === null} onClick={() => setFocus({ lat: p.lat, lng: p.lng, t: Date.now() })} className="w-full text-left px-5 py-3 flex items-center gap-3 hover:bg-[#F9F8F6] disabled:cursor-default">
                                                    <MapPin size={16} className={p.lat === null ? "text-[#C9C0B4]" : "text-[#C2185B]"} />
                                                    <span className="min-w-0 flex-1">
                                                        <span className="block text-sm text-[#1A1814] truncate">{p.name}</span>
                                                        <span className="block text-xs text-[#8A837A] truncate">{p.address || "Adresse non renseignée"}</span>
                                                    </span>
                                                    <span className="shrink-0 text-right text-xs tabular-nums">
                                                        <span className="block text-[#1A1814]">{p.withdrawn} / {p.registrations}</span>
                                                        {p.today_withdrawn > 0 && <span className="block text-[#C2185B]">+{p.today_withdrawn} aujourd’hui</span>}
                                                    </span>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : <Empty title="Aucun point de retrait choisi" text="Aucun inscrit pour le moment." />}
                            </Card>
                            <Card className="p-5">
                                <h2 className="font-serif text-lg text-[#1A1814] mb-1">Campagnes suivies</h2>
                                <p className="text-xs text-[#8A837A] mb-4">Kits retirés sur kits fournis</p>
                                <ul className="space-y-4">
                                    {data.campaigns.map((c) => {
                                        const r = c.objective_kits ? Math.min(100, (c.withdrawn / c.objective_kits) * 100) : 0;
                                        return (
                                            <li key={c.id}>
                                                <button onClick={() => onOpenCampaign(c.id)} className="w-full text-left group">
                                                    <div className="flex items-center justify-between gap-3 text-sm">
                                                        <span className="truncate text-[#1A1814] group-hover:text-[#C2185B]">{c.title}</span>
                                                        <Badge tone={STATUS_TONE[c.status]}>{c.status_label}</Badge>
                                                    </div>
                                                    <div className="h-2 rounded-full bg-[#EFECE7] mt-2 overflow-hidden"><div className="dash-grow h-full rounded-full bg-[#FF6EA9]" style={{ width: `${r}%` }} /></div>
                                                    <p className="mt-1 text-xs text-[#8A837A]">{n(c.withdrawn)} / {n(c.objective_kits)} · {n(c.registrations)} inscrit(s) · {c.cities.join(", ") || "Ville non renseignée"}</p>
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </Card>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

// ------------------------------------------------------------------ Journal d'activité
const ACTIVITY_INITIAL = { status: "all", campaign: "", type: "", city: "", point: "", from: "", to: "", page: 1 };
export function ActivityView() {
    const options = useSponsorFilters();
    const [f, set, reset] = useFilterState(ACTIVITY_INITIAL);
    const now = useNow(30000);
    const path = `sponsor/activity${qs({ status: f.campaign ? "" : f.status, campaign: f.campaign, type: f.type, city: f.city, point: f.point, from: f.from, to: f.to, page: f.page, limit: 25 })}`;
    const { data, error, load } = usePolling(path, REFRESH_MS);
    const typeLabels = { registration: "Inscriptions", validated: "Codes validés", withdrawn: "Kits retirés" };
    const active = [
        f.status !== "all" && !f.campaign && { key: "status", label: labelOf(SCOPE_OPTIONS, f.status) },
        f.campaign && { key: "campaign", label: labelOf(options?.campaigns, f.campaign) },
        f.city && { key: "city", label: f.city },
        f.point && { key: "point", label: labelOf(options?.points, f.point) },
        f.from && { key: "from", label: `Depuis le ${dateFr(f.from)}` },
        f.to && { key: "to", label: `Jusqu’au ${dateFr(f.to)}` },
    ].filter(Boolean);
    const daily = useMemo(() => (data?.daily || []).map((d) => ({
        key: d.date, label: d.date.slice(8, 10), title: dateFr(d.date),
        values: { registration: d.registration, validated: d.validated, withdrawn: d.withdrawn },
    })), [data]);

    return (
        <div className="space-y-6">
            <SectionTitle title="Activité" subtitle="Chaque inscription, validation de code et retrait de kit, sans aucune donnée personnelle." />
            <FilterPanel
                main={<>
                    <SelectField label="Campagnes" value={f.campaign ? "" : f.status} allLabel={null} options={SCOPE_OPTIONS} onChange={(v) => set({ status: v, campaign: "" })} />
                    <SelectField label="Une campagne précise" value={f.campaign} allLabel="Toutes" options={options?.campaigns || []} onChange={(v) => set({ campaign: v })} />
                    <DateField label="Du" value={f.from} max={f.to} onChange={(v) => set({ from: v })} />
                    <DateField label="Au" value={f.to} min={f.from} onChange={(v) => set({ to: v })} />
                </>}
                advanced={<>
                    <SelectField label="Ville" value={f.city} options={options?.cities || []} allLabel="Toutes" onChange={(v) => set({ city: v })} />
                    <SelectField label="Point de retrait" value={f.point} options={options?.points || []} allLabel="Tous" onChange={(v) => set({ point: v })} />
                </>}
                active={active}
                onRemove={(k) => set({ [k]: k === "status" ? "all" : "" })}
                onReset={reset}
                result={data ? `${n(data.total)} événement(s)` : ""}
            />
            <Chips value={f.type} onChange={(v) => set({ type: v })} items={[
                { value: "", label: "Tout", count: data ? data.counts.registration + data.counts.validated + data.counts.withdrawn : undefined },
                ...Object.entries(typeLabels).map(([value, label]) => ({ value, label, count: data?.counts[value] })),
            ]} />

            {error ? <ErrorBox message={error} onRetry={load} /> : !data ? <Skeleton className="h-72" /> : (
                <>
                    <Card className="p-6">
                        <h2 className="font-serif text-lg text-[#1A1814] mb-4">Par jour</h2>
                        {daily.length ? (
                            <StackedBars label="Événements par jour" data={daily} series={[
                                { key: "registration", label: "Inscriptions", color: PALETTE.ink },
                                { key: "validated", label: "Codes validés", color: PALETTE.sand },
                                { key: "withdrawn", label: "Kits retirés", color: PALETTE.rose },
                            ].filter((s) => !f.type || s.key === f.type)} />
                        ) : <Empty title="Aucun événement" text="Aucune activité pour ces filtres." />}
                    </Card>
                    <Card className="overflow-hidden">
                        {data.data.length ? (
                            <ul className="divide-y divide-[#EFECE7] px-5">{data.data.map((e, i) => <EventRow key={`${e.type}-${e.at}-${i}`} e={e} now={now} />)}</ul>
                        ) : <Empty title="Aucun événement" text="Modifiez les filtres pour élargir la recherche." />}
                        <Pager page={data.page} last={data.last_page} onPage={(p) => set({ page: p })} />
                    </Card>
                </>
            )}
        </div>
    );
}

// ------------------------------------------------------------------ Points de retrait
const POINTS_INITIAL = { status: "all", campaign: "", q: "", sort: "" };
const POINT_SORTS = [
    { value: "", label: "Plus d’inscrits" },
    { value: "withdrawn", label: "Plus de retraits" },
    { value: "rate", label: "Meilleur taux de retrait" },
    { value: "recent", label: "Activité la plus récente" },
    { value: "name", label: "Nom (A à Z)" },
];
export function PointsView() {
    const options = useSponsorFilters();
    const [f, set, reset] = useFilterState(POINTS_INITIAL);
    const now = useNow(30000);
    const { data, error, load } = usePolling(`sponsor/pickup-points${qs({ status: f.campaign ? "" : f.status, campaign: f.campaign, q: f.q, sort: f.sort })}`, REFRESH_MS);
    const active = [
        f.status !== "all" && !f.campaign && { key: "status", label: labelOf(SCOPE_OPTIONS, f.status) },
        f.campaign && { key: "campaign", label: labelOf(options?.campaigns, f.campaign) },
        f.q && { key: "q", label: `« ${f.q} »` },
    ].filter(Boolean);
    return (
        <div className="space-y-6">
            <SectionTitle title="Points de retrait" subtitle="Les points de retrait choisis par les inscrits de vos campagnes." />
            <FilterPanel
                main={<>
                    <SelectField label="Campagnes" value={f.campaign ? "" : f.status} allLabel={null} options={SCOPE_OPTIONS} onChange={(v) => set({ status: v, campaign: "" })} />
                    <SelectField label="Une campagne précise" value={f.campaign} allLabel="Toutes" options={options?.campaigns || []} onChange={(v) => set({ campaign: v })} />
                    <SearchField value={f.q} onChange={(v) => set({ q: v })} placeholder="Nom ou adresse" />
                    <SelectField label="Trier par" value={f.sort} allLabel={null} options={POINT_SORTS} onChange={(v) => set({ sort: v })} />
                </>}
                active={active}
                onRemove={(k) => set({ [k]: k === "status" ? "all" : "" })}
                onReset={reset}
                result={data ? `${data.data.length} point(s) sur ${data.total}` : ""}
            />
            {error ? <ErrorBox message={error} onRetry={load} /> : !data ? <Skeleton className="h-72" /> : !data.data.length ? (
                <Card><Empty title="Aucun point de retrait" text="Aucun inscrit pour ces filtres." /></Card>
            ) : (
                <Card className="overflow-x-auto p-0">
                    <table className="w-full min-w-[820px] text-sm">
                        <thead className="text-left text-[11px] uppercase tracking-[0.12em] text-[#8A837A] border-b border-[#EFECE7]">
                            <tr>
                                <th className="px-5 py-4 font-medium">Point de retrait</th>
                                <th className="px-4 py-4 font-medium text-right">Inscrits</th>
                                <th className="px-4 py-4 font-medium text-right">Codes validés</th>
                                <th className="px-4 py-4 font-medium text-right">Kits retirés</th>
                                <th className="px-4 py-4 font-medium w-40">Taux de retrait</th>
                                <th className="px-4 py-4 font-medium text-right">Aujourd’hui</th>
                                <th className="px-5 py-4 font-medium text-right">Dernière activité</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EFECE7]">
                            {data.data.map((p) => (
                                <tr key={p.id ?? p.name} className="hover:bg-[#F9F8F6]">
                                    <td className="px-5 py-3.5">
                                        <p className="text-[#1A1814]">{p.name}</p>
                                        <p className="text-xs text-[#8A837A]">{p.address || "Adresse non renseignée"}{p.lat === null ? " · sans position GPS" : ""}</p>
                                    </td>
                                    <td className="px-4 py-3.5 text-right tabular-nums">{n(p.registrations)}</td>
                                    <td className="px-4 py-3.5 text-right tabular-nums">{n(p.validated)}</td>
                                    <td className="px-4 py-3.5 text-right tabular-nums font-medium">{n(p.withdrawn)}</td>
                                    <td className="px-4 py-3.5">
                                        <div className="flex items-center gap-2">
                                            <div className="h-1.5 flex-1 rounded-full bg-[#EFECE7] overflow-hidden"><div className="h-full rounded-full bg-[#FF6EA9]" style={{ width: `${p.rate || 0}%` }} /></div>
                                            <span className="text-xs text-[#6B655D] tabular-nums w-12 text-right">{p.rate === null ? "0 %" : pct(p.rate)}</span>
                                        </div>
                                    </td>
                                    <td className={`px-4 py-3.5 text-right tabular-nums ${p.today_withdrawn ? "text-[#C2185B] font-medium" : "text-[#8A837A]"}`}>{p.today_withdrawn}</td>
                                    <td className="px-5 py-3.5 text-right text-xs text-[#6B655D] whitespace-nowrap">{ago(p.last_activity_at, now)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            )}
        </div>
    );
}

// ------------------------------------------------------------------ Villes
const CITIES_INITIAL = { status: "all", campaign: "", sort: "" };
const CITY_SORTS = [
    { value: "", label: "Plus d’inscrits" },
    { value: "withdrawn", label: "Plus de retraits" },
    { value: "rate", label: "Meilleur taux de retrait" },
    { value: "name", label: "Nom (A à Z)" },
];
export function CitiesView() {
    const options = useSponsorFilters();
    const [f, set, reset] = useFilterState(CITIES_INITIAL);
    const { data, error, load } = usePolling(`sponsor/cities${qs({ status: f.campaign ? "" : f.status, campaign: f.campaign, sort: f.sort })}`, REFRESH_MS);
    const active = [
        f.status !== "all" && !f.campaign && { key: "status", label: labelOf(SCOPE_OPTIONS, f.status) },
        f.campaign && { key: "campaign", label: labelOf(options?.campaigns, f.campaign) },
    ].filter(Boolean);
    return (
        <div className="space-y-6">
            <SectionTitle title="Villes" subtitle="Les villes de vos campagnes et celles déclarées par les inscrits." />
            <FilterPanel
                main={<>
                    <SelectField label="Campagnes" value={f.campaign ? "" : f.status} allLabel={null} options={SCOPE_OPTIONS} onChange={(v) => set({ status: v, campaign: "" })} />
                    <SelectField label="Une campagne précise" value={f.campaign} allLabel="Toutes" options={options?.campaigns || []} onChange={(v) => set({ campaign: v })} />
                    <SelectField label="Trier par" value={f.sort} allLabel={null} options={CITY_SORTS} onChange={(v) => set({ sort: v })} />
                </>}
                active={active}
                onRemove={(k) => set({ [k]: k === "status" ? "all" : "" })}
                onReset={reset}
                result={data ? `${data.data.length} ville(s)` : ""}
            />
            {error ? <ErrorBox message={error} onRetry={load} /> : !data ? <Skeleton className="h-72" /> : !data.data.length ? (
                <Card><Empty title="Aucune ville" text="Aucune campagne pour ces filtres." /></Card>
            ) : (
                <div className="grid grid-cols-[minmax(0,1fr)] xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-6">
                    <Card className="p-6">
                        <h2 className="font-serif text-lg text-[#1A1814] mb-1">Retirés / inscrits</h2>
                        <p className="text-xs text-[#8A837A] mb-4">Barre claire : inscrits · barre rose : kits retirés</p>
                        <HBars rows={data.data.map((c) => ({ label: c.city, registrations: c.registrations, withdrawn: c.withdrawn }))} />
                    </Card>
                    <Card className="overflow-hidden">
                        <ul className="divide-y divide-[#EFECE7]">
                            {data.data.map((c) => (
                                <li key={c.city} className="px-5 py-4 flex items-start gap-3">
                                    <Building2 size={17} className={`mt-0.5 shrink-0 ${c.in_progress ? "text-[#C2185B]" : "text-[#8A837A]"}`} />
                                    <span className="min-w-0 flex-1">
                                        <span className="block text-[#1A1814]">{c.city}</span>
                                        <span className="block text-xs text-[#8A837A] truncate">{c.campaigns.length ? c.campaigns.join(", ") : "Ville déclarée par des inscrits"}</span>
                                    </span>
                                    <span className="shrink-0 text-right text-xs tabular-nums text-[#3D3934]">
                                        <span className="block">{n(c.registrations)} inscrit(s)</span>
                                        <span className="block">{n(c.validated)} code(s) validé(s)</span>
                                        <span className="block text-[#C2185B]">{n(c.withdrawn)} retiré(s) · {c.rate === null ? "0 %" : pct(c.rate)}</span>
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </Card>
                </div>
            )}
        </div>
    );
}
