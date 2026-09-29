"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { Home, Megaphone, FileSpreadsheet, Search, Bell, LogOut, CheckCircle2, XCircle } from "lucide-react";
import { useAuthContext } from "../../context/AuthContext";
import { dateTime } from "../pickup-dashboard/api";
import DashboardFrame from "../dashboard-ui/DashboardFrame";

export const SPONSOR_MENU = [
    { key: "home", label: "Accueil", icon: Home },
    { key: "campaigns", label: "Mes campagnes", icon: Megaphone },
    { key: "exports", label: "Exports", icon: FileSpreadsheet },
];

function useClickOutside(ref, onOutside) {
    useEffect(() => {
        const h = (e) => ref.current && !ref.current.contains(e.target) && onOutside();
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, [ref, onOutside]);
}

const initials = (n) => String(n || "?").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("") || "?";

function Bellmenu({ data, onOpenExports }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useClickOutside(ref, () => setOpen(false));
    const count = data?.count || 0;
    return (
        <div ref={ref} className="relative">
            <button onClick={() => setOpen((v) => !v)} className="relative w-11 h-11 rounded-2xl bg-[#F6F1EA] hover:bg-[#EFE7DC] transition flex items-center justify-center text-[#3B342D]" aria-label={`Notifications : ${count} nouvelle(s)`}>
                <Bell size={19} />
                {count > 0 && <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-[#FF6EA9] text-white text-[11px] flex items-center justify-center ring-2 ring-white">{count}</span>}
            </button>
            {open && (
                <div className="dash-pop-in absolute right-0 mt-2 w-80 max-sm:fixed max-sm:inset-x-4 max-sm:top-16 max-sm:w-auto bg-[#FFFDF9] rounded-2xl border border-[#EDE6DC] shadow-2xl overflow-hidden z-[80]">
                    <div className="px-4 py-3 border-b border-[#F1ECE4]"><p className="font-serif text-[#1F1B16]">Vos demandes d’export</p></div>
                    {!data?.items?.length ? (
                        <p className="px-4 py-6 text-sm text-[#7A6E62] text-center">Aucune décision récente.</p>
                    ) : (
                        <ul className="max-h-80 overflow-y-auto py-1">
                            {data.items.map((n) => (
                                <li key={n.id}>
                                    <button onClick={() => { setOpen(false); onOpenExports(); }} className="w-full text-left px-4 py-3 hover:bg-[#F6F1EA] flex gap-3">
                                        {n.status === "approved" ? <CheckCircle2 size={18} className="text-[#3F6B45] shrink-0" /> : <XCircle size={18} className="text-[#9B2C2C] shrink-0" />}
                                        <span className="min-w-0">
                                            <span className="block text-sm text-[#1F1B16] truncate">{n.title}</span>
                                            <span className="block text-xs text-[#9A8E80]">Export {n.status === "approved" ? "accepté" : "refusé"} · {dateTime(n.decided_at)}</span>
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

function Avatar({ sponsor }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const router = useRouter();
    const { logout } = useAuthContext() || {};
    useClickOutside(ref, () => setOpen(false));
    const signOut = async () => {
        try { await logout?.(); } catch { localStorage.removeItem("token"); }
        router.push("/login");
    };
    return (
        <div ref={ref} className="relative">
            <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-3 pl-1 pr-1 md:pr-3 py-1 rounded-2xl hover:bg-[#F6F1EA]" aria-haspopup="menu" aria-expanded={open}>
                <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3B342D] to-[#1F1B16] text-white text-sm font-semibold flex items-center justify-center">{initials(sponsor?.name)}</span>
                <span className="hidden md:block text-left">
                    <span className="block text-sm text-[#1F1B16] max-w-[160px] truncate">{sponsor?.name}</span>
                    <span className="block text-xs text-[#9A8E80]">Sponsor</span>
                </span>
            </button>
            {open && (
                <div role="menu" className="dash-pop-in absolute right-0 mt-2 w-60 bg-[#FFFDF9] rounded-2xl border border-[#EDE6DC] shadow-2xl overflow-hidden z-[80] py-1">
                    <p className="px-4 py-3 text-xs text-[#9A8E80] truncate border-b border-[#F1ECE4]">{sponsor?.email}</p>
                    <button role="menuitem" onClick={signOut} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-[#9B2C2C] hover:bg-[#F6F1EA]"><LogOut size={16} /> Déconnexion</button>
                </div>
            )}
        </div>
    );
}

export default function SponsorShell({ sponsor, view, viewKey, onView, search, onSearch, notifications, children }) {
    const menu = SPONSOR_MENU.map((m) => ({ ...m, badge: m.key === "exports" ? notifications?.count || 0 : 0 }));
    return (
        <DashboardFrame
            space="Espace sponsor"
            identity={{ name: sponsor?.name, detail: sponsor?.email }}
            menu={menu}
            active={view === "campaign" ? "campaigns" : view}
            onView={onView}
            viewKey={viewKey || view}
            storageKey="edoto:sponsor-sidebar"
            footerText="E·Doto Family — Espace sponsor"
            search={
                <div className="relative flex-1 min-w-0 max-w-xl">
                    <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A8E80]" aria-hidden="true" />
                    <input type="search" value={search} onChange={(e) => onSearch(e.target.value)} placeholder="Rechercher une campagne ou une ville…" aria-label="Rechercher une campagne"
                        className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#F6F1EA] border border-transparent focus:bg-white focus:border-[#E4DBCE] text-sm text-[#1F1B16] placeholder:text-[#9A8E80] focus:outline-none focus:ring-2 focus:ring-[#FF6EA9]/25 transition" />
                </div>
            }
            actions={<><Bellmenu data={notifications} onOpenExports={() => onView("exports")} /><Avatar sponsor={sponsor} /></>}
        >
            {children}
        </DashboardFrame>
    );
}
