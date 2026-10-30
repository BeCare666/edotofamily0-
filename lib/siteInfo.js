"use client"

import { useEffect, useState } from "react"

// Informations du site réglées par le super admin (B5, 30/10/2026) : admin → Paramètres → Informations du site.
// Lues une seule fois par page (GET /site-info) ; en attendant ou si l'API ne répond pas : valeurs de départ.
// Réseau social vide = icône masquée (le site affichait jusqu'ici des liens d'exemple « toncompte »).
export const DEFAULT_MAP_URL =
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3971.201178289907!2d2.451!3d6.372!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x102357e9d9e56f5b%3A0x80a8db33cfb9f8d!2sAkpakpa%20Kpond%C3%A9hou%2C%20Cotonou%2C%20B%C3%A9nin!5e0!3m2!1sfr!2sbj!4v1707483200000!5m2!1sfr!2sbj"

export const SITE_INFO_DEFAULTS = {
    phone: "+229 01 67 69 81 91",
    email: "contact@edotofamily.com",
    address: "St Rita, Cotonou, Bénin",
    map_url: null,
    instagram: null,
    facebook: null,
    linkedin: null,
    x_url: null,
    tiktok: null,
    youtube: null,
}

// Ordre d'affichage des réseaux
export const SOCIAL_KEYS = ["instagram", "facebook", "linkedin", "x_url", "tiktok", "youtube"]

let cache = null
let pending = null

function load() {
    if (cache) return Promise.resolve(cache)
    if (!pending) {
        pending = fetch(`${process.env.NEXT_PUBLIC_REST_API_ENDPOINT}/site-info`)
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                cache = data ? { ...SITE_INFO_DEFAULTS, ...data } : SITE_INFO_DEFAULTS
                return cache
            })
            .catch(() => SITE_INFO_DEFAULTS)
            .finally(() => { pending = null })
    }
    return pending
}

export function useSiteInfo() {
    const [info, setInfo] = useState(cache || SITE_INFO_DEFAULTS)
    useEffect(() => {
        let alive = true
        load().then((v) => { if (alive) setInfo(v) })
        return () => { alive = false }
    }, [])
    return info
}

/** Réseaux renseignés seulement, dans l'ordre d'affichage : [{ key, url }] */
export function socialItems(info) {
    return SOCIAL_KEYS.filter((k) => typeof info?.[k] === "string" && info[k].startsWith("https://")).map((k) => ({ key: k, url: info[k] }))
}

/** Lien d'appel : chiffres et + seulement */
export const telHref = (phone) => `tel:${String(phone || "").replace(/[^0-9+]/g, "")}`
