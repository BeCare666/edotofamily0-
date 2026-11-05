"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { getPushPreferences, savePushPreferences } from "../../lib/push";

// Paramètres (05/11/2026, rapports/PLAN_PARAMETRES_COMPTES.md, décision P4) : notifications par sujet.
// Le rappel contraception a son propre réglage (Ma contraception) ; la notification d'activation part toujours.
const TOPICS = [
    { key: "orders", label: "Commandes et kits", text: "Paiement confirmé, en route, retirée ou livrée, remboursée" },
    { key: "appointments", label: "Rendez-vous", text: "Réservation confirmée et rappel avant le rendez-vous" },
    { key: "campaigns", label: "Nouvelles campagnes", text: "Quand une nouvelle campagne commence" },
];

export default function PushTopics() {
    const [prefs, setPrefs] = useState(null);
    const [saving, setSaving] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        let alive = true;
        getPushPreferences().then((p) => alive && setPrefs(p)).catch((e) => alive && setError(e.message));
        return () => { alive = false; };
    }, []);

    const toggle = async (key) => {
        if (!prefs || saving) return;
        setSaving(key);
        setError("");
        try {
            setPrefs(await savePushPreferences({ [key]: !prefs[key] }));
        } catch (e) {
            setError(e.message);
        } finally {
            setSaving("");
        }
    };

    if (!prefs && !error) {
        return <p className="mt-4 flex items-center gap-2 text-sm text-[#8A837A]"><Loader2 size={15} className="animate-spin" /> Chargement de vos choix…</p>;
    }

    return (
        <div className="mt-5 border-t border-[#F1EFEB] pt-4">
            <p className="text-[13px] font-medium text-[#57524B]">Je reçois une notification pour :</p>
            {prefs && (
                <ul className="mt-2 divide-y divide-[#F1EFEB]">
                    {TOPICS.map((t) => {
                        const on = !!prefs[t.key];
                        return (
                            <li key={t.key} className="flex items-center gap-4 py-3">
                                <span className="min-w-0 flex-1">
                                    <span className="block text-sm font-medium text-[#1A1814]">{t.label}</span>
                                    <span className="block text-[12.5px] text-[#8A837A]">{t.text}</span>
                                </span>
                                <button type="button" role="switch" aria-checked={on} aria-label={t.label} onClick={() => toggle(t.key)} disabled={!!saving}
                                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition disabled:opacity-60 ${on ? "bg-[#C2185B]" : "bg-[#D9D4CD]"}`}>
                                    {saving === t.key
                                        ? <Loader2 size={14} className="mx-auto animate-spin text-white" />
                                        : <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition ${on ? "translate-x-5" : "translate-x-0.5"}`} />}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
            {error && <p className="mt-2 text-sm text-[#B91C1C]">{error}</p>}
        </div>
    );
}
