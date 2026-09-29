"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { api, dateTime, fcfa, isExpired, qs } from "./api";
import { Badge, Card, Empty, ErrorBox, SectionTitle, Skeleton, Tabs } from "./ui";

// Kits de toutes les campagnes rattachés au point (y compris celles qui sont terminées)
export default function KitsView({ search, refreshKey, onOpen }) {
    const [status, setStatus] = useState("pending");
    const [rows, setRows] = useState(null);
    const [error, setError] = useState(null);

    const load = useCallback(async () => {
        setError(null);
        try {
            setRows(await api(`pickup/dashboard/kits${qs({ status, q: search })}`));
        } catch (e) {
            setError(e.message);
        }
    }, [status, search]);

    useEffect(() => {
        setRows(null);
        load();
    }, [load, refreshKey]);

    // Regroupement par campagne
    const groups = useMemo(() => {
        const m = new Map();
        for (const r of rows || []) {
            if (!m.has(r.campaign_id)) m.set(r.campaign_id, { title: r.campaign_title, items: [] });
            m.get(r.campaign_id).items.push(r);
        }
        return [...m.values()];
    }, [rows]);

    return (
        <div>
            <SectionTitle
                title="Kits de campagne"
                subtitle={search ? `Résultats pour « ${search} »` : "Kits de toutes les campagnes à remettre dans votre point."}
                action={
                    <Tabs value={status} onChange={setStatus} items={[
                        { key: "pending", label: "À remettre" },
                        { key: "withdrawn", label: "Remis" },
                        { key: "all", label: "Tous" },
                    ]} />
                }
            />
            {error ? (
                <ErrorBox message={error} onRetry={load} />
            ) : !rows ? (
                <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
            ) : rows.length === 0 ? (
                <Card><Empty title="Aucun kit" text={status === "pending" ? "Aucun kit n’attend de retrait." : "Rien à afficher."} /></Card>
            ) : (
                <div className="dash-stagger space-y-6">
                    {groups.map((g) => (
                        <Card key={g.title} className="overflow-hidden">
                            <div className="px-5 sm:px-6 py-4 border-b border-[#F1ECE4] flex items-center justify-between gap-3">
                                <h2 className="font-serif text-lg text-[#1F1B16] min-w-0 truncate">{g.title}</h2>
                                <span className="shrink-0 text-xs text-[#9A8E80]">{g.items.length} kit{g.items.length > 1 ? "s" : ""}</span>
                            </div>
                            <div className="divide-y divide-[#F1ECE4]">
                                {g.items.map((k) => (
                                    <button key={k.id} onClick={() => onOpen({ type: "kit", data: k })} className="w-full text-left px-5 sm:px-6 py-4 flex items-center gap-4 hover:bg-[#FBF8F4] transition">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="font-medium text-[#1F1B16]">{k.full_name}</span>
                                                {k.picked_up ? <Badge tone="ok">Remis</Badge>
                                                    : k.otp_used ? <Badge tone="wait">Code validé</Badge>
                                                        : isExpired(k.otp_expires_at) ? <Badge tone="off">Code expiré</Badge>
                                                            : <Badge tone="wait">À remettre</Badge>}
                                            </div>
                                            <p className="text-sm text-[#7A6E62] mt-1 truncate">
                                                {k.city || "Ville non renseignée"} · {k.picked_up ? `remis le ${dateTime(k.picked_up_at)}` : `inscrit le ${dateTime(k.created_at)}`}
                                            </p>
                                        </div>
                                        {k.picked_up && (
                                            <p className="text-xs text-[#3F6B45] shrink-0 hidden sm:block">{k.commission_amount === null ? "Commission —" : `Commission ${fcfa(k.commission_amount)}`}</p>
                                        )}
                                        <ChevronRight size={18} className="text-[#B8AC9E] shrink-0" />
                                    </button>
                                ))}
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
