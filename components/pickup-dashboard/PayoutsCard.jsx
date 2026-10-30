"use client";

import { useCallback, useEffect, useState } from "react";
import { api, fcfa } from "./api";
import { Card, ErrorBox, Skeleton } from "./ui";

// Argent (B7, 30/10/2026) : depuis le début, quelle que soit la période choisie.
// Gagné = commissions des remises ; reçu = versements notés par l'équipe E.doto family.
export default function PayoutsCard({ refreshKey }) {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

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

    if (error) return <ErrorBox message={error} onRetry={load} />;
    if (!data) return <Skeleton className="h-40" />;

    return (
        <Card className="p-6">
            <h2 className="font-serif text-lg text-[#1A1814]">Mon argent</h2>
            <p className="text-xs text-[#8A837A] mt-1">Depuis le début. Les versements sont notés par l’équipe E.doto family.</p>
            <div className="grid grid-cols-3 gap-3 mt-4">
                <div>
                    <p className="text-xs uppercase tracking-[0.12em] text-[#8A837A]">Gagné</p>
                    <p className="mt-1 text-lg font-semibold text-[#1A1814]">{fcfa(data.earned)}</p>
                </div>
                <div>
                    <p className="text-xs uppercase tracking-[0.12em] text-[#8A837A]">Reçu</p>
                    <p className="mt-1 text-lg font-semibold text-[#1A1814]">{fcfa(data.paid)}</p>
                </div>
                <div>
                    <p className="text-xs uppercase tracking-[0.12em] text-[#8A837A]">Reste à recevoir</p>
                    <p className="mt-1 text-lg font-semibold text-[#3F6B45]">{fcfa(data.balance)}</p>
                </div>
            </div>
            <div className="mt-5 border-t border-[#EFECE7] pt-4">
                {data.payouts.length === 0 ? (
                    <p className="text-sm text-[#8A837A]">Aucun versement reçu pour le moment.</p>
                ) : (
                    <ul className="divide-y divide-[#F1EFEB]">
                        {data.payouts.slice(0, 5).map((v) => (
                            <li key={v.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                                <span className="min-w-0">
                                    <span className="text-[#1A1814]">{new Date(`${v.paid_at}T00:00:00`).toLocaleDateString("fr-FR")}</span>
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
