"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { LayoutDashboard, Package, Gift, Wallet, Search, Bell, LogOut, User, Loader2 } from "lucide-react";
import { useAuthContext } from "../../context/AuthContext";
import { api, dateTime, qs } from "./api";
import DashboardFrame from "../dashboard-ui/DashboardFrame";

export const MENU = [
    { key: "overview", label: "Vue d’ensemble", icon: LayoutDashboard },
    { key: "orders", label: "Commandes", icon: Package },
    { key: "kits", label: "Kits de campagne", icon: Gift },
    { key: "history", label: "Compte & historique", icon: Wallet },
];

function initials(name) {
    return String(name || "?").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("") || "?";
}

function useClickOutside(ref, onOutside) {
    useEffect(() => {
        const h = (e) => ref.current && !ref.current.contains(e.target) && onOutside();
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, [ref, onOutside]);
}

// Recherche : résultats rapides (commandes et kits du point) ; la vue en cours est aussi filtrée
function SearchBox({ value, onChange, onPick }) {
    const [results, setResults] = useState(null);
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useClickOutside(ref, () => setOpen(false));

    useEffect(() => {
        const q = value.trim();
        if (q.length < 2) {
            setResults(null);
            return;
        }
        let cancelled = false;
        const t = setTimeout(async () => {
            try {
                const [orders, kits] = await Promise.all([
                    api(`pickup/dashboard/orders${qs({ q, limit: 5 })}`),
                    api(`pickup/dashboard/kits${qs({ q })}`),
                ]);
                if (!cancelled) setResults({ orders: orders.data, kits: kits.slice(0, 5) });
            } catch {
                if (!cancelled) setResults({ orders: [], kits: [] });
            }
        }, 300);
        return () => {
            cancelled = true;
            clearTimeout(t);
        };
    }, [value]);

    const empty = results && results.orders.length === 0 && results.kits.length === 0;
    return (
        <div ref={ref} className="relative flex-1 min-w-0 max-w-xl">
            <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A8E80]" aria-hidden="true" />
            <input
                type="search"
                value={value}
                onChange={(e) => { onChange(e.target.value); setOpen(true); }}
                onFocus={() => setOpen(true)}
                placeholder="Rechercher une commande, un client, une campagne…"
                aria-label="Rechercher"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#F6F1EA] border border-transparent focus:bg-white focus:border-[#E4DBCE] text-sm text-[#1F1B16] placeholder:text-[#9A8E80] focus:outline-none focus:ring-2 focus:ring-[#FF6EA9]/25 transition"
            />
            {open && value.trim().length >= 2 && (
                <div className="dash-pop-in absolute left-0 right-0 mt-2 bg-[#FFFDF9] rounded-2xl border border-[#EDE6DC] shadow-2xl overflow-hidden z-[80]">
                    {!results ? (
                        <p className="px-4 py-4 text-sm text-[#7A6E62] flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Recherche…</p>
                    ) : empty ? (
                        <p className="px-4 py-4 text-sm text-[#7A6E62]">Aucun résultat.</p>
                    ) : (
                        <div className="max-h-80 overflow-y-auto py-2">
                            {results.orders.map((o) => (
                                <button key={`o-${o.id}`} onClick={() => { setOpen(false); onPick({ type: "order", data: o }); }} className="w-full text-left px-4 py-2.5 hover:bg-[#F6F1EA] flex items-center gap-3">
                                    <Package size={16} className="text-[#7A6E62] shrink-0" />
                                    <span className="min-w-0"><span className="block text-sm text-[#1F1B16] truncate">{o.tracking_number}</span><span className="block text-xs text-[#9A8E80] truncate">{o.customer_name || "Client"}</span></span>
                                </button>
                            ))}
                            {results.kits.map((k) => (
                                <button key={`k-${k.id}`} onClick={() => { setOpen(false); onPick({ type: "kit", data: k }); }} className="w-full text-left px-4 py-2.5 hover:bg-[#F6F1EA] flex items-center gap-3">
                                    <Gift size={16} className="text-[#C2185B] shrink-0" />
                                    <span className="min-w-0"><span className="block text-sm text-[#1F1B16] truncate">{k.full_name}</span><span className="block text-xs text-[#9A8E80] truncate">{k.campaign_title}</span></span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// Cloche : retraits en attente (commandes payées et kits non remis), actualisée chaque minute
function Notifications({ data, onPick }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useClickOutside(ref, () => setOpen(false));
    const count = data?.count || 0;
    return (
        <div ref={ref} className="relative">
            <button onClick={() => setOpen((v) => !v)} className="relative w-11 h-11 rounded-2xl bg-[#F6F1EA] hover:bg-[#EFE7DC] flex items-center justify-center text-[#3B342D] transition" aria-label={`Notifications : ${count} retrait(s) en attente`}>
                <Bell size={19} />
                {count > 0 && <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-[#FF6EA9] text-white text-[11px] flex items-center justify-center ring-2 ring-white">{count > 99 ? "99+" : count}</span>}
            </button>
            {open && (
                <div className="dash-pop-in absolute right-0 mt-2 w-80 max-sm:fixed max-sm:inset-x-4 max-sm:top-16 max-sm:w-auto bg-[#FFFDF9] rounded-2xl border border-[#EDE6DC] shadow-2xl overflow-hidden z-[80]">
                    <div className="px-4 py-3 border-b border-[#F1ECE4]">
                        <p className="font-serif text-[#1F1B16]">En attente de retrait</p>
                        <p className="text-xs text-[#9A8E80]">{data?.pending?.orders || 0} commande(s) · {data?.pending?.kits || 0} kit(s)</p>
                    </div>
                    {!data?.items?.length ? (
                        <p className="px-4 py-6 text-sm text-[#7A6E62] text-center">Rien en attente.</p>
                    ) : (
                        <ul className="max-h-80 overflow-y-auto py-1">
                            {data.items.map((n) => (
                                <li key={`${n.type}-${n.id}`}>
                                    <button onClick={() => { setOpen(false); onPick({ type: n.type, data: n.data }); }} className="w-full text-left px-4 py-3 hover:bg-[#F6F1EA] flex gap-3">
                                        <span className={`mt-1 w-2 h-2 rounded-full shrink-0 ${n.type === "kit" ? "bg-[#FF6EA9]" : "bg-[#1F1B16]"}`} />
                                        <span className="min-w-0">
                                            <span className="block text-sm text-[#1F1B16] truncate">{n.title}</span>
                                            <span className="block text-xs text-[#9A8E80] truncate">{n.subtitle || "—"} · {dateTime(n.created_at)}</span>
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}

function AvatarMenu({ me }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const router = useRouter();
    const { logout } = useAuthContext() || {};
    useClickOutside(ref, () => setOpen(false));
    const avatar = me?.profile?.avatar?.url;
    const signOut = async () => {
        try {
            await logout?.();
        } catch {
            localStorage.removeItem("token");
        }
        router.push("/login");
    };
    return (
        <div ref={ref} className="relative">
            <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-3 pl-1 pr-1 md:pr-3 py-1 rounded-2xl hover:bg-[#F6F1EA] transition" aria-haspopup="menu" aria-expanded={open}>
                {avatar ? (
                    <img src={avatar} alt="" className="w-10 h-10 rounded-xl object-cover" />
                ) : (
                    <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6EA9] to-[#C2185B] text-white text-sm font-semibold flex items-center justify-center">{initials(me?.name)}</span>
                )}
                <span className="hidden md:block text-left">
                    <span className="block text-sm text-[#1F1B16] max-w-[160px] truncate">{me?.name}</span>
                    <span className="block text-xs text-[#9A8E80]">Point de retrait</span>
                </span>
            </button>
            {open && (
                <div role="menu" className="dash-pop-in absolute right-0 mt-2 w-56 bg-[#FFFDF9] rounded-2xl border border-[#EDE6DC] shadow-2xl overflow-hidden z-[80] py-1">
                    <Link href="/profile" role="menuitem" className="flex items-center gap-2 px-4 py-3 text-sm text-[#1F1B16] hover:bg-[#F6F1EA]"><User size={16} /> Mon profil</Link>
                    <button role="menuitem" onClick={signOut} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-[#9B2C2C] hover:bg-[#F6F1EA]"><LogOut size={16} /> Déconnexion</button>
                </div>
            )}
        </div>
    );
}

export default function Shell({ me, view, onView, search, onSearch, notifications, onPick, children }) {
    const pending = notifications?.pending;
    const menu = MENU.map((m) => ({ ...m, badge: m.key === "orders" ? pending?.orders : m.key === "kits" ? pending?.kits : 0 }));
    return (
        <DashboardFrame
            space="Point de retrait"
            identity={{ name: me?.name, detail: me?.pickup_address || me?.email }}
            menu={menu}
            active={view}
            onView={onView}
            viewKey={view}
            storageKey="edoto:pickup-sidebar"
            footerText="E·Doto Family"
            search={<SearchBox value={search} onChange={onSearch} onPick={onPick} />}
            actions={<><Notifications data={notifications} onPick={onPick} /><AvatarMenu me={me} /></>}
        >
            {children}
        </DashboardFrame>
    );
}
