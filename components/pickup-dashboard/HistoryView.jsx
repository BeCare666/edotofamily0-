"use client";

import { useCallback, useEffect, useState } from "react";
import { api, dateTime, fcfa, qs } from "./api";
import { Badge, Card, Empty, ErrorBox, SectionTitle, Skeleton, Tabs } from "./ui";
import PeriodFilter from "./PeriodFilter";

// Compte global : tous les retraits de la période avec leur commission
export default function HistoryView({ period, date, onPeriodChange, search, refreshKey }) {
    const [type, setType] = useState("all");
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    const load = useCallback(async () => {
        setError(null);
        try {
            setData(await api(`pickup/dashboard/history${qs({ period, date, type, q: search })}`));
        } catch (e) {
            setError(e.message);
        }
    }, [period, date, type, search]);

    useEffect(() => {
        setData(null);
        load();
    }, [load, refreshKey]);

    return (
        <div>
            <SectionTitle
                title="Compte & historique"
                subtitle="Chaque retrait et la commission enregistrée au moment du retrait."
                action={<PeriodFilter period={period} date={date} onChange={onPeriodChange} />}
            />
            <div className="mb-5">
                <Tabs value={type} onChange={setType} items={[
                    { key: "all", label: "Tout" },
                    { key: "order", label: "Commandes" },
                    { key: "kit", label: "Kits" },
                ]} />
            </div>
            {error ? (
                <ErrorBox message={error} onRetry={load} />
            ) : !data ? (
                <Skeleton className="h-80" />
            ) : (
                <>
                    <div className="dash-stagger grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <Card className="p-5"><p className="text-xs uppercase tracking-[0.12em] text-[#9A8E80]">Retraits</p><p className="mt-2 text-2xl font-semibold text-[#1F1B16]">{data.totals.count}</p></Card>
                        <Card className="p-5"><p className="text-xs uppercase tracking-[0.12em] text-[#9A8E80]">Montant des produits remis</p><p className="mt-2 text-2xl font-semibold text-[#1F1B16]">{fcfa(data.totals.products_amount)}</p></Card>
                        <Card className="p-5"><p className="text-xs uppercase tracking-[0.12em] text-[#9A8E80]">Commissions</p><p className="mt-2 text-2xl font-semibold text-[#3F6B45]">{fcfa(data.totals.commission)}</p></Card>
                    </div>
                    <Card className="overflow-x-auto">
                        {data.data.length === 0 ? (
                            <Empty title="Aucun retrait" text="Aucun retrait sur cette période." />
                        ) : (
                            <>
                            {/* Mobile : une carte par retrait */}
                            <ul className="md:hidden divide-y divide-[#F1ECE4]">
                                {data.data.map((w) => (
                                    <li key={`m-${w.type}-${w.id}`} className="px-5 py-4 flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <Badge tone={w.type === "kit" ? "rose" : "ink"}>{w.type === "kit" ? "Kit" : "Commande"}</Badge>
                                                <span className="text-sm text-[#1F1B16] truncate">{w.reference}</span>
                                            </div>
                                            <p className="text-xs text-[#9A8E80] mt-1 truncate">{w.customer || "Client non renseigné"} · {dateTime(w.withdrawn_at)}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-sm text-[#1F1B16]">{w.amount === null ? "Kit gratuit" : fcfa(w.amount)}</p>
                                            <p className="text-xs text-[#3F6B45] mt-0.5">{w.commission === null ? "Non calculée" : `+${fcfa(w.commission)}`}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            <table className="hidden md:table w-full min-w-[640px] text-sm">
                                <thead>
                                    <tr className="text-left text-xs uppercase tracking-wider text-[#9A8E80] border-b border-[#F1ECE4]">
                                        <th className="px-6 py-4 font-medium">Date</th>
                                        <th className="px-6 py-4 font-medium">Type</th>
                                        <th className="px-6 py-4 font-medium">Référence</th>
                                        <th className="px-6 py-4 font-medium">Client</th>
                                        <th className="px-6 py-4 font-medium text-right">Produits</th>
                                        <th className="px-6 py-4 font-medium text-right">Commission</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#F1ECE4]">
                                    {data.data.map((w) => (
                                        <tr key={`${w.type}-${w.id}`} className="hover:bg-[#FBF8F4]">
                                            <td className="px-6 py-3.5 text-[#7A6E62] whitespace-nowrap">{dateTime(w.withdrawn_at)}</td>
                                            <td className="px-6 py-3.5"><Badge tone={w.type === "kit" ? "rose" : "ink"}>{w.type === "kit" ? "Kit" : "Commande"}</Badge></td>
                                            <td className="px-6 py-3.5 text-[#1F1B16]">{w.reference}</td>
                                            <td className="px-6 py-3.5 text-[#1F1B16]">{w.customer || "Client non renseigné"}</td>
                                            <td className="px-6 py-3.5 text-right text-[#1F1B16]">{w.amount === null ? "Kit gratuit" : fcfa(w.amount)}</td>
                                            <td className="px-6 py-3.5 text-right text-[#3F6B45]">{w.commission === null ? "Non calculée" : fcfa(w.commission)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            </>
                        )}
                    </Card>
                    <p className="text-xs text-[#9A8E80] mt-3">« Non calculée » : retrait antérieur à la mise en place des commissions.</p>
                </>
            )}
        </div>
    );
}
