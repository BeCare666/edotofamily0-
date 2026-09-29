"use client";

import { useCallback, useEffect, useState } from "react";
import { Package, Gift, Wallet, Hourglass } from "lucide-react";
import { api, dateTime, fcfa, qs } from "./api";
import { Badge, Card, Empty, ErrorBox, SectionTitle, Skeleton, StatCard } from "./ui";
import PeriodFilter from "./PeriodFilter";
import { PALETTE, StackedBars } from "../dashboard-ui/charts";

// Activité : commandes + kits remis, barres empilées animées avec info-bulle
function ActivityChart({ series }) {
    return (
        <StackedBars
            label="Retraits sur la période"
            height={180}
            series={[{ key: "orders", label: "Commandes", color: PALETTE.ink }, { key: "kits", label: "Kits", color: PALETTE.rose }]}
            data={series.map((s) => ({ key: s.key, label: s.label, values: { orders: s.orders, kits: s.kits } }))}
        />
    );
}

export default function OverviewView({ period, date, onPeriodChange, refreshKey, onOpenPending }) {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    const load = useCallback(async () => {
        setError(null);
        try {
            setData(await api(`pickup/dashboard/summary${qs({ period, date })}`));
        } catch (e) {
            setError(e.message);
        }
    }, [period, date]);

    useEffect(() => {
        setData(null);
        load();
    }, [load, refreshKey]);

    const t = data?.totals;
    return (
        <div>
            <SectionTitle
                title="Vue d’ensemble"
                subtitle="Vos retraits et vos commissions sur la période choisie."
                action={<PeriodFilter period={period} date={date} onChange={onPeriodChange} />}
            />
            {error ? (
                <ErrorBox message={error} onRetry={load} />
            ) : !data ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
                    <Skeleton className="h-64 col-span-2 lg:col-span-4" />
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="dash-stagger grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard label="Commandes remises" value={t.orders_withdrawn} hint={`Produits : ${fcfa(t.products_amount)}`} icon={Package} tone="ink" />
                        <StatCard label="Kits remis" value={t.kits_withdrawn} icon={Gift} tone="rose" />
                        <StatCard label="Commissions" value={fcfa(t.commission_total)} hint={`Commandes ${fcfa(t.commission_orders)} · Kits ${fcfa(t.commission_kits)}`} icon={Wallet} tone="sage" />
                        <button onClick={onOpenPending} className="text-left rounded-3xl transition duration-300 hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6EA9]/40">
                            <StatCard label="En attente de retrait" value={data.pending.orders + data.pending.kits} hint={`${data.pending.orders} commande(s) · ${data.pending.kits} kit(s)`} icon={Hourglass} tone="sand" />
                        </button>
                    </div>

                    <div className="dash-stagger grid grid-cols-1 xl:grid-cols-3 gap-6">
                        <Card className="p-6 xl:col-span-2">
                            <h2 className="font-serif text-lg text-[#1F1B16] mb-4">Activité</h2>
                            <ActivityChart series={data.series} />
                        </Card>
                        <Card className="p-6">
                            <h2 className="font-serif text-lg text-[#1F1B16] mb-4">Derniers retraits</h2>
                            {data.latest.length === 0 ? (
                                <Empty title="Aucun retrait" text="Aucun retrait sur cette période." />
                            ) : (
                                <ul className="divide-y divide-[#F1ECE4]">
                                    {data.latest.map((w) => (
                                        <li key={`${w.type}-${w.id}`} className="py-3 flex items-center justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="text-sm text-[#1F1B16] truncate">{w.reference}</p>
                                                <p className="text-xs text-[#9A8E80] truncate">{w.customer || "—"} · {dateTime(w.withdrawn_at)}</p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <Badge tone={w.type === "kit" ? "rose" : "ink"}>{w.type === "kit" ? "Kit" : "Commande"}</Badge>
                                                <p className="text-xs text-[#3F6B45] mt-1">{w.commission === null ? "—" : `+${fcfa(w.commission)}`}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}
