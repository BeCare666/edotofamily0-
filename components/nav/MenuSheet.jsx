"use client"

import { useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { AnimatePresence, motion, useDragControls } from "framer-motion"
import toast from "react-hot-toast"
import { ArrowRight, ChevronRight, LayoutDashboard, LogOut, ShoppingBag, Sparkles, User, X } from "lucide-react"
import UserAvatar from "../UserAvatar"
import SocialRow from "./SocialRow"
import { useAuthContext } from "../../context/AuthContext"
import { useChatAI } from "../../context/ChatAIContext"
import {
    DISCOVER_LINKS, JOIN_LINKS, LEGAL_LINKS, categoryHref, categoryIcon, spaceFor, useCategories,
} from "../../lib/siteNav"

// Menu du site en panneau qui monte du bas (02/11/2026, maquette validée) : remplace l'ancien tiroir latéral.
// Utilisé par la barre du bas (téléphone) et par l'en-tête sur tablette.
// Fermeture : toucher à côté, croix, Échap, glisser vers le bas, ou changement de page.
export default function MenuSheet({ isOpen, onClose }) {
    const pathname = usePathname() || ""
    const router = useRouter()
    const { user, logout } = useAuthContext()
    const { openChoice } = useChatAI()
    const categories = useCategories()
    // Glisser vers le bas depuis la poignée ou le titre (pas depuis la liste, qui doit défiler)
    const drag = useDragControls()

    useEffect(() => { onClose() }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!isOpen) return undefined
        const onKey = (e) => e.key === "Escape" && onClose()
        window.addEventListener("keydown", onKey)
        const prev = document.body.style.overflow
        document.body.style.overflow = "hidden"
        return () => {
            window.removeEventListener("keydown", onKey)
            document.body.style.overflow = prev
        }
    }, [isOpen, onClose])

    const login = () => {
        try { localStorage.setItem("redirect_after_login", window.location.pathname) } catch { }
        onClose()
        router.push("/login")
    }
    const signOut = async () => {
        onClose()
        try {
            await logout()
            toast.success("Déconnexion réussie 👋")
            router.push("/")
        } catch {
            toast.error("Une erreur est survenue lors de la déconnexion")
        }
    }
    const assistant = () => { onClose(); openChoice() }
    const space = spaceFor(user?.role)

    const row = (l) => {
        const Icon = l.icon
        const current = pathname === l.href
        return (
            <Link key={l.href} href={l.href} aria-current={current ? "page" : undefined}
                className={`flex items-center gap-3 border-t border-[#F1EDE8] px-4 py-3.5 text-[14px] first:border-t-0 transition ${current ? "bg-[#FBEEF3] font-medium text-[#C2185B]" : "text-[#1A1814] active:bg-[#F9F8F6]"}`}>
                <Icon size={18} className="shrink-0 text-[#C2185B]" />
                {l.label}
                <ChevronRight size={16} className="ml-auto text-[#C9C1B8]" />
            </Link>
        )
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div key="bd" onClick={onClose} aria-hidden
                        className="fixed inset-0 z-[75] bg-[#1A1814]/40 backdrop-blur-[3px]"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} />
                    <div key="wrap" className="pointer-events-none fixed inset-x-0 bottom-0 z-[76] flex justify-center">
                        <motion.div
                            role="dialog" aria-modal="true" aria-label="Menu"
                            className="pointer-events-auto flex max-h-[88dvh] w-full flex-col rounded-t-[30px] bg-white shadow-[0_-20px_50px_-30px_rgba(26,24,20,0.5)] md:max-w-lg"
                            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                            transition={{ type: "spring", stiffness: 340, damping: 34 }}
                            drag="y" dragControls={drag} dragListener={false} dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0, bottom: 0.6 }}
                            onDragEnd={(_, info) => { if (info.offset.y > 110 || info.velocity.y > 600) onClose() }}
                        >
                            <div onPointerDown={(e) => drag.start(e)} className="shrink-0 touch-none">
                            <div className="mx-auto mb-1 mt-2.5 h-[5px] w-10 rounded-full bg-[#DDD6CE]" />
                            <div className="flex items-center justify-between px-5 pb-2.5 pt-1.5">
                                <h2 className="text-lg font-semibold tracking-[-0.01em] text-[#1A1814]">Menu</h2>
                                <button type="button" onClick={onClose} aria-label="Fermer le menu"
                                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F9F8F6] text-[#1A1814]">
                                    <X size={18} />
                                </button>
                            </div>
                            </div>

                            <div className="grid gap-5 overflow-y-auto overscroll-contain px-4 pb-[calc(1.75rem+env(safe-area-inset-bottom))]">
                                {user ? (
                                    <div className="grid gap-2.5">
                                        <div className="flex items-center gap-3 rounded-[20px] border border-[#F6DCE7] bg-gradient-to-br from-[#FFF2F7] to-[#F9F8F6] p-3.5">
                                            <UserAvatar user={user} size={46} />
                                            <div className="min-w-0">
                                                <p className="truncate text-[15px] font-semibold text-[#1A1814]">{user?.name}</p>
                                                <p className="truncate text-xs text-[#9A8E80]">{user?.email}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { href: space.path, label: space.label, icon: LayoutDashboard },
                                                { href: "/orders", label: "Commandes", icon: ShoppingBag },
                                                { href: "/profile", label: "Profil", icon: User },
                                            ].map((a) => (
                                                <Link key={a.href} href={a.href}
                                                    className="flex flex-col items-center gap-1.5 rounded-2xl border border-[#E9E5DF] px-1.5 py-3 text-center text-xs font-medium text-[#1A1814] active:bg-[#F9F8F6]">
                                                    <a.icon size={18} className="text-[#C2185B]" />
                                                    {a.label}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-2">
                                        <Link href="/register" className="flex h-12 items-center justify-center rounded-2xl border border-[#E9E5DF] text-sm font-semibold text-[#1A1814]">
                                            Créer un compte
                                        </Link>
                                        <button type="button" onClick={login} className="flex h-12 items-center justify-center rounded-2xl bg-[#1A1814] text-sm font-semibold text-white">
                                            Connexion
                                        </button>
                                    </div>
                                )}

                                <button type="button" onClick={assistant}
                                    className="relative flex items-center gap-3.5 overflow-hidden rounded-[20px] bg-[linear-gradient(150deg,#D81B60,#8E1247)] p-4 text-left text-white">
                                    <span aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(100%_120%_at_100%_0%,rgba(255,141,187,0.9)_0%,transparent_55%)]" />
                                    <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/20"><Sparkles size={22} /></span>
                                    <span className="relative min-w-0">
                                        <span className="block text-[15px] font-semibold">Assistant SSR</span>
                                        <span className="block text-xs leading-snug text-white/85">Vos questions sur la santé sexuelle et reproductive</span>
                                    </span>
                                    <ArrowRight size={18} className="relative ml-auto shrink-0" />
                                </button>

                                <section>
                                    <h3 className="mb-2 ml-1 text-[11px] font-medium uppercase tracking-[0.16em] text-[#9A8E80]">Boutique</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {categories.map((c) => {
                                            const Icon = categoryIcon(c.slug)
                                            return (
                                                <Link key={c.id} href={categoryHref(c.id)}
                                                    className="inline-flex items-center gap-2 rounded-full bg-[#F9F8F6] py-2 pl-2 pr-3.5 text-[13px] font-medium text-[#1A1814]">
                                                    <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[#FBEEF3] text-[#C2185B]"><Icon size={14} /></span>
                                                    {c.name}
                                                </Link>
                                            )
                                        })}
                                    </div>
                                </section>

                                <section>
                                    <h3 className="mb-2 ml-1 text-[11px] font-medium uppercase tracking-[0.16em] text-[#9A8E80]">Découvrir</h3>
                                    <div className="overflow-hidden rounded-[18px] border border-[#E9E5DF]">{DISCOVER_LINKS.map(row)}</div>
                                </section>

                                <section>
                                    <h3 className="mb-2 ml-1 text-[11px] font-medium uppercase tracking-[0.16em] text-[#9A8E80]">Rejoindre</h3>
                                    <div className="overflow-hidden rounded-[18px] border border-[#E9E5DF]">{JOIN_LINKS.map(row)}</div>
                                </section>

                                <section>
                                    <h3 className="mb-1 ml-1 text-[11px] font-medium uppercase tracking-[0.16em] text-[#9A8E80]">Légal</h3>
                                    <div className="grid grid-cols-2 gap-x-3 px-1">
                                        {LEGAL_LINKS.map((l) => (
                                            <Link key={l.href} href={l.href} className={`py-1.5 text-[13px] ${pathname === l.href ? "font-medium text-[#C2185B]" : "text-[#6B645D]"}`}>{l.label}</Link>
                                        ))}
                                    </div>
                                </section>

                                <div className="flex flex-col items-center gap-3 pt-1">
                                    <SocialRow />
                                    {user && (
                                        <button type="button" onClick={signOut} className="inline-flex items-center gap-2 text-[13px] font-medium text-[#9B2C2C]">
                                            <LogOut size={15} /> Déconnexion
                                        </button>
                                    )}
                                    <p className="text-[11px] text-[#9A8E80]">© {new Date().getFullYear()} E.doto family</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}
