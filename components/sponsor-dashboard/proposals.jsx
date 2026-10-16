"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, ArrowLeft, Send, Loader2, X, CalendarRange, MapPin, Package, Wallet, CheckCircle2, Clock, XCircle, Megaphone, Trash2, Save, KeyRound } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { api, dateOnly, dateTime, fcfa, qs } from "../pickup-dashboard/api";
import { Badge, Card, Empty, ErrorBox, SectionTitle, Skeleton } from "../pickup-dashboard/ui";
import { BENIN_CITIES } from "../../lib/beninCities";
import { Chips, DateField, Field, FilterPanel, SearchField, SelectField, dateFr, useFilterState } from "./filters";

// Demandes de campagne (15/10/2026) : le sponsor soumet → E.doto family valide ou refuse → E.doto family crée la campagne.
const STATUS = {
    pending: { label: "En attente", tone: "wait", icon: Clock },
    approved: { label: "Validée", tone: "ok", icon: CheckCircle2 },
    rejected: { label: "Refusée", tone: "off", icon: XCircle },
    created: { label: "Campagne créée", tone: "rose", icon: Megaphone },
};
const SORTS = [
    { value: "", label: "Plus récentes" },
    { value: "oldest", label: "Plus anciennes" },
    { value: "start", label: "Date de début" },
    { value: "kits", label: "Plus de kits" },
    { value: "budget", label: "Budget le plus élevé" },
];
const input = "w-full min-w-0 rounded-xl border border-[#E6E2DC] bg-white px-3.5 py-3 text-sm text-[#1A1814] focus:outline-none focus:ring-2 focus:ring-[#FF6EA9]/25";
const todayBenin = () => new Date(Date.now() + 3_600_000).toISOString().slice(0, 10);

function useLoad(path) {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const load = useCallback(async () => {
        setError(null);
        try { setData(await api(path)); } catch (e) { setError(e.message); }
    }, [path]);
    useEffect(() => { setData(null); load(); }, [load]);
    return { data, error, load };
}

// Étapes du parcours d'une demande
function Steps({ status }) {
    const done = { pending: 1, approved: 2, rejected: 2, created: 3 }[status] || 1;
    const items = [
        { label: "Demande envoyée" },
        { label: status === "rejected" ? "Refusée" : "Validée par E.doto family" },
        { label: "Campagne créée" },
    ];
    return (
        <ol className="grid grid-cols-3 gap-2">
            {items.map((it, i) => {
                const on = i < done;
                const bad = status === "rejected" && i === 1;
                return (
                    <li key={it.label} className="min-w-0">
                        <div className={`h-1.5 rounded-full ${bad ? "bg-[#9B2C2C]" : on ? "bg-[#1A1814]" : "bg-[#E9E5DF]"}`} />
                        <p className={`mt-2 text-[11px] leading-tight ${on ? "text-[#1A1814]" : "text-[#8A837A]"}`}>{it.label}</p>
                    </li>
                );
            })}
        </ol>
    );
}

function ProposalForm({ onCancel, onCreated }) {
    const [v, setV] = useState({ title: "", description: "", cities: [], date_start: "", date_end: "", objective_kits: "", budget: "" });
    const [city, setCity] = useState("");
    const [busy, setBusy] = useState(false);
    const set = (k, val) => setV((p) => ({ ...p, [k]: val }));
    const addCity = (c) => {
        const name = (c ?? city).trim();
        if (!name) return;
        if (!v.cities.some((x) => x.toLowerCase() === name.toLowerCase())) set("cities", [...v.cities, name]);
        setCity("");
    };
    const submit = async (e) => {
        e.preventDefault();
        if (!v.cities.length) return toast.error("Ajoutez au moins une ville.");
        setBusy(true);
        try {
            const res = await api("sponsor/proposals", {
                method: "POST",
                body: JSON.stringify({ ...v, objective_kits: Number(v.objective_kits), budget: Number(v.budget) || 0 }),
            });
            toast.success(res.message);
            onCreated(res.id);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setBusy(false);
        }
    };
    const today = todayBenin();
    return (
        <form onSubmit={submit} className="space-y-6">
            <button type="button" onClick={onCancel} className="inline-flex items-center gap-2 text-sm text-[#6B655D] hover:text-[#1A1814]"><ArrowLeft size={16} /> Mes demandes</button>
            <SectionTitle title="Nouvelle demande de campagne" subtitle="Décrivez la campagne souhaitée : l’équipe E.doto family l’étudie, la valide puis crée la campagne." />
            <Card className="p-6 sm:p-8 grid grid-cols-[minmax(0,1fr)] gap-5 md:grid-cols-2">
                <Field label="Nom de la campagne *" className="md:col-span-2">
                    <input className={input} value={v.title} maxLength={255} required onChange={(e) => set("title", e.target.value)} placeholder="Ex. : Kits d’hygiène menstruelle, rentrée 2026" />
                </Field>
                <Field label="Description et objectifs" className="md:col-span-2">
                    <textarea className={`${input} min-h-[120px]`} value={v.description} maxLength={5000} onChange={(e) => set("description", e.target.value)} placeholder="Public visé, objectifs, contenu des kits, informations utiles à l’équipe…" />
                </Field>
                <Field label="Date de début souhaitée *">
                    <input type="date" className={input} value={v.date_start} min={today} required onChange={(e) => set("date_start", e.target.value)} />
                </Field>
                <Field label="Date de fin souhaitée *">
                    <input type="date" className={input} value={v.date_end} min={v.date_start || today} required onChange={(e) => set("date_end", e.target.value)} />
                </Field>
                <Field label="Nombre de kits *">
                    <input type="number" min={1} step={1} className={input} value={v.objective_kits} required onChange={(e) => set("objective_kits", e.target.value)} />
                </Field>
                <Field label="Budget proposé (FCFA)">
                    <input type="number" min={0} step={1} className={input} value={v.budget} onChange={(e) => set("budget", e.target.value)} />
                </Field>
                <div className="md:col-span-2">
                    <Field label="Villes *">
                        <div className="flex gap-2">
                            <input className={input} list="sponsor-cities" value={city} onChange={(e) => setCity(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCity(); } }} placeholder="Choisissez ou saisissez une ville" />
                            <button type="button" onClick={() => addCity()} className="shrink-0 rounded-xl bg-[#1A1814] px-4 text-sm text-white">Ajouter</button>
                        </div>
                    </Field>
                    <datalist id="sponsor-cities">{BENIN_CITIES.map((c) => <option key={c} value={c} />)}</datalist>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {v.cities.map((c) => (
                            <span key={c} className="inline-flex items-center gap-1.5 rounded-full bg-[#F3F1EE] px-3 py-1.5 text-sm text-[#1A1814]">
                                {c}
                                <button type="button" onClick={() => set("cities", v.cities.filter((x) => x !== c))} aria-label={`Retirer ${c}`} className="text-[#8A837A] hover:text-[#1A1814]"><X size={14} /></button>
                            </span>
                        ))}
                        {!v.cities.length && <span className="text-xs text-[#8A837A]">Aucune ville ajoutée.</span>}
                    </div>
                </div>
            </Card>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                <button type="button" onClick={onCancel} className="rounded-2xl border border-[#E6E2DC] px-5 py-3 text-sm text-[#3D3934]">Annuler</button>
                <button type="submit" disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#C2185B] px-6 py-3 text-sm font-medium text-white disabled:opacity-50">
                    {busy ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Envoyer la demande
                </button>
            </div>
        </form>
    );
}

function ProposalDetail({ id, onBack, onOpenCampaign, onChanged }) {
    const { data: p, error, load } = useLoad(`sponsor/proposals/${id}`);
    const [busy, setBusy] = useState(false);
    const [confirming, setConfirming] = useState(false);
    if (error) return <ErrorBox message={error} onRetry={load} />;
    if (!p) return <Skeleton className="h-72" />;
    const S = STATUS[p.status];
    const withdraw = async () => {
        if (!confirming) return setConfirming(true); // 2e clic pour confirmer
        setBusy(true);
        try {
            const r = await api(`sponsor/proposals/${id}`, { method: "DELETE" });
            toast.success(r.message);
            onChanged();
            onBack();
        } catch (e) {
            toast.error(e.message);
            setBusy(false);
        }
    };
    return (
        <div className="space-y-6">
            <button onClick={onBack} className="inline-flex items-center gap-2 text-sm text-[#6B655D] hover:text-[#1A1814]"><ArrowLeft size={16} /> Mes demandes</button>
            <Card className="p-6 sm:p-8 space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                        <h1 className="font-serif text-2xl sm:text-3xl text-[#1A1814]">{p.title}</h1>
                        <p className="text-sm text-[#6B655D] mt-1">Envoyée le {dateTime(p.created_at)}</p>
                    </div>
                    <Badge tone={S.tone}>{S.label}</Badge>
                </div>
                <Steps status={p.status} />
                {p.admin_note && (
                    <div className={`rounded-2xl p-4 text-sm ${p.status === "rejected" ? "bg-[#F5E4E4] text-[#9B2C2C]" : "bg-[#F3F1EE] text-[#3D3934]"}`}>
                        <p className="font-medium">{p.status === "rejected" ? "Motif du refus" : "Message de l’équipe"}</p>
                        <p className="mt-1 whitespace-pre-line">{p.admin_note}</p>
                    </div>
                )}
                <dl className="grid grid-cols-[minmax(0,1fr)] sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex gap-3"><CalendarRange size={18} className="text-[#8A837A] shrink-0" /><div><dt className="text-[#8A837A] text-xs">Période souhaitée</dt><dd className="text-[#1A1814]">du {dateFr(p.date_start)} au {dateFr(p.date_end)}</dd></div></div>
                    <div className="flex gap-3"><MapPin size={18} className="text-[#8A837A] shrink-0" /><div><dt className="text-[#8A837A] text-xs">Villes</dt><dd className="text-[#1A1814]">{p.cities.join(", ")}</dd></div></div>
                    <div className="flex gap-3"><Package size={18} className="text-[#8A837A] shrink-0" /><div><dt className="text-[#8A837A] text-xs">Kits</dt><dd className="text-[#1A1814]">{Number(p.objective_kits).toLocaleString("fr-FR")}</dd></div></div>
                    <div className="flex gap-3"><Wallet size={18} className="text-[#8A837A] shrink-0" /><div><dt className="text-[#8A837A] text-xs">Budget proposé</dt><dd className="text-[#1A1814]">{p.budget ? fcfa(p.budget) : "Non renseigné"}</dd></div></div>
                </dl>
                {p.description && <div><p className="text-xs text-[#8A837A] mb-1">Description et objectifs</p><p className="text-sm text-[#3D3934] whitespace-pre-line">{p.description}</p></div>}
                <div className="flex flex-wrap gap-3 pt-2">
                    {p.status === "created" && p.campaign_id && (
                        <button onClick={() => onOpenCampaign(p.campaign_id)} className="inline-flex items-center gap-2 rounded-2xl bg-[#1A1814] px-5 py-3 text-sm text-white"><Megaphone size={16} /> Suivre la campagne</button>
                    )}
                    {p.status === "pending" && (
                        <button onClick={withdraw} disabled={busy} className="inline-flex items-center gap-2 rounded-2xl border border-[#E6E2DC] px-5 py-3 text-sm text-[#9B2C2C] disabled:opacity-50">
                            {busy ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />} {confirming ? "Confirmer le retrait" : "Retirer la demande"}
                        </button>
                    )}
                </div>
            </Card>
        </div>
    );
}

const PROPOSALS_INITIAL = { status: "", q: "", city: "", from: "", to: "", sort: "" };
export function ProposalsView({ onOpenCampaign, onChanged }) {
    const [mode, setMode] = useState({ view: "list", id: null });
    const [f, set, reset] = useFilterState(PROPOSALS_INITIAL);
    const [key, setKey] = useState(0);
    const facets = useLoad(`sponsor/proposals/facets?k=${key}`);
    const list = useLoad(`sponsor/proposals${qs({ status: f.status, q: f.q, city: f.city, from: f.from, to: f.to, sort: f.sort, k: key })}`);
    const refresh = () => { setKey((k) => k + 1); onChanged?.(); };

    if (mode.view === "new") return <ProposalForm onCancel={() => setMode({ view: "list" })} onCreated={(id) => { refresh(); setMode({ view: "detail", id }); }} />;
    if (mode.view === "detail") return <ProposalDetail id={mode.id} onBack={() => setMode({ view: "list" })} onOpenCampaign={onOpenCampaign} onChanged={refresh} />;

    const fc = facets.data;
    const active = [
        f.q && { key: "q", label: `« ${f.q} »` },
        f.city && { key: "city", label: f.city },
        f.from && { key: "from", label: `Début dès le ${dateFr(f.from)}` },
        f.to && { key: "to", label: `Début jusqu’au ${dateFr(f.to)}` },
    ].filter(Boolean);
    return (
        <div className="space-y-6">
            <SectionTitle
                title="Demandes de campagne"
                subtitle="Proposez une campagne : l’équipe E.doto family la valide puis la crée. Vous la suivez ensuite en temps réel."
                action={<button onClick={() => setMode({ view: "new" })} className="inline-flex items-center gap-2 rounded-2xl bg-[#C2185B] px-5 py-3 text-sm font-medium text-white"><Plus size={16} /> Nouvelle demande</button>}
            />
            <Chips value={f.status} onChange={(v) => set({ status: v })} items={[
                { value: "", label: "Toutes", count: fc?.total },
                ...(fc?.statuses || Object.entries(STATUS).map(([value, s]) => ({ value, label: s.label }))).map((s) => ({ value: s.value, label: s.label, count: s.count })),
            ]} />
            <FilterPanel
                main={<>
                    <SearchField value={f.q} onChange={(v) => set({ q: v })} placeholder="Nom de la campagne" />
                    <SelectField label="Ville" value={f.city} options={fc?.cities || []} allLabel="Toutes" onChange={(v) => set({ city: v })} />
                    <SelectField label="Trier par" value={f.sort} allLabel={null} options={SORTS} onChange={(v) => set({ sort: v })} />
                </>}
                advanced={<>
                    <DateField label="Début à partir du" value={f.from} max={f.to} onChange={(v) => set({ from: v })} />
                    <DateField label="Début jusqu’au" value={f.to} min={f.from} onChange={(v) => set({ to: v })} />
                </>}
                active={active}
                onRemove={(k) => set({ [k]: "" })}
                onReset={reset}
                result={list.data ? `${list.data.length} demande(s)` : ""}
            />
            {list.error ? <ErrorBox message={list.error} onRetry={list.load} /> : !list.data ? <Skeleton className="h-48" /> : !list.data.length ? (
                <Card>
                    <Empty title={fc?.total ? "Aucune demande pour ces filtres" : "Aucune demande pour le moment"} text={fc?.total ? "Modifiez les filtres." : "Cliquez sur « Nouvelle demande » pour proposer votre première campagne."} />
                </Card>
            ) : (
                <div className="dash-stagger grid grid-cols-[minmax(0,1fr)] md:grid-cols-2 gap-5">
                    {list.data.map((p) => {
                        const S = STATUS[p.status];
                        return (
                            <button key={p.id} onClick={() => setMode({ view: "detail", id: p.id })} className="text-left">
                                <Card className="p-6 h-full transition duration-300 hover:border-[#D6D2CB]">
                                    <div className="flex items-start justify-between gap-3">
                                        <h3 className="font-serif text-lg text-[#1A1814] min-w-0 break-words">{p.title}</h3>
                                        <Badge tone={S.tone}>{S.label}</Badge>
                                    </div>
                                    <p className="text-sm text-[#6B655D] mt-1">{p.cities.join(", ")} · du {dateFr(p.date_start)} au {dateFr(p.date_end)}</p>
                                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs text-[#6B655D]">
                                        <span>{Number(p.objective_kits).toLocaleString("fr-FR")} kit(s)</span>
                                        <span>Budget : {p.budget ? fcfa(p.budget) : "non renseigné"}</span>
                                        <span>Envoyée le {dateOnly(p.created_at)}</span>
                                    </div>
                                    <div className="mt-5"><Steps status={p.status} /></div>
                                </Card>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ------------------------------------------------------------------ Mon organisation
export function ProfileView({ sponsor, onSaved }) {
    const [v, setV] = useState({ contact_name: sponsor?.contact_name || "", phone: sponsor?.phone || "" });
    const [busy, setBusy] = useState(false);
    const save = async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
            const r = await api("sponsor/profile", { method: "PATCH", body: JSON.stringify(v) });
            toast.success(r.message);
            onSaved?.();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setBusy(false);
        }
    };
    return (
        <div className="space-y-6 max-w-3xl">
            <SectionTitle title="Mon organisation" subtitle="Les informations de votre espace sponsor." />
            <Card className="p-6 sm:p-8">
                <dl className="grid grid-cols-[minmax(0,1fr)] sm:grid-cols-2 gap-5 text-sm">
                    <div><dt className="text-xs text-[#8A837A]">Organisation</dt><dd className="text-[#1A1814] mt-1">{sponsor?.name}</dd></div>
                    <div><dt className="text-xs text-[#8A837A]">E-mail de connexion</dt><dd className="text-[#1A1814] mt-1 break-all">{sponsor?.email}</dd></div>
                    <div><dt className="text-xs text-[#8A837A]">Espace créé</dt><dd className="text-[#1A1814] mt-1">{sponsor?.created_at ? dateOnly(sponsor.created_at) : "Non renseigné"}</dd></div>
                    <div><dt className="text-xs text-[#8A837A]">Origine</dt><dd className="text-[#1A1814] mt-1">{sponsor?.self_registered ? "Inscription en ligne" : "Invitation de l’équipe E.doto family"}</dd></div>
                </dl>
                <p className="mt-5 text-xs text-[#8A837A]">Pour modifier le nom de l’organisation ou l’e-mail, contactez l’équipe E.doto family.</p>
            </Card>
            <form onSubmit={save}>
                <Card className="p-6 sm:p-8 grid grid-cols-[minmax(0,1fr)] sm:grid-cols-2 gap-5">
                    <h2 className="sm:col-span-2 font-serif text-lg text-[#1A1814]">Personne de contact</h2>
                    <Field label="Nom et prénom *"><input className={input} value={v.contact_name} maxLength={255} required onChange={(e) => setV((p) => ({ ...p, contact_name: e.target.value }))} /></Field>
                    <Field label="Téléphone *"><input className={input} value={v.phone} maxLength={40} required inputMode="tel" onChange={(e) => setV((p) => ({ ...p, phone: e.target.value }))} placeholder="+229 01 00 00 00 00" /></Field>
                    <div className="sm:col-span-2 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
                        <Link href="/forgot-password" className="inline-flex items-center gap-2 text-sm text-[#6B655D] hover:text-[#1A1814]"><KeyRound size={15} /> Changer de mot de passe</Link>
                        <button type="submit" disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1A1814] px-6 py-3 text-sm text-white disabled:opacity-50">
                            {busy ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Enregistrer
                        </button>
                    </div>
                </Card>
            </form>
        </div>
    );
}
