"use client";

import { useCallback, useEffect, useState } from "react";
import { Megaphone, Wallet, Package, Target, ArrowLeft, Download, Send, Loader2, TrendingUp, CalendarClock, Clock } from "lucide-react";
import toast from "react-hot-toast";
import { api, dateOnly, dateTime, fcfa, qs, token, API } from "../pickup-dashboard/api";
import { Badge, Card, Empty, ErrorBox, SectionTitle, Skeleton, StatCard, Tabs } from "../pickup-dashboard/ui";
import { Bars, CumulativeLines, Donut, Funnel, HBars, PALETTE } from "../dashboard-ui/charts";

const STATUS_TONE = { a_venir: "wait", en_cours: "rose", terminee: "ok" };
const MONTHS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
const pct = (v) => (v === null || v === undefined ? "non calculé" : `${String(v).replace(".", ",")} %`);

function useLoad(path, deps) {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const load = useCallback(async () => {
        setError(null);
        try {
            setData(await api(path));
        } catch (e) {
            setError(e.message);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
    useEffect(() => {
        setData(null);
        load();
    }, [load]);
    return { data, error, load };
}

// ------------------------------------------------------------------ Accueil
export function HomeView({ onOpenCampaign }) {
    const { data, error, load } = useLoad("sponsor/summary", []);
    if (error) return <ErrorBox message={error} onRetry={load} />;
    if (!data) return <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28" />)}</div>;
    const t = data.totals;
    return (
        <div className="space-y-6">
            <SectionTitle title="Accueil" subtitle="Les campagnes que vous soutenez, en un coup d’œil." />
            <div className="dash-stagger grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Campagnes soutenues" value={t.campaigns} hint={`${t.en_cours} en cours · ${t.a_venir} à venir · ${t.terminee} terminée(s)`} icon={Megaphone} tone="ink" />
                <StatCard label="Vos contributions" value={fcfa(t.contributions)} icon={Wallet} tone="sage" />
                <StatCard label="Kits retirés" value={t.withdrawn} hint={`${t.registrations} inscrit(s) · ${t.objective_kits} kits fournis`} icon={Package} tone="rose" />
                <StatCard label="Taux de retrait" value={pct(t.withdrawal_rate)} hint="Kits retirés / kits fournis" icon={Target} tone="sand" />
            </div>
            <div className="dash-stagger grid grid-cols-1 xl:grid-cols-3 gap-6">
                <Card className="p-6">
                    <h2 className="font-serif text-lg text-[#1F1B16] mb-4">Campagnes par statut</h2>
                    <Donut label="Campagnes par statut" items={[
                        { label: "En cours", value: t.en_cours, color: PALETTE.rose },
                        { label: "À venir", value: t.a_venir, color: PALETTE.sand },
                        { label: "Terminées", value: t.terminee, color: PALETTE.ink },
                    ]} />
                </Card>
                <Card className="p-6 xl:col-span-2">
                    <h2 className="font-serif text-lg text-[#1F1B16] mb-4">Kits retirés par mois</h2>
                    <Bars label="Kits retirés par mois" color={PALETTE.rose} seriesLabel="Kits retirés"
                        data={data.monthly_withdrawals.map((m) => ({ label: MONTHS[Number(m.month.slice(5, 7)) - 1], title: `${MONTHS[Number(m.month.slice(5, 7)) - 1]} ${m.month.slice(0, 4)}`, value: m.withdrawn }))} />
                </Card>
            </div>
            <Card className="p-6">
                <h2 className="font-serif text-lg text-[#1F1B16] mb-4">Vos contributions par campagne</h2>
                {data.contributions_by_campaign.length === 0 ? (
                    <Empty title="Aucune campagne" text="Aucune campagne n’est encore rattachée à votre espace." />
                ) : (
                    <ul className="divide-y divide-[#F1ECE4]">
                        {data.contributions_by_campaign.map((c) => (
                            <li key={c.id}>
                                <button onClick={() => onOpenCampaign(c.id)} className="w-full text-left py-3 flex items-center justify-between gap-3 hover:text-[#C2185B]">
                                    <span className="truncate">{c.title}</span>
                                    <span className="shrink-0 font-medium">{fcfa(c.contribution)}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </Card>
        </div>
    );
}

// ------------------------------------------------------------------ Mes campagnes
export function CampaignsView({ search, onOpenCampaign }) {
    const [status, setStatus] = useState("");
    const { data, error, load } = useLoad(`sponsor/campaigns${qs({ status, q: search })}`, [status, search]);
    return (
        <div>
            <SectionTitle
                title="Mes campagnes"
                subtitle={search ? `Résultats pour « ${search} »` : "Les campagnes que vous soutenez."}
                action={<Tabs value={status} onChange={setStatus} items={[
                    { key: "", label: "Toutes" }, { key: "en_cours", label: "En cours" }, { key: "a_venir", label: "À venir" }, { key: "terminee", label: "Terminées" },
                ]} />}
            />
            {error ? <ErrorBox message={error} onRetry={load} />
                : !data ? <div className="grid md:grid-cols-2 gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-44" />)}</div>
                    : data.length === 0 ? <Card><Empty title="Aucune campagne" text="Aucune campagne dans cette catégorie." /></Card>
                        : (
                            <div className="dash-stagger grid md:grid-cols-2 gap-5">
                                {data.map((c) => {
                                    const rate = c.objective_kits ? Math.min(100, (c.withdrawn / c.objective_kits) * 100) : 0;
                                    return (
                                        <button key={c.id} onClick={() => onOpenCampaign(c.id)} className="text-left">
                                            <Card className="p-6 h-full transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-20px_rgba(60,40,20,0.35)]">
                                                <div className="flex items-start justify-between gap-3">
                                                    <h3 className="font-serif text-lg text-[#1F1B16]">{c.title}</h3>
                                                    <Badge tone={STATUS_TONE[c.status]}>{c.status_label}</Badge>
                                                </div>
                                                <p className="text-sm text-[#7A6E62] mt-1">{c.cities.join(", ") || "Ville non renseignée"} · {dateOnly(`${c.date_start}T12:00:00Z`)} → {c.date_end ? dateOnly(`${c.date_end}T12:00:00Z`) : "date de fin non définie"}</p>
                                                <div className="mt-5 flex justify-between text-sm"><span className="text-[#7A6E62]">Kits retirés</span><span className="text-[#1F1B16] font-medium">{c.withdrawn} / {c.objective_kits}</span></div>
                                                <div className="h-2 rounded-full bg-[#F1ECE4] mt-2 overflow-hidden"><div className="dash-grow h-full rounded-full bg-[#FF6EA9]" style={{ width: `${rate}%` }} /></div>
                                                <div className="mt-4 flex justify-between text-xs text-[#9A8E80]"><span>{c.registrations} inscrit(s)</span><span>Votre contribution : {fcfa(c.contribution)}</span></div>
                                            </Card>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
        </div>
    );
}

// ------------------------------------------------------------------ Analyse d'une campagne (BI)
export function CampaignView({ id, onBack, onExportsChanged }) {
    const { data, error, load } = useLoad(`sponsor/campaigns/${id}`, [id]);
    const [busy, setBusy] = useState(false);
    if (error) return <ErrorBox message={error} onRetry={load} />;
    if (!data) return <div className="space-y-4"><Skeleton className="h-24" /><Skeleton className="h-72" /></div>;
    const c = data.campaign;
    const i = data.indicators;
    const p = data.prediction;

    const requestExport = async () => {
        setBusy(true);
        try {
            const r = await api(`sponsor/campaigns/${id}/export-request`, { method: "POST" });
            toast.success(r.message);
            await load();
            onExportsChanged();
        } catch (e) {
            toast.error(e.message);
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="space-y-6">
            <button onClick={onBack} className="inline-flex items-center gap-2 text-sm text-[#7A6E62] hover:text-[#1F1B16]"><ArrowLeft size={16} /> Mes campagnes</button>
            <Card className="p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center gap-5">
                <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="font-serif text-2xl sm:text-3xl text-[#1F1B16]">{c.title}</h1>
                        <Badge tone={STATUS_TONE[c.status]}>{c.status_label}</Badge>
                    </div>
                    <p className="text-sm text-[#7A6E62] mt-2">{c.cities.join(", ") || "Ville non renseignée"} · du {dateOnly(`${c.date_start}T12:00:00Z`)} au {c.date_end ? dateOnly(`${c.date_end}T12:00:00Z`) : "date de fin non définie"} · votre contribution : {fcfa(c.contribution)}</p>
                </div>
                <ExportAction c={c} busy={busy} onRequest={requestExport} />
            </Card>

            <div className="dash-stagger grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Kits fournis" value={i.objective_kits} tone="ink" icon={Package} />
                <StatCard label="Inscrits" value={i.registrations} hint={`${i.not_withdrawn} sans retrait`} tone="sand" icon={Megaphone} />
                <StatCard label="Kits retirés" value={i.withdrawn} hint={`Taux : ${pct(i.withdrawal_rate)} des kits fournis`} tone="rose" icon={Target} />
                <StatCard label={i.days_remaining === null ? "Délai moyen de retrait" : "Jours restants"}
                    value={i.days_remaining === null ? (i.average_delay_days === null ? "Aucun retrait" : `${String(i.average_delay_days).replace(".", ",")} j`) : i.days_remaining}
                    hint={i.days_remaining === null ? "Entre l’inscription et le retrait" : `Délai moyen de retrait : ${i.average_delay_days === null ? "aucun retrait" : `${String(i.average_delay_days).replace(".", ",")} j`}`}
                    tone="sage" icon={i.days_remaining === null ? Clock : CalendarClock} />
            </div>

            <div className="dash-stagger grid grid-cols-1 xl:grid-cols-3 gap-6">
                <Card className="p-6 xl:col-span-2">
                    <h2 className="font-serif text-lg text-[#1F1B16] mb-4">Évolution</h2>
                    <CumulativeLines series={data.daily} objective={i.objective_kits} />
                </Card>
                <Card className="p-6">
                    <h2 className="font-serif text-lg text-[#1F1B16] mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-[#C2185B]" /> Prévision</h2>
                    {p.available ? (
                        <div>
                            <p className="text-sm text-[#7A6E62]">Kits retirés estimés à la date de fin</p>
                            <p className="font-serif text-4xl text-[#1F1B16] mt-2">{p.projected_withdrawals}</p>
                            <p className="text-sm text-[#3F6B45] mt-1">{p.projected_percent_of_objective === null ? "" : `soit ${pct(p.projected_percent_of_objective)} des kits fournis`}</p>
                            <p className="text-xs text-[#9A8E80] mt-4">{p.method} Rythme actuel : {String(p.rate_per_day).replace(".", ",")} kit(s) par jour sur {p.days_elapsed} jours ; {p.days_remaining} jour(s) restant(s).</p>
                        </div>
                    ) : (
                        <p className="text-sm text-[#7A6E62]">{p.reason}</p>
                    )}
                </Card>
            </div>

            <div className="dash-stagger grid grid-cols-1 xl:grid-cols-3 gap-6">
                <Card className="p-6"><h2 className="font-serif text-lg text-[#1F1B16] mb-4">Parcours</h2><Funnel steps={data.funnel} /></Card>
                <Card className="p-6"><h2 className="font-serif text-lg text-[#1F1B16] mb-1">Par ville</h2><p className="text-xs text-[#9A8E80] mb-4">Retirés / inscrits</p>{data.by_city.length ? <HBars rows={data.by_city} /> : <Empty title="Aucun inscrit" />}</Card>
                <Card className="p-6"><h2 className="font-serif text-lg text-[#1F1B16] mb-1">Par point de retrait</h2><p className="text-xs text-[#9A8E80] mb-4">Retirés / inscrits</p>{data.by_pickup_point.length ? <HBars rows={data.by_pickup_point} /> : <Empty title="Aucun inscrit" />}</Card>
            </div>
        </div>
    );
}

function ExportAction({ c, busy, onRequest }) {
    if (c.export_status === "approved") return <DownloadButton campaignId={c.id} />;
    if (c.export_status === "pending") return <Badge tone="wait">Export demandé : en attente de validation</Badge>;
    if (c.status !== "terminee") return <p className="text-xs text-[#9A8E80] max-w-[220px]">L’export des données sera possible une fois la campagne terminée.</p>;
    return (
        <button onClick={onRequest} disabled={busy} className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#1F1B16] text-white text-sm font-medium disabled:opacity-50">
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {c.export_status === "rejected" ? "Redemander l’export" : "Demander l’export Excel"}
        </button>
    );
}

// Téléchargement authentifié (le fichier n'est envoyé qu'après acceptation par l'admin)
export function DownloadButton({ campaignId }) {
    const [busy, setBusy] = useState(false);
    const download = async () => {
        setBusy(true);
        try {
            const res = await fetch(`${API}/sponsor/campaigns/${campaignId}/export`, { headers: { Authorization: `Bearer ${token()}` } });
            if (!res.ok) {
                const d = await res.json().catch(() => ({}));
                throw new Error(d?.message || "Téléchargement impossible.");
            }
            const blob = await res.blob();
            const name = (res.headers.get("Content-Disposition") || "").match(/filename="([^"]+)"/)?.[1] || `campagne-${campaignId}.xlsx`;
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = name;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch (e) {
            toast.error(e.message);
        } finally {
            setBusy(false);
        }
    };
    return (
        <button onClick={download} disabled={busy} className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#C2185B] text-white text-sm font-medium disabled:opacity-50">
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} Télécharger l’Excel
        </button>
    );
}

// ------------------------------------------------------------------ Exports
export function ExportsView({ refreshKey, onOpenCampaign }) {
    const { data, error, load } = useLoad("sponsor/exports", [refreshKey]);
    const tone = { pending: "wait", approved: "ok", rejected: "off" };
    const label = { pending: "En attente", approved: "Acceptée", rejected: "Refusée" };
    return (
        <div>
            <SectionTitle title="Exports" subtitle="Vos demandes d’export Excel. Un export accepté se télécharge sans limite." />
            {error ? <ErrorBox message={error} onRetry={load} />
                : !data ? <Skeleton className="h-48" />
                    : data.length === 0 ? <Card><Empty title="Aucune demande" text="Ouvrez une campagne terminée pour demander l’export de ses données." /></Card>
                        : (
                            <Card className="divide-y divide-[#F1ECE4] overflow-hidden">
                                {data.map((r) => (
                                    <div key={r.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                                        <button onClick={() => onOpenCampaign(r.campaign_id)} className="flex-1 text-left min-w-0">
                                            <p className="font-medium text-[#1F1B16] truncate">{r.title}</p>
                                            <p className="text-xs text-[#9A8E80] mt-0.5">Demandé le {dateTime(r.requested_at)}{r.decided_at ? ` · décidé le ${dateTime(r.decided_at)}` : ""}</p>
                                            {r.status === "rejected" && r.reason && <p className="text-xs text-[#9B2C2C] mt-1">Motif : {r.reason}</p>}
                                        </button>
                                        <div className="flex items-center gap-3 shrink-0">
                                            <Badge tone={tone[r.status]}>{label[r.status]}</Badge>
                                            {r.status === "approved" && <DownloadButton campaignId={r.campaign_id} />}
                                        </div>
                                    </div>
                                ))}
                            </Card>
                        )}
        </div>
    );
}
