"use client"

import { useEffect, useState } from "react"

// Produits et téléconsultations offerts par une campagne (26/11/2026, API /sponsored).
// useSponsoredProducts : { [product_id]: { offered_by, remaining, offers } } pour les badges de la boutique.
// useProductFunding(productId) : ce produit est-il à 0 FCFA pour la personne connectée ?
const API = process.env.NEXT_PUBLIC_REST_API_ENDPOINT

let cache = null
let pending = null

export function loadSponsoredProducts() {
    if (cache) return Promise.resolve(cache)
    if (!pending) {
        pending = fetch(`${API}/sponsored/products`)
            .then((r) => (r.ok ? r.json() : { data: [] }))
            .then((j) => {
                cache = Object.fromEntries((j?.data || []).map((p) => [Number(p.product_id), p]))
                return cache
            })
            .catch(() => ({}))
            .finally(() => { pending = null })
    }
    return pending
}

export function useSponsoredProducts() {
    const [map, setMap] = useState(cache || {})
    useEffect(() => {
        let alive = true
        loadSponsoredProducts().then((m) => alive && setMap(m || {}))
        return () => { alive = false }
    }, [])
    return map
}

const token = () => {
    try { return localStorage.getItem("token") } catch { return null }
}

// { status: "loading" | "none" | "guest" | "ok", data }
export function useProductFunding(productId) {
    const offers = useSponsoredProducts()
    const offered = productId ? offers[Number(productId)] : null
    const [state, setState] = useState({ status: "loading", data: null })
    useEffect(() => {
        if (!productId) return undefined
        if (!offered) { setState({ status: "none", data: null }); return undefined }
        const t = token()
        if (!t) { setState({ status: "guest", data: { offered_by: offered.offered_by } }); return undefined }
        let alive = true
        fetch(`${API}/sponsored/products/${productId}/eligibility`, { headers: { Authorization: `Bearer ${t}` } })
            .then((r) => (r.ok ? r.json() : null))
            .then((d) => alive && setState({ status: d ? "ok" : "guest", data: d || { offered_by: offered.offered_by } }))
            .catch(() => alive && setState({ status: "guest", data: { offered_by: offered.offered_by } }))
        return () => { alive = false }
    }, [productId, offered])
    return state
}

export async function orderSponsoredProduct(productId, pickupPointId) {
    const res = await fetch(`${API}/sponsored/products/${productId}/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ pickup_point_id: pickupPointId }),
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
        const m = json?.message
        throw new Error(Array.isArray(m) ? m.join(" ") : m || "La réservation du produit offert a échoué.")
    }
    cache = null // les unités restantes ont changé
    return json
}

// Téléconsultation offerte pour la personne connectée : { eligible, offered_by, message, reason }
// pos : { lat, lng } quand la consultation offerte est réservée aux villes d'une campagne
export async function loadTcFunding(pos = null) {
    const t = token()
    if (!t) return null
    try {
        const qs = pos ? `?lat=${encodeURIComponent(pos.lat)}&lng=${encodeURIComponent(pos.lng)}` : ""
        const r = await fetch(`${API}/sponsored/teleconsultation${qs}`, { headers: { Authorization: `Bearer ${t}` } })
        return r.ok ? await r.json() : null
    } catch {
        return null
    }
}
