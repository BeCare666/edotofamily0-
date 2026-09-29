"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { api, dateTime, fcfa, isExpired, qs } from "./api";
import { Badge, Card, Empty, ErrorBox, SectionTitle, Skeleton, Tabs } from "./ui";

export default function OrdersView({ search, refreshKey, onOpen }) {
    const [status, setStatus] = useState("pending");
    const [page, setPage] = useState(1);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    const load = useCallback(async () => {
        setError(null);
        try {
            setData(await api(`pickup/dashboard/orders${qs({ status, q: search, page, limit: 15 })}`));
        } catch (e) {
            setError(e.message);
        }
    }, [status, search, page]);

    useEffect(() => {
        setData(null);
        load();
    }, [load, refreshKey]);
    useEffect(() => setPage(1), [status, search]);

    return (
        <div>
            <SectionTitle
                title="Commandes"
                subtitle={search ? `Résultats pour « ${search} »` : "Commandes payées rattachées à votre point."}
                action={
                    <Tabs value={status} onChange={setStatus} items={[
                        { key: "pending", label: "À remettre" },
                        { key: "withdrawn", label: "Remises" },
                        { key: "all", label: "Toutes" },
                    ]} />
                }
            />
            {error ? (
                <ErrorBox message={error} onRetry={load} />
            ) : !data ? (
                <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
            ) : data.data.length === 0 ? (
                <Card><Empty title="Aucune commande" text={status === "pending" ? "Aucune commande n’attend de retrait." : "Rien à afficher."} /></Card>
            ) : (
                <>
                    <Card className="divide-y divide-[#F1ECE4] overflow-hidden">
                        {data.data.map((o) => (
                            <button key={o.id} onClick={() => onOpen({ type: "order", data: o })} className="w-full text-left px-5 sm:px-6 py-4 flex items-center gap-4 hover:bg-[#FBF8F4] transition">
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="font-medium text-[#1F1B16]">{o.tracking_number}</span>
                                        {o.withdrawn ? <Badge tone="ok">Remise</Badge> : isExpired(o.otp_expires_at) ? <Badge tone="off">Code expiré</Badge> : <Badge tone="wait">À remettre</Badge>}
                                    </div>
                                    <p className="text-sm text-[#7A6E62] mt-1 truncate">
                                        {o.customer_name || "Client"} · {o.withdrawn ? `remise le ${dateTime(o.delivered_at)}` : `commandée le ${dateTime(o.created_at)}`}
                                    </p>
                                </div>
                                <div className="text-right shrink-0 hidden sm:block">
                                    <p className="text-sm text-[#1F1B16]">{fcfa(o.products_amount)}</p>
                                    {o.withdrawn && <p className="text-xs text-[#3F6B45]">{o.commission_amount === null ? "Commission —" : `Commission ${fcfa(o.commission_amount)}`}</p>}
                                </div>
                                <ChevronRight size={18} className="text-[#B8AC9E] shrink-0" />
                            </button>
                        ))}
                    </Card>
                    {data.last_page > 1 && (
                        <div className="flex items-center justify-center gap-3 mt-5 text-sm">
                            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-4 py-2 rounded-xl border border-[#E4DBCE] bg-white disabled:opacity-40">Précédent</button>
                            <span className="text-[#7A6E62]">{page} / {data.last_page}</span>
                            <button disabled={page >= data.last_page} onClick={() => setPage((p) => p + 1)} className="px-4 py-2 rounded-xl border border-[#E4DBCE] bg-white disabled:opacity-40">Suivant</button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
