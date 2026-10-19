"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import BrandMark from "../BrandMark";
import emblem from "../../public/logo/favicon.png";
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
// siteNav : la barre mobile du site (Accueil, Produits, Campagnes, Menu) s'affiche en bas sur mobile ;
// le pied de page du dashboard passe alors sur ordinateur seulement (dashboard jeune, 19/10/2026).
export default function DashboardFrame({ space, identity, menu, active, onView, search, actions, footerText, viewKey, storageKey, siteNav = false, children }) {
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
        <div className="min-h-screen bg-[#F9F8F6]">
            <div
                className={`fixed inset-0 z-[60] bg-[#1A1814]/30 backdrop-blur-[2px] lg:hidden transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                onClick={() => setOpen(false)}
                aria-hidden="true"
            />
            <aside
                className={`fixed z-[70] inset-y-0 left-0 w-72 max-w-[85vw] ${c ? "lg:w-[88px]" : "lg:w-72"} bg-white text-[#3D3934] border-r border-[#E9E5DF] flex flex-col transition-[transform,width] duration-300 ease-out lg:translate-x-0 ${open ? "translate-x-0 shadow-[0_12px_32px_-12px_rgba(26,24,20,0.18)]" : "-translate-x-full"}`}
                aria-label={`Navigation : ${space}`}
            >
                {/* Logo : même disposition que l'en-tête du site (BrandMark), 19/10/2026 */}
                <div className={`h-20 shrink-0 flex items-center justify-between px-6 ${c ? "lg:px-0 lg:justify-center" : ""}`}>
                    <Link href="/" aria-label="E.doto family, retour au site" className={c ? "lg:hidden" : ""}>
                        <BrandMark />
                    </Link>
                    <Link href="/" aria-label="E.doto family, retour au site" className={`hidden ${c ? "lg:block" : ""}`}>
                        <span className="relative block h-10 w-10">
                            <Image src={emblem} alt="" fill sizes="40px" className="object-contain" />
                        </span>
                    </Link>
                    <button onClick={() => setOpen(false)} className="lg:hidden p-2 rounded-full text-[#8A837A] hover:bg-[#F3F1EE] hover:text-[#1A1814]" aria-label="Fermer le menu"><X size={18} /></button>
                </div>

                <p className={`px-6 -mt-1 mb-3 text-[10px] font-medium uppercase tracking-[0.22em] text-[#A8A29A] ${c ? "lg:hidden" : ""}`}>{space}</p>
                <div className={`mx-4 mb-4 mt-1 px-3 py-2.5 rounded-xl bg-[#F9F8F6] border border-[#EFECE7] ${c ? "lg:mx-auto lg:w-fit lg:p-0 lg:border-0 lg:bg-transparent" : ""}`}>
                    <div className={`flex items-center gap-3 ${c ? "lg:hidden" : ""}`}>
                        <span className="w-9 h-9 shrink-0 rounded-full bg-[#1A1814] text-white text-xs font-semibold flex items-center justify-center">{initials(identity?.name)}</span>
                        <div className="min-w-0">
                            <p className="text-[13px] font-medium text-[#1A1814] truncate">{identity?.name}</p>
                            <p className="text-[11.5px] text-[#8A837A] truncate mt-0.5">{identity?.detail}</p>
                        </div>
                    </div>
                    <span className={`hidden w-10 h-10 rounded-full bg-[#1A1814] text-white text-[13px] font-semibold items-center justify-center ${c ? "lg:flex" : ""}`} title={identity?.name}>
                        {initials(identity?.name)}
                    </span>
                </div>

                <nav className={`flex-1 min-h-0 overflow-y-auto px-3 space-y-0.5 ${c ? "lg:px-3 lg:overflow-visible" : ""}`}>
                    {menu.map((m) => {
                        const Icon = m.icon;
                        const isActive = active === m.key;
                        return (
                            <button
                                key={m.key}
                                onClick={() => { onView(m.key); setOpen(false); }}
                                aria-current={isActive ? "page" : undefined}
                                aria-label={c ? m.label : undefined}
                                className={`group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] transition-colors duration-200 ${c ? "lg:justify-center lg:px-0" : ""} ${isActive ? "bg-[#FBEEF3] text-[#A0124A] font-medium" : "text-[#57524B] hover:bg-[#F6F5F2] hover:text-[#1A1814]"}`}
                            >
                                <Icon size={18} strokeWidth={1.8} className={`shrink-0 transition-colors ${isActive ? "text-[#C2185B]" : "text-[#8A837A] group-hover:text-[#1A1814]"}`} />
                                <span className={`flex-1 text-left ${c ? "lg:hidden" : ""}`}>{m.label}</span>
                                {m.badge > 0 && (
                                    <>
                                        <span className={`text-[11px] px-2 py-0.5 rounded-full ${c ? "lg:hidden" : ""} ${isActive ? "bg-white text-[#C2185B]" : "bg-[#C2185B] text-white"}`}>{m.badge > 99 ? "99+" : m.badge}</span>
                                        <span className={`hidden absolute top-2 right-5 w-2 h-2 rounded-full bg-[#C2185B] ring-2 ring-white ${c ? "lg:block" : ""}`} />
                                    </>
                                )}
                                {c && (
                                    <span className="hidden lg:block pointer-events-none absolute left-full ml-4 px-3 py-1.5 rounded-lg bg-[#1A1814] text-white text-xs font-medium whitespace-nowrap opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100 group-focus-visible:translate-x-0 transition duration-150">
                                        {m.label}{m.badge > 0 ? ` · ${m.badge}` : ""}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>

                <div className={`p-3 space-y-0.5 border-t border-[#EFECE7] ${c ? "lg:px-3" : ""}`}>
                    <Link href="/" title={c ? "Retour au site" : undefined} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-[13px] text-[#6B655D] hover:text-[#1A1814] hover:bg-[#F6F5F2] transition-colors ${c ? "lg:justify-center lg:px-0" : ""}`}>
                        <ArrowLeft size={16} className="shrink-0" /> <span className={c ? "lg:hidden" : ""}>Retour au site</span>
                    </Link>
                    <button onClick={toggleCollapsed} aria-label={c ? "Déplier la barre latérale" : "Réduire la barre latérale"} title={c ? "Déplier" : "Réduire"}
                        className={`hidden lg:flex w-full items-center gap-2 px-3 py-2.5 rounded-lg text-[13px] text-[#6B655D] hover:text-[#1A1814] hover:bg-[#F6F5F2] transition-colors ${c ? "justify-center px-0" : ""}`}>
                        {c ? <PanelLeftOpen size={16} /> : <><PanelLeftClose size={16} /> Réduire</>}
                    </button>
                </div>
            </aside>

            <div className={`${offset} transition-[padding] duration-300 ease-out`}>
                <header className="sticky top-0 z-50 bg-[#F9F8F6]/85 backdrop-blur-xl border-b border-[#E9E5DF]">
                    <div className="px-4 sm:px-8 py-3 sm:py-0 sm:h-20 flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-5">
                        <button onClick={() => setOpen(true)} className="lg:hidden w-11 h-11 shrink-0 rounded-xl bg-white border border-[#E9E5DF] flex items-center justify-center text-[#3D3934]" aria-label="Ouvrir le menu" aria-expanded={open}><Menu size={20} /></button>
                        <Link href="/" aria-label="E.doto family, retour au site" className="sm:hidden"><BrandMark /></Link>
                        {/* Mobile : la recherche passe sur une 2e ligne, pleine largeur */}
                        <div className="order-last basis-full sm:order-none sm:basis-auto sm:flex-1 flex min-w-0">{search}</div>
                        <div className="ml-auto flex items-center gap-2 sm:gap-3">{actions}</div>
                    </div>
                </header>
                <main className={`dash-content px-4 sm:px-8 pt-6 sm:pt-8 ${siteNav ? "pb-10 md:pb-28" : "pb-28"}`}>
                    <div key={viewKey} className="dash-view-in">{children}</div>
                </main>
                <footer
                    className={`fixed bottom-0 right-0 left-0 ${c ? "lg:left-[88px]" : "lg:left-72"} transition-[left] duration-300 ease-out z-40 min-h-[3.5rem] px-4 sm:px-8 ${siteNav ? "hidden md:flex" : "flex"} items-center justify-between gap-3 text-xs text-[#8A837A] bg-[#F9F8F6]/90 backdrop-blur border-t border-[#E9E5DF]`}
                    style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
                >
                    <span className="truncate">© {new Date().getFullYear()} {footerText}</span>
                    <Link href="/contact" className="shrink-0 hover:text-[#1A1814]">Besoin d’aide ?</Link>
                </footer>
            </div>
        </div>
    );
}
