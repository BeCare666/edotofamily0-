"use client"

import { useEffect, useState } from "react"
import { setAgeLimits } from "./fieldRules"

// Paramètres avancés réglés par le super admin (02/11/2026) : admin → Paramètres → Avancés.
// Seules les valeurs utiles à l'affichage sont publiques (GET /platform-settings) ; l'API reste juge.
// En attendant ou si l'API ne répond pas : valeurs d'origine.
export const PLATFORM_DEFAULTS = {
    "tc.booking_window_days": 30,
    "tc.reminder_minutes": 10,
    "signup.min_age": 10,
    "signup.max_age": 100,
    "ai.log_retention_days": 90,
    "files.photo_max_mb": 3,
}

let cache = null
let pending = null

function load() {
    if (cache) return Promise.resolve(cache)
    if (!pending) {
        pending = fetch(`${process.env.NEXT_PUBLIC_REST_API_ENDPOINT}/platform-settings`)
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                cache = { ...PLATFORM_DEFAULTS, ...(data || {}) }
                setAgeLimits(cache["signup.min_age"], cache["signup.max_age"])
                return cache
            })
            .catch(() => PLATFORM_DEFAULTS)
            .finally(() => { pending = null })
    }
    return pending
}

export function usePlatformSettings() {
    const [values, setValues] = useState(cache || PLATFORM_DEFAULTS)
    useEffect(() => {
        let alive = true
        load().then((v) => { if (alive) setValues(v) })
        return () => { alive = false }
    }, [])
    return values
}
