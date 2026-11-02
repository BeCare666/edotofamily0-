"use client"

import { useEffect, useState } from "react"
import {
    Baby, Briefcase, Camera, CircleHelp, FileText, Flag, Heart, HeartHandshake, Info, Leaf, MapPin,
    Phone, Scale, ShieldCheck, ShoppingBag, Sprout, Target,
} from "lucide-react"

// Menus du site (02/11/2026, maquette validée) : données communes à l'en-tête PC et au menu mobile.
// Catégories : GET /categories (vraies catégories) ; en attendant ou si l'API ne répond pas, les quatre de la base.
// Campagnes en cours : GET /campaigns/active/count (point vert uniquement s'il y en a réellement).
const API = process.env.NEXT_PUBLIC_REST_API_ENDPOINT

export const ALL_PRODUCTS_HREF = "/category/categories_id=all"
export const categoryHref = (id) => `/category/categories_id=${id}`

const FALLBACK_CATEGORIES = [
    { id: 1, name: "Fertilité", slug: "fertilite" },
    { id: 2, name: "Grossesse", slug: "grossesse" },
    { id: 3, name: "Intimité", slug: "intimite" },
    { id: 5, name: "Bien-être", slug: "bien-etre" },
]

// Icônes choisies selon la catégorie (avant : images externes sans rapport, voiture, usine)
const CATEGORY_ICONS = { fertilite: Sprout, grossesse: Baby, intimite: Heart, "bien-etre": Leaf }
export const categoryIcon = (slug) => CATEGORY_ICONS[slug] || ShoppingBag

export const DISCOVER_LINKS = [
    { label: "À propos", href: "/about", icon: Info },
    { label: "Notre mission", href: "/mission", icon: Target },
    { label: "Nos objectifs", href: "/objectives", icon: Flag },
    { label: "Services", href: "/services", icon: Briefcase },
    { label: "FAQ", href: "/faq", icon: CircleHelp },
    { label: "Contact", href: "/contact", icon: Phone },
]

export const JOIN_LINKS = [
    { label: "Devenir sponsor", href: "/sponsor/inscription", icon: HeartHandshake },
    { label: "Devenir point de retrait", href: "/devenir-point-de-retrait", icon: MapPin },
]

export const LEGAL_LINKS = [
    { label: "Termes et conditions", href: "/terms", icon: FileText },
    { label: "Confidentialité", href: "/privacy", icon: ShieldCheck },
    { label: "Mentions légales", href: "/mentions-legales", icon: Scale },
    { label: "Crédits photos", href: "/credits-photos", icon: Camera },
]

/** Espace du compte selon le rôle (mêmes règles que components/UserAvatarMenu.tsx) */
export function spaceFor(role) {
    if (role === "sponsor") return { path: "/sponsor", label: "Espace sponsor" }
    if (role === "super_pickuppoint") return { path: "/pickup-dashboard", label: "Dashboard" }
    if (role === "doctor") return { path: "/medecin", label: "Espace médecin" }
    if (role === "health_center") return { path: "/centre", label: "Espace centre" }
    return { path: "/mon-espace", label: "Dashboard" }
}

/** La page en cours appartient-elle à l'un de ces liens ? */
export const inLinks = (pathname, links) => links.some((l) => pathname === l.href || pathname.startsWith(`${l.href}/`))

let categoriesCache = null
let categoriesPending = null

export function useCategories() {
    const [list, setList] = useState(categoriesCache || FALLBACK_CATEGORIES)
    useEffect(() => {
        let alive = true
        if (categoriesCache) return undefined
        if (!categoriesPending) {
            categoriesPending = fetch(`${API}/categories?limit=50`)
                .then((r) => (r.ok ? r.json() : null))
                .then((d) => {
                    const rows = Array.isArray(d?.data) ? d.data.filter((c) => !c.parent) : []
                    categoriesCache = rows.length ? rows.map((c) => ({ id: c.id, name: c.name, slug: c.slug })) : FALLBACK_CATEGORIES
                    return categoriesCache
                })
                .catch(() => FALLBACK_CATEGORIES)
                .finally(() => { categoriesPending = null })
        }
        categoriesPending.then((v) => { if (alive) setList(v) })
        return () => { alive = false }
    }, [])
    return list
}

// Un seul appel toutes les 5 minutes, partagé entre l'en-tête, la barre du bas et le menu
const LIVE_REFRESH_MS = 5 * 60 * 1000
let liveValue = 0
let liveAt = 0
let livePending = null
const liveListeners = new Set()

function refreshLive() {
    if (livePending || Date.now() - liveAt < LIVE_REFRESH_MS) return
    livePending = fetch(`${API}/campaigns/active/count`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => { liveValue = Number(d?.total ?? 0) || 0 })
        .catch(() => { liveValue = 0 })
        .finally(() => {
            liveAt = Date.now()
            livePending = null
            liveListeners.forEach((fn) => fn(liveValue))
        })
}

export function useLiveCampaigns() {
    const [count, setCount] = useState(liveValue)
    useEffect(() => {
        liveListeners.add(setCount)
        setCount(liveValue)
        refreshLive()
        const id = setInterval(refreshLive, LIVE_REFRESH_MS)
        return () => {
            liveListeners.delete(setCount)
            clearInterval(id)
        }
    }, [])
    return count
}
