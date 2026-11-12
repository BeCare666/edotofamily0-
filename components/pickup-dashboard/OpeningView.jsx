"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CalendarDays, Loader2, Plus, Trash2 } from "lucide-react";
import { api } from "./api";
import { Card, ErrorBox, SectionTitle, Skeleton } from "./ui";

// Mes jours d'ouverture (12/11/2026, rapports/PLAN_TOURNEES_RETRAIT.md, 2.4) : réglés par le point lui-même (D8).
// Les colis arrivent par tournées groupées ; un jour où des colis de clients sont chez le point ou doivent y arriver
// ne peut pas être fermé (D11) : l'API refuse avec la liste des dates.
const DAYS = [
    ["mon", "Lundi"],
    ["tue", "Mardi"],
    ["wed", "Mercredi"],
    ["thu", "Jeudi"],
    ["fri", "Vendredi"],
    ["sat", "Samedi"],
    ["sun", "Dimanche"],
];

// Date du jour au Bénin (UTC+1), AAAA-MM-JJ
const todayBenin = () => new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 10);

const fmtDate = (ymd) =>
    ymd ? new Date(`${ymd}T12:00:00Z`).toLocaleDateString("fr-FR", { timeZone: "UTC", weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "";

function NextRound({ next }) {
    if (!next?.day) return null;
    return (
        <p className="text-sm text-[#3D3934]">
            Prochaine arrivée de colis chez vous : <span className="font-medium text-[#1A1814]">{next.day} à {next.hour}</span>
            {next.closed_on ? <span className="text-[#9A5B13]"> (fermé le {next.closed_on})</span> : null}.
        </p>
    );
}

export default function OpeningView() {
    const [state, setState] = useState({ status: "loading", error: null });
    const [days, setDays] = useState(null);
    const [closures, setClosures] = useState([]);
    const [next, setNext] = useState(null);
    const [saving, setSaving] = useState(false);
    const [refusal, setRefusal] = useState(null);
    const [dirty, setDirty] = useState(false);

    const apply = (data) => {
        setDays(data.days);
        setClosures((data.closures || []).map((c) => ({ from: c.from, to: c.to })));
        setNext(data.next || null);
        setDirty(false);
    };

    const load = useCallback(async () => {
        setState({ status: "loading", error: null });
        try {
            apply(await api("pickup/dashboard/opening"));
            setState({ status: "ok", error: null });
        } catch (e) {
            setState({ status: "error", error: e.message || "Impossible de charger vos jours d’ouverture." });
        }
    }, []);
    useEffect(() => { load(); }, [load]);

    const change = (fn) => {
        fn();
        setDirty(true);
        setRefusal(null);
    };
    const toggleDay = (key) => change(() => setDays((d) => ({ ...d, [key]: !d[key] })));
    const setClosure = (i, field, value) =>
        change(() =>
            setClosures((list) =>
                list.map((c, j) => {
                    if (j !== i) return c;
                    const out = { ...c, [field]: value };
                    // Date de fin vide ou avant le début : alignée sur le début
                    if (field === "from" && (!out.to || out.to < value)) out.to = value;
                    return out;
                })
            )
        );
    const addClosure = () => change(() => setClosures((list) => [...list, { from: todayBenin(), to: todayBenin() }]));
    const removeClosure = (i) => change(() => setClosures((list) => list.filter((_, j) => j !== i)));

    const noDay = days && !DAYS.some(([k]) => days[k]);
    const incomplete = closures.some((c) => !c.from || !c.to);

    const save = async () => {
        if (saving || noDay || incomplete) return;
        setSaving(true);
        setRefusal(null);
        try {
            const data = await api("pickup/dashboard/opening", { method: "PUT", body: JSON.stringify({ days, closures }) });
            apply(data);
            toast.success(data.message || "Jours d’ouverture enregistrés.");
        } catch (e) {
            setRefusal(e.message || "Enregistrement impossible.");
        } finally {
            setSaving(false);
        }
    };

    if (state.status === "loading") {
        return (
            <div className="space-y-4">
                <Skeleton className="h-10 w-72" />
                <Skeleton className="h-40" />
                <Skeleton className="h-40" />
            </div>
        );
    }
    if (state.status === "error") return <ErrorBox message={state.error} onRetry={load} />;

    const today = todayBenin();
    return (
        <div className="space-y-6">
            <SectionTitle
                title="Mes jours d’ouverture"
                subtitle="Les colis des clients arrivent chez vous par tournées. Les clients voient l’heure prévue au moment de choisir leur point de retrait."
            />

            <Card className="p-5 sm:p-6">
                <h2 className="font-serif text-lg text-[#1A1814]">Jours de la semaine</h2>
                <p className="text-sm text-[#6B655D] mt-1">Cochez les jours où vous êtes ouvert pour recevoir et remettre les colis.</p>
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                    {DAYS.map(([key, label]) => {
                        const on = !!days?.[key];
                        return (
                            <label
                                key={key}
                                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer select-none transition ${on ? "border-[#1A1814] bg-[#1A1814] text-white" : "border-[#E9E5DF] bg-white text-[#6B655D] hover:border-[#B5AEA6]"}`}
                            >
                                <input type="checkbox" className="sr-only" checked={on} onChange={() => toggleDay(key)} />
                                <span className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] ${on ? "border-white" : "border-[#B5AEA6]"}`} aria-hidden="true">
                                    {on ? "✓" : ""}
                                </span>
                                <span className="text-sm font-medium">{label}</span>
                            </label>
                        );
                    })}
                </div>
                {noDay && <p className="mt-3 text-sm text-[#9B2C2C]">Cochez au moins un jour d’ouverture dans la semaine.</p>}
            </Card>

            <Card className="p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                        <h2 className="font-serif text-lg text-[#1A1814]">Congés et fermetures exceptionnelles</h2>
                        <p className="text-sm text-[#6B655D] mt-1">Du … au … inclus. Un jour où des colis de clients sont chez vous ou doivent arriver ne peut pas être fermé.</p>
                    </div>
                    <button
                        type="button"
                        onClick={addClosure}
                        className="shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-[#E9E5DF] text-sm font-medium text-[#1A1814] hover:border-[#1A1814] transition"
                    >
                        <Plus size={15} /> Ajouter un congé
                    </button>
                </div>
                {closures.length === 0 ? (
                    <p className="mt-4 text-sm text-[#8A837A] flex items-center gap-2">
                        <CalendarDays size={16} /> Aucun congé prévu.
                    </p>
                ) : (
                    <ul className="mt-4 space-y-3">
                        {closures.map((c, i) => (
                            <li key={i} className="flex flex-col sm:flex-row sm:items-end gap-3 p-3 rounded-xl bg-[#F9F8F6] border border-[#E9E5DF]">
                                <label className="flex-1 min-w-0">
                                    <span className="block text-xs text-[#8A837A] mb-1">Du</span>
                                    <input type="date" min={today} value={c.from} onChange={(e) => setClosure(i, "from", e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-[#E9E5DF] bg-white text-sm focus:outline-none focus:border-[#1A1814]" />
                                </label>
                                <label className="flex-1 min-w-0">
                                    <span className="block text-xs text-[#8A837A] mb-1">Au</span>
                                    <input type="date" min={c.from || today} value={c.to} onChange={(e) => setClosure(i, "to", e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-[#E9E5DF] bg-white text-sm focus:outline-none focus:border-[#1A1814]" />
                                </label>
                                <button type="button" onClick={() => removeClosure(i)} aria-label="Retirer ce congé"
                                    className="self-end sm:self-auto inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-[#9B2C2C] hover:bg-[#F5E4E4] transition">
                                    <Trash2 size={15} /> Retirer
                                </button>
                                {c.from && c.to && (
                                    <p className="sm:hidden text-xs text-[#6B655D]">{c.from === c.to ? fmtDate(c.from) : `${fmtDate(c.from)} au ${fmtDate(c.to)}`}</p>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </Card>

            {refusal && (
                <div role="alert" className="rounded-2xl border border-[#E8C5C5] bg-[#F5E4E4] px-4 py-3 text-sm text-[#9B2C2C]">
                    {refusal}
                </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <NextRound next={next} />
                <button
                    type="button"
                    onClick={save}
                    disabled={saving || !dirty || noDay || incomplete}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#1A1814] text-white text-sm font-medium disabled:opacity-50 transition"
                >
                    {saving && <Loader2 size={16} className="animate-spin" />}
                    {saving ? "Enregistrement…" : "Enregistrer"}
                </button>
            </div>
        </div>
    );
}
