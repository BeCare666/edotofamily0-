"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import DrawerMenu from "../DrawerMenu";
import { CampaignNavIcon, HomeNavIcon, MenuNavIcon, ProductsNavIcon } from "./navIcons";

// Barre de navigation mobile (sous md) : Accueil, Produits, Campagnes, Menu.
// Le point « en direct » sur Campagnes vient de l'API (GET /campaigns/active/count) : il n'apparaît
// que si au moins une campagne est réellement en cours (statut calculé par dates, heure du Bénin).
const API = process.env.NEXT_PUBLIC_REST_API_ENDPOINT;
const REFRESH_MS = 5 * 60 * 1000;

export default function MobileBottomNav() {
  const pathname = usePathname() || "";
  const [menuOpen, setMenuOpen] = useState(false);
  const [liveCount, setLiveCount] = useState(0);

  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch(`${API}/campaigns/active/count`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => alive && setLiveCount(Number(d?.total ?? 0)))
        .catch(() => alive && setLiveCount(0));
    load();
    const id = setInterval(load, REFRESH_MS);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  // Fermer le menu quand la page change
  useEffect(() => setMenuOpen(false), [pathname]);

  const items = [
    { key: "home", label: "Accueil", href: "/", icon: HomeNavIcon, active: pathname === "/" },
    {
      key: "products",
      label: "Produits",
      href: "/category/categories_id=all",
      icon: ProductsNavIcon,
      active: pathname.startsWith("/category") || pathname.startsWith("/product"),
    },
    {
      key: "campaigns",
      label: "Campagnes",
      href: "/campaigns",
      icon: CampaignNavIcon,
      active: pathname.toLowerCase().startsWith("/campaigns"),
      live: liveCount > 0,
    },
  ];

  return (
    <>
      {/* Réserve la hauteur de la barre pour que le bas des pages reste lisible */}
      <div aria-hidden className="h-[calc(4.5rem+env(safe-area-inset-bottom))] md:hidden" />

      <nav
        aria-label="Navigation principale"
        className="fixed inset-x-0 bottom-0 z-[28] w-full border-t border-[#E9E5DF] bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
      >
        {/* Pleine largeur, collée en bas, sans coins arrondis (16/10/2026) */}
        <div className="relative w-full">
          <div className="relative grid grid-cols-4 items-stretch px-1.5 py-1.5">
            {items.map((it) => (
              <Link
                key={it.key}
                href={it.href}
                aria-current={it.active ? "page" : undefined}
                className="relative flex flex-col items-center justify-center gap-1 rounded-[20px] py-2 outline-none focus-visible:ring-2 focus-visible:ring-[#FF6EA9]/40"
              >
                {it.active && (
                  <motion.span
                    layoutId="mobile-nav-active"
                    className="absolute inset-0 rounded-[20px] bg-[#FBEEF3]"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="relative">
                  <it.icon
                    filled={it.active}
                    className={`h-[23px] w-[23px] transition-colors ${it.active ? "text-[#E0457F]" : "text-slate-500"}`}
                  />
                  {it.live && (
                    <span className="absolute -right-1.5 -top-1 flex h-3 w-3" aria-hidden>
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22C55E] opacity-60" />
                      <span className="relative inline-flex h-3 w-3 rounded-full bg-[#22C55E] ring-2 ring-white" />
                    </span>
                  )}
                </span>
                <span className={`relative text-[10.5px] font-semibold tracking-wide ${it.active ? "text-[#C2185B]" : "text-slate-500"}`}>
                  {it.label}
                </span>
                {it.live && (
                  <span className="sr-only">
                    {liveCount} campagne{liveCount > 1 ? "s" : ""} en cours
                  </span>
                )}
              </Link>
            ))}

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Ouvrir le menu"
              aria-expanded={menuOpen}
              className="relative flex flex-col items-center justify-center gap-1 rounded-[20px] py-2 outline-none focus-visible:ring-2 focus-visible:ring-[#FF6EA9]/40"
            >
              {menuOpen && <span className="absolute inset-0 rounded-[20px] bg-[#FBEEF3]" />}
              <MenuNavIcon filled={menuOpen} className={`relative h-[23px] w-[23px] ${menuOpen ? "text-[#E0457F]" : "text-slate-500"}`} />
              <span className={`relative text-[10.5px] font-semibold tracking-wide ${menuOpen ? "text-[#C2185B]" : "text-slate-500"}`}>Menu</span>
            </button>
          </div>
        </div>
      </nav>

      <DrawerMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
