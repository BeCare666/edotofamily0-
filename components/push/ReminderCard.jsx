"use client";

import { useEffect, useState } from "react";
import { AlarmClock, Loader2 } from "lucide-react";
import { Card } from "../pickup-dashboard/ui";
import { usePush } from "../../lib/push";

// Dashboard jeune, Ma contraception (04/11/2026, plan notifications étape 2.2 bis, décision D4) :
// rappel à rythme libre, réglé par la personne ; le site ne fait aucun calcul médical.
// Le rappel arrive en notification (texte discret : « C'est l'heure de votre rappel »), heure du Bénin.
const API = process.env.NEXT_PUBLIC_REST_API_ENDPOINT;
const RHYTHMS = [
    { value: "daily", label: "Tous les jours" },
    { value: "weekly", label: "Toutes les semaines" },
    { value: "every4weeks", label: "Toutes les 4 semaines" },
    { value: "every3months", label: "Tous les 3 mois" },
    { value: "once", label: "Une seule fois" },
];

const todayBenin = () => new Date(Date.now() + 3600000).toISOString().slice(0, 10);
const token = () => {
    try { return localStorage.getItem("token"); } catch { return null; }
};
async function call(method, body) {
    const res = await fetch(`${API}/contraception/me/reminder`, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error((data && (Array.isArray(data.message) ? data.message[0] : data.message)) || "Une erreur est survenue.");
    return data;
}

export default function ReminderCard() {
    const push = usePush();
    const [saved, setSaved] = useState(null);
    const [form, setForm] = useState({ rhythm: "daily", time_hm: "08:00", start_date: todayBenin() });
    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState("");
    const [err, setErr] = useState("");

    useEffect(() => {
        call("GET")
            .then((r) => {
                if (r && r.rhythm) {
                    setSaved(r);
                    setForm({ rhythm: r.rhythm, time_hm: r.time_hm, start_date: r.start_date });
                }
            })
            .catch(() => undefined);
    }, []);

    const save = async () => {
        setBusy(true); setErr(""); setMsg("");
        try {
            const r = await call("PUT", form);
            setSaved(r);
            setMsg("Rappel enregistré.");
        } catch (e) {
            setErr(e.message);
        } finally {
            setBusy(false);
        }
    };
    const stop = async () => {
        setBusy(true); setErr(""); setMsg("");
        try {
            await call("DELETE");
            setSaved(null);
            setMsg("Rappel arrêté.");
        } catch (e) {
            setErr(e.message);
        } finally {
            setBusy(false);
        }
    };

    const field = "mt-1 w-full rounded-xl border border-[#E9E5DF] bg-white px-3 py-2.5 text-sm text-[#1A1814] outline-none focus:border-[#C2185B]";

    return (
        <Card className="p-5 sm:p-6">
            <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FBEEF3] text-[#C2185B]"><AlarmClock size={20} /></span>
                <div className="min-w-0">
                    <p className="font-medium text-[#1A1814]">Mon rappel</p>
                    <p className="mt-1 text-sm leading-relaxed text-[#57524B]">
                        Choisissez quand être prévenu(e) : prise, changement ou renouvellement, selon ce que vous a indiqué le professionnel de santé.
                        Le message reste discret : « C’est l’heure de votre rappel ».
                    </p>
                </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <label className="text-[13px] text-[#57524B]">Rythme
                    <select value={form.rhythm} onChange={(e) => setForm({ ...form, rhythm: e.target.value })} className={field}>
                        {RHYTHMS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                </label>
                <label className="text-[13px] text-[#57524B]">Heure
                    <input type="time" value={form.time_hm} onChange={(e) => setForm({ ...form, time_hm: e.target.value })} className={field} />
                </label>
                <label className="text-[13px] text-[#57524B]">{form.rhythm === "once" ? "Date" : "À partir du"}
                    <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className={field} />
                </label>
            </div>

            {push.state !== "on" && push.state !== "loading" && (
                <p className="mt-4 rounded-xl bg-[#F9F8F6] px-4 py-3 text-[13px] text-[#57524B]">
                    {push.state === "unsupported"
                        ? "Cet appareil ne reçoit pas les notifications. Installez l’application E.doto family pour recevoir votre rappel."
                        : push.state === "denied"
                            ? "Les notifications sont bloquées sur ce téléphone : votre rappel ne pourra pas s’afficher."
                            : "Pour recevoir votre rappel, activez aussi les notifications sur ce téléphone."}
                    {push.state === "off" && (
                        <button type="button" onClick={push.enable} disabled={push.busy} className="ml-2 font-semibold text-[#C2185B]">Activer</button>
                    )}
                </p>
            )}

            {(msg || err) && <p className={`mt-3 text-sm ${err ? "text-[#B91C1C]" : "text-[#15803D]"}`}>{err || msg}</p>}

            <div className="mt-4 flex flex-wrap justify-end gap-2">
                {saved && (
                    <button type="button" onClick={stop} disabled={busy} className="rounded-xl border border-[#E9E5DF] px-5 py-2.5 text-sm font-semibold text-[#1A1814] disabled:opacity-60">
                        Arrêter le rappel
                    </button>
                )}
                <button type="button" onClick={save} disabled={busy}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#C2185B] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
                    {busy && <Loader2 size={16} className="animate-spin" />} {saved ? "Mettre à jour" : "Enregistrer le rappel"}
                </button>
            </div>
        </Card>
    );
}
