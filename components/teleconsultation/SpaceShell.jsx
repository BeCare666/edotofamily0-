"use client";

import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { useAuthContext } from "../../context/AuthContext";
import DashboardFrame from "../dashboard-ui/DashboardFrame";
import UserAvatarMenu from "../UserAvatarMenu";
import SiteNotificationBell from "../mobile/SiteNotificationBell";

// Cadre des espaces de la téléconsultation (19/10/2026) : jeune, médecin, centre.
// Même présentation que les espaces sponsor et point de retrait (DashboardFrame).
// 21/10/2026 : avatar et cloche identiques à l'en-tête du site (mobile : cloche + avatar rond ; ordinateur : avatar).
function SiteAccount() {
    const router = useRouter();
    const { user, logout } = useAuthContext() || {};
    if (!user) return null;
    const onLogout = async () => {
        try {
            await logout?.();
            toast.success("Déconnexion réussie 👋");
        } catch {
            try { localStorage.removeItem("token"); } catch { }
        }
        router.push("/");
    };
    const go = (path) => router.push(path);
    return (
        <>
            <div className="flex items-center gap-2.5 md:hidden">
                <SiteNotificationBell />
                <UserAvatarMenu round user={user} onNavigate={go} onLogout={onLogout} />
            </div>
            <div className="hidden md:block">
                <UserAvatarMenu user={user} onNavigate={go} onLogout={onLogout} />
            </div>
        </>
    );
}

export default function SpaceShell({ space, identity, menu, view, onView, viewKey, storageKey, search, extraActions, siteNav = false, children }) {
    return (
        <DashboardFrame
            space={space}
            identity={identity}
            menu={menu}
            active={view}
            onView={onView}
            viewKey={viewKey || view}
            storageKey={storageKey}
            siteNav={siteNav}
            footerText={`E.doto family · ${space}`}
            search={search ?? <div />}
            actions={<>{extraActions}<SiteAccount /></>}
        >
            {children}
        </DashboardFrame>
    );
}
