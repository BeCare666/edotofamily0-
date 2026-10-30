"use client";

import { useCallback, useEffect, useState } from "react";
import { api, fcfa } from "./api";
import { Card, ErrorBox, Skeleton } from "./ui";

// Argent (B7, 30/10/2026) : depuis le début, quelle que soit la période choisie.
// Gagné = commissions des remises ; reçu = versements de l'équipe E.doto family.
// Le point demande le retrait de ses commissions (au plus le disponible) ; l'équipe paie ou refuse avec un motif.
const METHODS = [
    ["mobile_money", "Mobile Money"],
    ["bank", "Virement bancaire"],
    ["cash", "Espèces"],
];
const STATUS_TONE = {
    pending: "bg-[#FFF4E0] text-[#8A5A00]",
    paid: "bg-[#EAF3EC] text-[#2F5D3A]",
    rejected: "bg-[#FDF1EF] text-[#9B2C2C]",
    cancelled: "bg-[#F3F1EE] text-[#57524B]",
};
const input = "w-full rounded-xl border border-[#E9E5DF] bg-white px-3 py-2.5 text-sm text-[#1A1814] focus:border-[#1A1814] focus:outline-none";
const day = (d) => (d ? new Date(d).toLocaleDateString("fr-FR") : "");

export default function PayoutsCard({ refreshKey }) {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [form, setForm] = useState(null);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState(null);

    const load = useCallback(async () => {
        setError(null);
        try {
            setData(await api("pickup/dashboard/payouts"));
        } catch (e) {
            setError(e.message);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load, refreshKey]);

    const submit = async (e) => {
        e.preventDefault();
        setBusy(true);
        setMessage(null);
        try {
            const res = await api("pickup/withdrawals", { method: "POST", body: JSON.stringify({ ...form, amount: Number(form.amount) }) });
            setData(res);
            setForm(null);
            setMessage({ ok: true, text: res.message });
        } catch (err) {
            setMessage({ ok: false, text: err.message });
        } finally {
            setBusy(false);
        }
    };

    const cancel = async (id) => {
        setMessage(null);
        try {
            const res = await api(`pickup/withdrawals/${id}/cancel`, { method: "POST", body: "{}" });
            setData(res);
            setMessage({ ok: true, text: res.message });
        } catch (err) {
            setMessage({ ok: false, text: err.message });
        }
    };

    if (error) return <ErrorBox message={error} onRetry={load} />;
    if (!data) return <Skeleton className="h-40" />;

    const requests = data.requests || [];
    return (
        <Card className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h2 className="font-serif text-lg text-[#1A1814]">Mon argent</h2>
                    <p className="text-xs text-[#8A837A] mt-1">Depuis le début. Les versements sont faits par l’équipe E.doto family.</p>
                </div>
                {!form && (data.available ?? 0) > 0 && (
                    <button
                        type="button"
                        onClick={() => { setMessage(null); setForm({ amount: String(data.available), method: "mobile_money", account: "", note: "" }); }}
                        className="rounded-xl bg-[#1A1814] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#3D3934]"
                    >
                        Demander un retrait
                    </button>
                )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                <div>
                    <p className="text-xs uppercase tracking-[0.12em] text-[#8A837A]">Gagné</p>
                    <p className="mt-1 text-lg font-semibold text-[#1A1814]">{fcfa(data.earned)}</p>
                </div>
                <div>
                    <p className="text-xs uppercase tracking-[0.12em] text-[#8A837A]">Reçu</p>
                    <p className="mt-1 text-lg font-semibold text-[#1A1814]">{fcfa(data.paid)}</p>
                </div>
                <div>
                    <p className="text-xs uppercase tracking-[0.12em] text-[#8A837A]">Demandé</p>
                    <p className="mt-1 text-lg font-semibold text-[#8A5A00]">{fcfa(data.pending)}</p>
                </div>
                <div>
                    <p className="text-xs uppercase tracking-[0.12em] text-[#8A837A]">Disponible</p>
                    <p className="mt-1 text-lg font-semibold text-[#3F6B45]">{fcfa(data.available)}</p>
                </div>
            </div>

            {message && <p className={`mt-4 text-sm ${message.ok ? "text-[#2F5D3A]" : "text-[#9B2C2C]"}`}>{message.text}</p>}

            {form && (
                <form onSubmit={submit} className="mt-5 rounded-2xl border border-[#E9E5DF] bg-[#FBFAF8] p-4 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <label className="text-sm text-[#57524B]">Montant (FCFA)
                            <input type="number" min={1} max={data.available} step="1" required className={`${input} mt-1`} value={form.amount}
                                onChange={(e) => setForm({ ...form, amount: e.target.value })} />
                        </label>
                        <label className="text-sm text-[#57524B]">Recevoir par
                            <select className={`${input} mt-1`} value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
                                {METHODS.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                            </select>
                        </label>
                        {form.method !== "cash" && (
                            <label className="text-sm text-[#57524B]">{form.method === "bank" ? "Numéro de compte" : "Numéro Mobile Money"}
                                <input type="text" required maxLength={100} className={`${input} mt-1`} value={form.account}
                                    onChange={(e) => setForm({ ...form, account: e.target.value })} />
                            </label>
                        )}
                    </div>
                    <label className="block text-sm text-[#57524B]">Note pour l’équipe (facultatif)
                        <input type="text" maxLength={255} className={`${input} mt-1`} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
                    </label>
                    <div className="flex gap-2">
                        <button type="submit" disabled={busy} className="rounded-xl bg-[#1A1814] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#3D3934] disabled:opacity-60">
                            {busy ? "Envoi..." : "Envoyer la demande"}
                        </button>
                        <button type="button" onClick={() => setForm(null)} className="rounded-xl px-4 py-2.5 text-sm text-[#57524B] hover:bg-[#F3F1EE]">Annuler</button>
                    </div>
                </form>
            )}

            {requests.length > 0 && (
                <div className="mt-5 border-t border-[#EFECE7] pt-4">
                    <h3 className="text-sm font-semibold text-[#1A1814]">Mes demandes de retrait</h3>
                    <ul className="mt-2 divide-y divide-[#F1EFEB]">
                        {requests.slice(0, 5).map((r) => (
                            <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-2.5 text-sm">
                                <span className="min-w-0">
                                    <span className="text-[#1A1814]">{day(r.created_at)}</span>
                                    <span className="text-[#8A837A]"> · {r.method_label}{r.account ? ` · ${r.account}` : ""}</span>
                                    {r.admin_note && r.status === "rejected" && <span className="block text-xs text-[#9B2C2C]">Motif : {r.admin_note}</span>}
                                </span>
                                <span className="flex items-center gap-2">
                                    <span className="font-medium text-[#1A1814]">{fcfa(r.amount)}</span>
                                    <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_TONE[r.status] || STATUS_TONE.cancelled}`}>{r.status_label}</span>
                                    {r.status === "pending" && (
                                        <button type="button" onClick={() => cancel(r.id)} className="text-xs text-[#9B2C2C] hover:underline">Annuler</button>
                                    )}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="mt-5 border-t border-[#EFECE7] pt-4">
                <h3 className="text-sm font-semibold text-[#1A1814]">Versements reçus</h3>
                {data.payouts.length === 0 ? (
                    <p className="mt-2 text-sm text-[#8A837A]">Aucun versement reçu pour le moment.</p>
                ) : (
                    <ul className="mt-2 divide-y divide-[#F1EFEB]">
                        {data.payouts.slice(0, 5).map((v) => (
                            <li key={v.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                                <span className="min-w-0">
                                    <span className="text-[#1A1814]">{day(`${v.paid_at}T00:00:00`)}</span>
                                    <span className="text-[#8A837A]"> · {v.method_label}{v.reference ? ` · ${v.reference}` : ""}</span>
                                </span>
                                <span className="shrink-0 font-medium text-[#3F6B45]">+{fcfa(v.amount)}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </Card>
    );
}
