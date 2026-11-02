"use client";
import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { ArrowRight, ChevronDown, LayoutGrid, Mail, MapPin, Phone, Sparkles } from "lucide-react";
import { useAuthContext } from "../context/AuthContext";
import { useChatAI } from "../context/ChatAIContext";
import UserAvatarMenu from "./UserAvatarMenu";
import BrandMark from "./BrandMark";
import SiteNotificationBell from "./mobile/SiteNotificationBell";
import { UserRoundIcon } from "./mobile/navIcons";
import MenuSheet from "./nav/MenuSheet";
import SocialRow from "./nav/SocialRow";
import { telHref, useSiteInfo } from "../lib/siteInfo";
import {
    ALL_PRODUCTS_HREF, DISCOVER_LINKS, JOIN_LINKS, LEGAL_LINKS, categoryHref, categoryIcon, inLinks,
    useCategories, useLiveCampaigns,
} from "../lib/siteNav";

// En-tête du site (02/11/2026, maquette validée).
// PC (lg et plus) : Boutique (grand menu), Campagnes (point vert si une campagne est en cours), Contraception,
// E.doto family (Découvrir, Rejoindre, Légal, coordonnées) ; à droite Assistant SSR, cloche, compte.
// Tablette (md à lg) : Assistant SSR, cloche, compte et bouton Menu (même panneau que sur téléphone).
// Téléphone : cloche et compte ; la navigation est dans la barre du bas (MobileBottomNav).
// Transparente en haut de page, vitrée et resserrée après défilement.
type PanelId = "shop" | "about";
// Transtypage : types de React 19 et framer-motion 10 incompatibles sans lui (comme components/Footer.tsx)
const MotionDiv = motion.div as React.FC<any>;

const ABOUT_LINKS = [...DISCOVER_LINKS, ...JOIN_LINKS, ...LEGAL_LINKS];

export const Header: React.FC = () => {
    const router = useRouter();
    const pathname = usePathname() || "";
    const { user, logout } = useAuthContext();
    const { openChoice } = useChatAI();
    const categories = useCategories();
    const liveCount = useLiveCampaigns();
    const info = useSiteInfo();

    const [scrolled, setScrolled] = React.useState(false);
    const [panel, setPanel] = React.useState<PanelId | null>(null);
    const [sheetOpen, setSheetOpen] = React.useState(false);
    const [pill, setPill] = React.useState({ left: 0, width: 0, visible: false });
    const headerRef = React.useRef<HTMLElement>(null);
    const navRef = React.useRef<HTMLElement>(null);
    const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    React.useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 12);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Fermeture : changement de page, clic à côté, touche Échap
    React.useEffect(() => setPanel(null), [pathname]);
    React.useEffect(() => {
        if (!panel) return undefined;
        const onDown = (e: MouseEvent | TouchEvent) => {
            if (headerRef.current && !headerRef.current.contains(e.target as Node)) setPanel(null);
        };
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPanel(null);
        document.addEventListener("mousedown", onDown);
        document.addEventListener("touchstart", onDown);
        window.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDown);
            document.removeEventListener("touchstart", onDown);
            window.removeEventListener("keydown", onKey);
        };
    }, [panel]);
    React.useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

    // Ouverture au survol (souris seulement, avec un court délai) ou au clic
    const later = (fn: () => void, ms: number) => {
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(fn, ms);
    };
    const hoverOpen = (id: PanelId) => (e: React.PointerEvent) => { if (e.pointerType === "mouse") later(() => setPanel(id), 90); };
    const hoverClose = (e: React.PointerEvent) => { if (e.pointerType === "mouse") later(() => setPanel(null), 220); };
    const keepOpen = () => { if (timer.current) clearTimeout(timer.current); };
    const toggle = (id: PanelId) => { keepOpen(); setPanel((p) => (p === id ? null : id)); };

    // Pastille qui suit la souris dans la barre
    const movePill = (e: React.PointerEvent<HTMLElement>) => {
        const nav = navRef.current?.getBoundingClientRect();
        const r = e.currentTarget.getBoundingClientRect();
        if (nav) setPill({ left: r.left - nav.left, width: r.width, visible: true });
    };

    const handleLogout = async () => {
        try {
            await logout();
            toast.success("Déconnexion réussie 👋");
            router.push("/");
        } catch (error) {
            toast.error("Une erreur est survenue lors de la déconnexion");
        }
    };
    const handleLogin = () => {
        try { localStorage.setItem("redirect_after_login", window.location.pathname); } catch { }
        router.push("/login");
    };
    const closeSheet = React.useCallback(() => setSheetOpen(false), []);

    const active = {
        shop: pathname.startsWith("/category") || pathname.startsWith("/product"),
        campaigns: pathname.toLowerCase().startsWith("/campaigns"),
        contraception: pathname.startsWith("/contraception"),
        about: inLinks(pathname, ABOUT_LINKS),
    };

    const item = (on: boolean, open = false) =>
        `relative z-[1] inline-flex h-10 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-[14px] font-medium transition-colors xl:px-4 ${on ? "text-[#C2185B]" : open ? "text-[#1A1814]" : "text-[#4A443E] hover:text-[#1A1814]"}`;
    const dot = <span aria-hidden className="absolute bottom-0 left-1/2 h-[3px] w-[18px] -translate-x-1/2 rounded-full bg-[#C2185B]" />;
    const chevron = (open: boolean) => <ChevronDown size={14} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />;
    const eyebrow = "px-2.5 pb-1 pt-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-[#9A8E80]";
    const linkRow = (l: { label: string; href: string; icon: React.ElementType }) => {
        const Icon = l.icon;
        const current = pathname === l.href;
        return (
            <Link key={l.href} href={l.href} aria-current={current ? "page" : undefined}
                className={`group flex items-center gap-3 rounded-xl px-2.5 py-2.5 text-[14px] transition ${current ? "bg-[#FBEEF3] text-[#C2185B]" : "text-[#3E3832] hover:bg-[#F9F8F6] hover:text-[#1A1814]"}`}>
                <Icon size={17} className={`shrink-0 transition-colors ${current ? "text-[#C2185B]" : "text-[#9A8E80] group-hover:text-[#C2185B]"}`} />
                {l.label}
            </Link>
        );
    };
    const panelMotion = {
        initial: { opacity: 0, y: -6, scale: 0.985 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -4, scale: 0.99 },
        transition: { duration: 0.2, ease: [0.3, 0.7, 0.2, 1] },
    };
    const panelBox = "rounded-[22px] border border-[#E9E5DF] bg-white p-3.5 shadow-[0_30px_70px_-30px_rgba(26,24,20,0.35),0_2px_6px_rgba(26,24,20,0.04)]";

    return (
        <>
            <header
                ref={headerRef}
                className={`sticky top-0 z-40 w-full border-b transition-[background-color,box-shadow,border-color] duration-300 ${scrolled
                    ? "border-[#E9E5DF] bg-white/85 shadow-[0_10px_30px_-24px_rgba(26,24,20,0.4)] backdrop-blur-xl backdrop-saturate-150"
                    : "border-transparent bg-transparent"}`}
            >
                <div className={`relative mx-auto flex max-w-7xl items-center gap-6 px-4 transition-[height] duration-300 sm:px-6 lg:px-8 ${scrolled ? "h-16" : "h-16 md:h-[76px]"}`}>
                    <Link href="/" aria-label="Accueil E.doto family" className="flex shrink-0 items-center">
                        <BrandMark />
                    </Link>

                    {/* Navigation PC */}
                    <nav ref={navRef} aria-label="Navigation principale" className="relative hidden flex-1 items-center gap-0.5 lg:flex"
                        onPointerLeave={() => setPill((p) => ({ ...p, visible: false }))}>
                        <span aria-hidden className="pointer-events-none absolute top-1/2 z-0 h-10 -translate-y-1/2 rounded-full bg-[#1A1814]/[0.05] transition-[left,width,opacity] duration-300 ease-[cubic-bezier(.3,.7,.2,1)]"
                            style={{ left: pill.left, width: pill.width, opacity: pill.visible ? 1 : 0 }} />

                        <button type="button" className={item(active.shop, panel === "shop")} aria-expanded={panel === "shop"} aria-haspopup="true"
                            onClick={() => toggle("shop")} onPointerEnter={(e) => { movePill(e); hoverOpen("shop")(e); }} onPointerLeave={hoverClose}>
                            Boutique {chevron(panel === "shop")}
                            {active.shop && dot}
                        </button>

                        <Link href="/campaigns" className={item(active.campaigns)} aria-current={active.campaigns ? "page" : undefined}
                            onPointerEnter={(e) => { movePill(e); if (e.pointerType === "mouse") later(() => setPanel(null), 120); }}>
                            Campagnes
                            {liveCount > 0 && (
                                <span className="relative ml-0.5 flex h-2 w-2" title={`${liveCount} campagne${liveCount > 1 ? "s" : ""} en cours`}>
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22C55E] opacity-60" />
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#22C55E] ring-2 ring-white" />
                                    <span className="sr-only">{liveCount} campagne{liveCount > 1 ? "s" : ""} en cours</span>
                                </span>
                            )}
                            {active.campaigns && dot}
                        </Link>

                        <Link href="/contraception" className={item(active.contraception)} aria-current={active.contraception ? "page" : undefined}
                            onPointerEnter={(e) => { movePill(e); if (e.pointerType === "mouse") later(() => setPanel(null), 120); }}>
                            Contraception
                            {active.contraception && dot}
                        </Link>

                        <button type="button" className={item(active.about, panel === "about")} aria-expanded={panel === "about"} aria-haspopup="true"
                            onClick={() => toggle("about")} onPointerEnter={(e) => { movePill(e); hoverOpen("about")(e); }} onPointerLeave={hoverClose}>
                            E.doto family {chevron(panel === "about")}
                            {active.about && dot}
                        </button>
                    </nav>

                    <div className="ml-auto flex items-center gap-2 md:gap-2.5">
                        {/* Assistant SSR : même choix que le bouton flottant (assistant ou rendez-vous) */}
                        <button type="button" onClick={openChoice} aria-label="Assistant SSR"
                            className="hidden h-10 items-center gap-2 rounded-full border-[1.5px] border-transparent pl-1.5 pr-1.5 text-[14px] font-medium text-[#C2185B] transition [background:linear-gradient(#fff,#fff)_padding-box,linear-gradient(120deg,#FF6EA9,#C2185B_60%,#7B1FA2)_border-box] hover:-translate-y-px hover:shadow-[0_10px_22px_-14px_rgba(194,24,91,0.7)] md:inline-flex lg:pr-4">
                            <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-gradient-to-br from-[#FF6EA9] to-[#C2185B] text-white"><Sparkles size={15} /></span>
                            <span className="hidden lg:inline">Assistant SSR</span>
                        </button>

                        <SiteNotificationBell />

                        {user ? (
                            <>
                                <div className="md:hidden">
                                    <UserAvatarMenu round user={user} onNavigate={(path) => router.push(path)} onLogout={handleLogout} />
                                </div>
                                <div className="hidden md:block">
                                    <UserAvatarMenu user={user} onNavigate={(path) => router.push(path)} onLogout={handleLogout} />
                                </div>
                            </>
                        ) : (
                            <>
                                <button onClick={handleLogin} aria-label="Se connecter"
                                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#FF6EA9] to-[#C2185B] text-white shadow-[0_4px_14px_-4px_rgba(194,24,91,0.45)] ring-2 ring-white md:hidden">
                                    <UserRoundIcon className="h-5 w-5" />
                                </button>
                                <Link href="/register" className="hidden h-10 items-center rounded-full px-3.5 text-[14px] font-medium text-[#1A1814] transition hover:bg-[#1A1814]/[0.05] xl:inline-flex">
                                    Créer un compte
                                </Link>
                                <button onClick={handleLogin} className="hidden h-10 items-center rounded-full bg-[#1A1814] px-5 text-[14px] font-medium text-white transition hover:bg-[#2B2722] md:inline-flex">
                                    Connexion
                                </button>
                            </>
                        )}

                        {/* Tablette : le menu complet */}
                        <button type="button" onClick={() => setSheetOpen(true)} aria-label="Ouvrir le menu" aria-expanded={sheetOpen}
                            className="hidden h-10 w-10 items-center justify-center rounded-full text-[#4A443E] transition hover:bg-[#1A1814]/[0.05] md:flex lg:hidden">
                            <LayoutGrid size={20} />
                        </button>
                    </div>

                    {/* Grands menus (PC), centrés sous la barre */}
                    <AnimatePresence>
                        {panel === "shop" && (
                            <div key="shop" className="absolute left-1/2 top-[calc(100%-4px)] z-50 hidden w-[760px] max-w-[calc(100vw-2rem)] -translate-x-1/2 lg:block"
                                onPointerEnter={keepOpen} onPointerLeave={hoverClose}>
                                <MotionDiv {...panelMotion} className={`${panelBox} grid grid-cols-[minmax(0,1fr)_270px] gap-3.5`}>
                                    <div className="grid grid-cols-2 content-start gap-1.5 p-1.5">
                                        <p className={`${eyebrow} col-span-2`}>Catégories</p>
                                        {categories.map((c) => {
                                            const Icon = categoryIcon(c.slug);
                                            return (
                                                <Link key={c.id} href={categoryHref(c.id)} className="group flex items-center gap-3 rounded-2xl p-3 transition hover:bg-[#F9F8F6]">
                                                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#FBEEF3] text-[#C2185B] transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105">
                                                        <Icon size={21} />
                                                    </span>
                                                    <span className="min-w-0">
                                                        <span className="block text-[14.5px] font-medium text-[#1A1814]">{c.name}</span>
                                                        <span className="block text-xs text-[#9A8E80]">Voir les produits</span>
                                                    </span>
                                                </Link>
                                            );
                                        })}
                                        <Link href={ALL_PRODUCTS_HREF} className="col-span-2 mt-1 flex items-center justify-between rounded-[14px] border border-dashed border-[#E9E5DF] px-3.5 py-3 text-[13px] text-[#6B645D] transition hover:border-[#C2185B]/35 hover:text-[#C2185B]">
                                            Tous les produits <ArrowRight size={16} />
                                        </Link>
                                    </div>
                                    <Link href="/campaigns" className="relative flex min-h-[240px] flex-col justify-between overflow-hidden rounded-[18px] bg-[linear-gradient(160deg,#D81B60,#8E1247)] p-5 text-white">
                                        <span aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_100%_0%,rgba(255,141,187,0.95)_0%,transparent_55%)]" />
                                        <span aria-hidden className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full border-[1.5px] border-white/20" />
                                        <span aria-hidden className="pointer-events-none absolute -bottom-2.5 -right-2.5 h-24 w-24 rounded-full border-[1.5px] border-white/20" />
                                        <span className="relative inline-flex items-center gap-2 self-start rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium">
                                            {liveCount > 0 ? (
                                                <><span className="h-2 w-2 rounded-full bg-[#22C55E]" /> {liveCount} campagne{liveCount > 1 ? "s" : ""} en cours</>
                                            ) : "Campagnes"}
                                        </span>
                                        <span className="relative">
                                            <span className="block text-[21px] font-semibold leading-tight tracking-[-0.01em]">Kits gratuits près de chez vous</span>
                                            <span className="mb-3.5 mt-2 block text-[13px] leading-relaxed text-white/90">Demandez votre kit et retirez-le au point de retrait choisi.</span>
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-[13px] font-semibold text-[#C2185B]">
                                                Voir les campagnes <ArrowRight size={15} />
                                            </span>
                                        </span>
                                    </Link>
                                </MotionDiv>
                            </div>
                        )}

                        {panel === "about" && (
                            <div key="about" className="absolute left-1/2 top-[calc(100%-4px)] z-50 hidden w-[740px] max-w-[calc(100vw-2rem)] -translate-x-1/2 lg:block"
                                onPointerEnter={keepOpen} onPointerLeave={hoverClose}>
                                <MotionDiv {...panelMotion} className={`${panelBox} grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_230px] gap-1.5`}>
                                    <div className="grid content-start gap-0.5 p-1.5">
                                        <p className={eyebrow}>Découvrir</p>
                                        {DISCOVER_LINKS.filter((l) => l.href !== "/contact").map(linkRow)}
                                    </div>
                                    <div className="grid content-start gap-0.5 p-1.5">
                                        <p className={eyebrow}>Rejoindre</p>
                                        {JOIN_LINKS.map(linkRow)}
                                        <p className={`${eyebrow} mt-2`}>Légal</p>
                                        {LEGAL_LINKS.map(linkRow)}
                                    </div>
                                    <div className="flex flex-col gap-3 rounded-[18px] bg-[#F9F8F6] p-[18px]">
                                        <p className="text-[14px] font-semibold text-[#1A1814]">Nous contacter</p>
                                        <a href={telHref(info.phone)} className="flex items-start gap-2.5 text-[12.5px] leading-snug text-[#6B645D] hover:text-[#1A1814]">
                                            <Phone size={16} className="mt-px shrink-0 text-[#C2185B]" /> {info.phone}
                                        </a>
                                        <a href={`mailto:${info.email}`} className="flex items-start gap-2.5 break-all text-[12.5px] leading-snug text-[#6B645D] hover:text-[#1A1814]">
                                            <Mail size={16} className="mt-px shrink-0 text-[#C2185B]" /> {info.email}
                                        </a>
                                        <p className="flex items-start gap-2.5 text-[12.5px] leading-snug text-[#6B645D]">
                                            <MapPin size={16} className="mt-px shrink-0 text-[#C2185B]" /> {info.address}
                                        </p>
                                        <Link href="/contact" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#C2185B] hover:underline">
                                            Page Contact <ArrowRight size={15} />
                                        </Link>
                                        <SocialRow className="mt-auto" />
                                    </div>
                                </MotionDiv>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </header>

            <MenuSheet isOpen={sheetOpen} onClose={closeSheet} />
        </>
    );
};

export default Header;
