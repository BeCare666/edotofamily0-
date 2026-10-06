"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Menu, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";

const initials = (n) => String(n || "?").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("") || "?";

// Barre latérale réductible (ordinateur) : choix mémorisé dans ce navigateur seulement
function useCollapsed(storageKey) {
    const [collapsed, setCollapsed] = useState(false);
    useEffect(() => {
        try { setCollapsed(localStorage.getItem(storageKey) === "1"); } catch { }
    }, [storageKey]);
    const toggle = () => setCollapsed((v) => {
        try { localStorage.setItem(storageKey, v ? "0" : "1"); } catch { }
        return !v;
    });
    return [collapsed, toggle];
}

/**
 * Cadre commun des dashboards (point de retrait, sponsor) :
 * barre latérale (tiroir sur mobile, réductible en icônes sur ordinateur), en-tête (recherche, cloche, avatar),
 * transition à chaque changement de vue, pied de page fixe.
 */
export default function DashboardFrame({ space, identity, menu, active, onView, search, actions, footerText, viewKey, storageKey, children }) {
    const [open, setOpen] = useState(false);
    const [collapsed, toggleCollapsed] = useCollapsed(storageKey);

    // Tiroir mobile : Échap pour fermer, page figée derrière
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => e.key === "Escape" && setOpen(false);
        window.addEventListener("keydown", onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = prev;
        };
    }, [open]);

    const c = collapsed;
    const offset = c ? "lg:pl-[88px]" : "lg:pl-72";

    return (
        <div className="min-h-screen bg-[#FAF7F2]">
            <div
                className={`fixed inset-0 z-[60] bg-[#1F1B16]/40 backdrop-blur-[2px] lg:hidden transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                onClick={() => setOpen(false)}
                aria-hidden="true"
            />
            <aside
                className={`fixed z-[70] inset-y-0 left-0 w-72 max-w-[85vw] ${c ? "lg:w-[88px]" : "lg:w-72"} bg-[#1F1B16] text-[#EDE6DC] flex flex-col transition-[transform,width] duration-300 ease-out lg:translate-x-0 ${open ? "translate-x-0 shadow-2xl" : "-translate-x-full"}`}
                aria-label={`Navigation : ${space}`}
            >
                <div className={`pt-8 pb-6 flex items-center justify-between px-7 ${c ? "lg:px-0 lg:justify-center" : ""}`}>
                    <div className={c ? "lg:hidden" : ""}>
                        <p className="font-serif text-2xl tracking-tight text-white">E.doto family</p>
                        <p className="text-[11px] uppercase tracking-[0.25em] text-[#B8AC9E] mt-1">{space}</p>
                    </div>
                    <p className={`hidden font-serif text-2xl text-white ${c ? "lg:block" : ""}`} aria-hidden="true">E.</p>
                    <button onClick={() => setOpen(false)} className="lg:hidden p-2 rounded-full hover:bg-white/10" aria-label="Fermer le menu"><X size={18} /></button>
                </div>

                <div className={`mx-5 mb-6 p-4 rounded-2xl bg-white/[0.06] border border-white/10 ${c ? "lg:mx-auto lg:w-fit lg:p-0 lg:border-0 lg:bg-transparent" : ""}`}>
                    <div className={c ? "lg:hidden" : ""}>
                        <p className="text-sm text-white truncate">{identity?.name}</p>
                        <p className="text-xs text-[#B8AC9E] truncate mt-0.5">{identity?.detail}</p>
                    </div>
                    <span className={`hidden w-11 h-11 rounded-2xl bg-white/10 text-white text-sm font-semibold items-center justify-center ${c ? "lg:flex" : ""}`} title={identity?.name}>
                        {initials(identity?.name)}
                    </span>
                </div>

                <nav className={`flex-1 px-4 space-y-1 ${c ? "lg:px-3" : ""}`}>
                    {menu.map((m) => {
                        const Icon = m.icon;
                        const isActive = active === m.key;
                        return (
                            <button
                                key={m.key}
                                onClick={() => { onView(m.key); setOpen(false); }}
                                aria-current={isActive ? "page" : undefined}
                                aria-label={c ? m.label : undefined}
                                className={`group relative w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm transition-colors duration-200 ${c ? "lg:justify-center lg:px-0" : ""} ${isActive ? "bg-[#FFFDF9] text-[#1F1B16] shadow-lg" : "text-[#D8CFC3] hover:bg-white/[0.06] hover:text-white"}`}
                            >
                                <Icon size={18} className={`shrink-0 ${isActive ? "text-[#C2185B]" : ""}`} />
                                <span className={`flex-1 text-left ${c ? "lg:hidden" : ""}`}>{m.label}</span>
                                {m.badge > 0 && (
                                    <>
                                        <span className={`text-[11px] px-2 py-0.5 rounded-full ${c ? "lg:hidden" : ""} ${isActive ? "bg-[#FCE8F0] text-[#C2185B]" : "bg-[#FF6EA9] text-white"}`}>{m.badge > 99 ? "99+" : m.badge}</span>
                                        <span className={`hidden absolute top-2 right-5 w-2 h-2 rounded-full bg-[#FF6EA9] ring-2 ring-[#1F1B16] ${c ? "lg:block" : ""}`} />
                                    </>
                                )}
                                {c && (
                                    <span className="hidden lg:block pointer-events-none absolute left-full ml-4 px-3 py-1.5 rounded-xl bg-[#FFFDF9] text-[#1F1B16] text-xs font-medium whitespace-nowrap shadow-xl border border-[#EDE6DC] opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100 group-focus-visible:translate-x-0 transition duration-150">
                                        {m.label}{m.badge > 0 ? ` · ${m.badge}` : ""}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>

                <div className={`p-5 space-y-1 ${c ? "lg:px-3" : ""}`}>
                    <Link href="/" title={c ? "Retour au site" : undefined} className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm text-[#B8AC9E] hover:text-white hover:bg-white/[0.06] transition-colors ${c ? "lg:justify-center lg:px-0" : ""}`}>
                        <ArrowLeft size={16} className="shrink-0" /> <span className={c ? "lg:hidden" : ""}>Retour au site</span>
                    </Link>
                    <button onClick={toggleCollapsed} aria-label={c ? "Déplier la barre latérale" : "Réduire la barre latérale"} title={c ? "Déplier" : "Réduire"}
                        className={`hidden lg:flex w-full items-center gap-2 px-4 py-3 rounded-2xl text-sm text-[#B8AC9E] hover:text-white hover:bg-white/[0.06] transition-colors ${c ? "justify-center px-0" : ""}`}>
                        {c ? <PanelLeftOpen size={16} /> : <><PanelLeftClose size={16} /> Réduire</>}
                    </button>
                </div>
            </aside>

            <div className={`${offset} transition-[padding] duration-300 ease-out`}>
                <header className="sticky top-0 z-50 bg-[#FAF7F2]/85 backdrop-blur-xl border-b border-[#EDE6DC]">
                    <div className="px-4 sm:px-8 py-3 sm:py-0 sm:h-20 flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-5">
                        <button onClick={() => setOpen(true)} className="lg:hidden w-11 h-11 shrink-0 rounded-2xl bg-[#F6F1EA] flex items-center justify-center text-[#3B342D]" aria-label="Ouvrir le menu" aria-expanded={open}><Menu size={20} /></button>
                        <p className="sm:hidden font-serif text-xl text-[#1F1B16]">E.doto family</p>
                        {/* Mobile : la recherche passe sur une 2e ligne, pleine largeur */}
                        <div className="order-last basis-full sm:order-none sm:basis-auto sm:flex-1 flex min-w-0">{search}</div>
                        <div className="ml-auto flex items-center gap-2 sm:gap-3">{actions}</div>
                    </div>
                </header>
                <main className="px-4 sm:px-8 pt-6 sm:pt-8 pb-28">
                    <div key={viewKey} className="dash-view-in">{children}</div>
                </main>
                <footer
                    className={`fixed bottom-0 right-0 left-0 ${c ? "lg:left-[88px]" : "lg:left-72"} transition-[left] duration-300 ease-out z-40 min-h-[3.5rem] px-4 sm:px-8 flex items-center justify-between gap-3 text-xs text-[#9A8E80] bg-[#FAF7F2]/90 backdrop-blur border-t border-[#EDE6DC]`}
                    style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
                >
                    <span className="truncate">© {new Date().getFullYear()} {footerText}</span>
                    <Link href="/contact" className="shrink-0 hover:text-[#1F1B16]">Besoin d’aide ?</Link>
                </footer>
            </div>
        </div>
    );
}
