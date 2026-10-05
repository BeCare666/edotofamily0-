"use client";
import React from "react";
import { User, ShoppingBag, Star, LogOut } from "lucide-react";

// Avatar du compte connecté : même présentation que les dashboards admin / point de retrait
// (photo ou initiales, sans nom à côté). Le clic ouvre les informations ; clic à l'extérieur ou Échap = fermeture.
const initials = (n?: string | null) =>
    String(n || "?").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("") || "?";

interface Props {
    user: any;
    onNavigate: (path: string) => void;
    onLogout: () => void;
    /** Avatar rond (en-tête mobile) */
    round?: boolean;
}

export default function UserAvatarMenu({ user, onNavigate, onLogout, round = false }: Props) {
    const [open, setOpen] = React.useState(false);
    const ref = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (!open) return;
        const onDown = (e: MouseEvent | TouchEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
        document.addEventListener("mousedown", onDown);
        document.addEventListener("touchstart", onDown);
        window.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDown);
            document.removeEventListener("touchstart", onDown);
            window.removeEventListener("keydown", onKey);
        };
    }, [open]);

    const go = (path: string) => {
        setOpen(false);
        onNavigate(path);
    };
    const avatar = user?.profile?.avatar?.url;
    const isPickup = user?.role === "super_pickuppoint";
    const item = "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-[#3B342D] hover:bg-[#F6F1EA] hover:text-[#1F1B16] transition";

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen((v) => !v)}
                className={`block ${round ? "rounded-full ring-2 ring-white shadow-[0_4px_14px_-4px_rgba(194,24,91,0.45)]" : "rounded-xl"} transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6EA9]/50 focus-visible:ring-offset-2`}
                aria-haspopup="menu"
                aria-expanded={open}
                aria-label="Mon compte"
            >
                {avatar ? (
                    <img src={avatar} alt="" className={`w-10 h-10 ${round ? "rounded-full" : "rounded-xl"} object-cover`} />
                ) : (
                    <span className={`w-10 h-10 ${round ? "rounded-full" : "rounded-xl"} bg-gradient-to-br from-[#FF6EA9] to-[#C2185B] text-white text-sm font-semibold flex items-center justify-center`}>
                        {initials(user?.name)}
                    </span>
                )}
            </button>

            {open && (
                <div role="menu" className="dash-pop-in absolute right-0 mt-2 w-64 max-w-[calc(100vw-2rem)] bg-[#FFFDF9] rounded-2xl border border-[#EDE6DC] shadow-2xl overflow-hidden z-[80] p-1.5">
                    <div className="flex items-center gap-3 px-3 py-3 mb-1 rounded-xl bg-[#F6F1EA]">
                        {avatar ? (
                            <img src={avatar} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0" />
                        ) : (
                            <span className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-[#FF6EA9] to-[#C2185B] text-white text-sm font-semibold flex items-center justify-center">
                                {initials(user?.name)}
                            </span>
                        )}
                        <span className="min-w-0">
                            <span className="block text-sm text-[#1F1B16] truncate">{user?.name || "Mon espace"}</span>
                            <span className="block text-xs text-[#9A8E80] truncate">{user?.email}</span>
                        </span>
                    </div>
                    <button role="menuitem" onClick={() => go("/profile")} className={item}><User size={16} /> Profil</button>
                    <button role="menuitem" onClick={() => go("/orders")} className={item}><ShoppingBag size={16} /> Commandes</button>
                    {isPickup ? (
                        <button role="menuitem" onClick={() => go("/pickup-dashboard-for-orders")} className={item}><Star size={16} /> Dashboard</button>
                    ) : (
                        <button role="menuitem" onClick={() => go("/devenir-point-de-retrait")} className={item}><Star size={16} /> Devenir Point de Retrait</button>
                    )}
                    <div className="my-1 border-t border-[#F1ECE4]" />
                    <button
                        role="menuitem"
                        onClick={() => { setOpen(false); onLogout(); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-[#9B2C2C] hover:bg-[#F6F1EA] transition"
                    >
                        <LogOut size={16} /> Déconnexion
                    </button>
                </div>
            )}
        </div>
    );
}
