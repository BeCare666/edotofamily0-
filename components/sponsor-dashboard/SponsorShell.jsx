"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { Home, Megaphone, FileSpreadsheet, Search, Bell, LogOut, CheckCircle2, XCircle, Radio, Activity, MapPin, Building2, Send, Building, Clock } from "lucide-react";
import { useAuthContext } from "../../context/AuthContext";
import { dateTime } from "../pickup-dashboard/api";
import DashboardFrame from "../dashboard-ui/DashboardFrame";
import { avatarUrl as avatarOf } from "../profile/ProfilePhoto";

export const SPONSOR_MENU = [
    { key: "home", label: "Accueil", icon: Home },
    { key: "live", label: "Carte en direct", icon: Radio },
    { key: "campaigns", label: "Mes campagnes", icon: Megaphone },
    { key: "activity", label: "Activité", icon: Activity },
    { key: "points", label: "Points de retrait", icon: MapPin },
    { key: "cities", label: "Villes", icon: Building2 },
    { key: "proposals", label: "Demandes de campagne", icon: Send },
    { key: "exports", label: "Exports", icon: FileSpreadsheet },
    { key: "profile", label: "Mon organisation", icon: Building },
];

function useClickOutside(ref, onOutside) {
    useEffect(() => {
        const h = (e) => ref.current && !ref.current.contains(e.target) && onOutside();
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, [ref, onOutside]);
}

const initials = (n) => String(n || "?").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("") || "?";

function Bellmenu({ data, onOpenExports, onOpenProposals }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useClickOutside(ref, () => setOpen(false));
    const count = data?.count || 0;
    return (
        <div ref={ref} className="relative">
            <button onClick={() => setOpen((v) => !v)} className="relative w-11 h-11 rounded-2xl bg-[#F3F1EE] hover:bg-[#ECE9E4] transition flex items-center justify-center text-[#3D3934]" aria-label={`Notifications : ${count} nouvelle(s)`}>
                <Bell size={19} />
                {count > 0 && <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-[#FF6EA9] text-white text-[11px] flex items-center justify-center ring-2 ring-white">{count}</span>}
            </button>
            {open && (
                <div className="dash-pop-in absolute right-0 mt-2 w-80 max-sm:fixed max-sm:inset-x-4 max-sm:top-16 max-sm:w-auto bg-[#FFFFFF] rounded-2xl border border-[#E9E5DF] shadow-[0_12px_32px_-12px_rgba(26,24,20,0.18)] overflow-hidden z-[80]">
                    <div className="px-4 py-3 border-b border-[#EFECE7]"><p className="font-serif text-[#1A1814]">Vos demandes</p></div>
                    {!data?.items?.length ? (
                        <p className="px-4 py-6 text-sm text-[#6B655D] text-center">Aucune décision récente.</p>
                    ) : (
                        <ul className="max-h-80 overflow-y-auto py-1">
                            {data.items.map((n) => (
                                <li key={n.id}>
                                    <button onClick={() => { setOpen(false); if (n.kind === "proposal") onOpenProposals(); else onOpenExports(); }} className="w-full text-left px-4 py-3 hover:bg-[#F3F1EE] flex gap-3">
                                        {n.status === "rejected" ? <XCircle size={18} className="text-[#9B2C2C] shrink-0" /> : n.status === "pending" ? <Clock size={18} className="text-[#9A5B13] shrink-0" /> : <CheckCircle2 size={18} className="text-[#3F6B45] shrink-0" />}
                                        <span className="min-w-0">
                                            <span className="block text-sm text-[#1A1814] truncate">{n.title}</span>
                                            <span className="block text-xs text-[#8A837A]">
                                                {n.kind === "proposal" ? `Demande de campagne : ${String(n.status_label || "").toLowerCase()}` : `Export ${n.status === "approved" ? "accepté" : "refusé"}`} · {dateTime(n.decided_at)}
                                            </span>
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

function Avatar({ sponsor, onProfile }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const router = useRouter();
    const auth = useAuthContext() || {};
    const { logout } = auth;
    useClickOutside(ref, () => setOpen(false));
    const signOut = async () => {
        try { await logout?.(); } catch { localStorage.removeItem("token"); }
        router.push("/login");
    };
    return (
        <div ref={ref} className="relative">
            <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-3 pl-1 pr-1 md:pr-3 py-1 rounded-2xl hover:bg-[#F3F1EE]" aria-haspopup="menu" aria-expanded={open}>
                {avatarOf(auth?.user) ? (
                    <img src={avatarOf(auth.user)} alt="" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                    <span className="w-10 h-10 rounded-full bg-[#1A1814] text-white text-sm font-semibold flex items-center justify-center">{initials(sponsor?.name)}</span>
                )}
                <span className="hidden md:block text-left">
                    <span className="block text-sm text-[#1A1814] max-w-[160px] truncate">{sponsor?.name}</span>
                    <span className="block text-xs text-[#8A837A]">Sponsor</span>
                </span>
            </button>
            {open && (
                <div role="menu" className="dash-pop-in absolute right-0 mt-2 w-60 bg-[#FFFFFF] rounded-2xl border border-[#E9E5DF] shadow-[0_12px_32px_-12px_rgba(26,24,20,0.18)] overflow-hidden z-[80] py-1">
                    <p className="px-4 py-3 text-xs text-[#8A837A] truncate border-b border-[#EFECE7]">{sponsor?.email}</p>
                    <button role="menuitem" onClick={() => { setOpen(false); onProfile(); }} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-[#1A1814] hover:bg-[#F3F1EE]"><Building size={16} /> Mon organisation</button>
                    <button role="menuitem" onClick={signOut} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-[#9B2C2C] hover:bg-[#F3F1EE]"><LogOut size={16} /> Déconnexion</button>
                </div>
            )}
        </div>
    );
}

export default function SponsorShell({ sponsor, view, viewKey, onView, search, onSearch, notifications, children }) {
    const menu = SPONSOR_MENU.map((m) => ({
        ...m,
        badge: m.key === "exports" ? notifications?.exports_count ?? notifications?.count ?? 0 : m.key === "proposals" ? notifications?.proposals_count || 0 : 0,
    }));
    return (
        <DashboardFrame
            space="Espace sponsor"
            identity={{ name: sponsor?.name, detail: sponsor?.email }}
            menu={menu}
            active={view === "campaign" ? "campaigns" : view}
            onView={onView}
            viewKey={viewKey || view}
            storageKey="edoto:sponsor-sidebar"
            footerText="E.doto family · Espace sponsor"
            search={
                <div className="relative flex-1 min-w-0 max-w-xl">
                    <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A837A]" aria-hidden="true" />
                    <input type="search" value={search} onChange={(e) => onSearch(e.target.value)} placeholder="Rechercher une campagne ou une ville…" aria-label="Rechercher une campagne"
                        className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#F3F1EE] border border-transparent focus:bg-white focus:border-[#E0DBD4] text-sm text-[#1A1814] placeholder:text-[#8A837A] focus:outline-none focus:ring-2 focus:ring-[#FF6EA9]/25 transition" />
                </div>
            }
            actions={<><Bellmenu data={notifications} onOpenExports={() => onView("exports")} onOpenProposals={() => onView("proposals")} /><Avatar sponsor={sponsor} onProfile={() => onView("profile")} /></>}
        >
            {children}
        </DashboardFrame>
    );
}
