"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { LogOut, User } from "lucide-react";
import { useAuthContext } from "../../context/AuthContext";
import DashboardFrame from "../dashboard-ui/DashboardFrame";
import { avatarUrl as avatarOf } from "../profile/ProfilePhoto";

// Cadre des espaces de la téléconsultation (19/10/2026) : jeune, médecin, centre.
// Même présentation que les espaces sponsor et point de retrait (DashboardFrame).
const initials = (n) => String(n || "?").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("") || "?";

function AvatarMenu({ name, email, roleLabel, showProfile }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const router = useRouter();
    const auth = useAuthContext() || {};
    useEffect(() => {
        if (!open) return;
        const h = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
        const k = (e) => e.key === "Escape" && setOpen(false);
        document.addEventListener("mousedown", h);
        window.addEventListener("keydown", k);
        return () => { document.removeEventListener("mousedown", h); window.removeEventListener("keydown", k); };
    }, [open]);
    const signOut = async () => {
        try { await auth.logout?.(); } catch { try { localStorage.removeItem("token"); } catch { } }
        router.push("/login");
    };
    const photo = avatarOf(auth?.user);
    return (
        <div ref={ref} className="relative">
            <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-3 rounded-2xl py-1 pl-1 pr-1 hover:bg-[#F3F1EE] md:pr-3" aria-haspopup="menu" aria-expanded={open}>
                {photo ? (
                    <img src={photo} alt="" className="h-10 w-10 rounded-xl object-cover" />
                ) : (
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1A1814] text-sm font-semibold text-white">{initials(name)}</span>
                )}
                <span className="hidden text-left md:block">
                    <span className="block max-w-[170px] truncate text-sm text-[#1A1814]">{name}</span>
                    <span className="block text-xs text-[#8A837A]">{roleLabel}</span>
                </span>
            </button>
            {open && (
                <div role="menu" className="dash-pop-in absolute right-0 z-[80] mt-2 w-60 overflow-hidden rounded-2xl border border-[#E9E5DF] bg-white py-1 shadow-[0_12px_32px_-12px_rgba(26,24,20,0.18)]">
                    <p className="truncate border-b border-[#EFECE7] px-4 py-3 text-xs text-[#8A837A]">{email}</p>
                    {showProfile && (
                        <button role="menuitem" onClick={() => router.push("/profile")} className="flex w-full items-center gap-2 px-4 py-3 text-sm text-[#1A1814] hover:bg-[#F3F1EE]"><User size={16} /> Mon profil</button>
                    )}
                    <button role="menuitem" onClick={signOut} className="flex w-full items-center gap-2 px-4 py-3 text-sm text-[#9B2C2C] hover:bg-[#F3F1EE]"><LogOut size={16} /> Déconnexion</button>
                </div>
            )}
        </div>
    );
}

export default function SpaceShell({ space, roleLabel, identity, menu, view, onView, viewKey, storageKey, search, extraActions, showProfile = true, children }) {
    return (
        <DashboardFrame
            space={space}
            identity={identity}
            menu={menu}
            active={view}
            onView={onView}
            viewKey={viewKey || view}
            storageKey={storageKey}
            footerText={`E.doto family · ${space}`}
            search={search ?? <div />}
            actions={<>{extraActions}<AvatarMenu name={identity?.name} email={identity?.detail} roleLabel={roleLabel} showProfile={showProfile} /></>}
        >
            {children}
        </DashboardFrame>
    );
}
