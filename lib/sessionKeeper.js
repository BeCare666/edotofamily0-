"use client"

// Session fermée après 5 min d'inactivité (décision du 29/10/2026).
// Le jeton de l'API ne vaut que 5 min : il est renouvelé (POST /token/refresh) tant que la personne agit
// (clic, frappe, défilement, toucher, dans n'importe quel onglet). Sans action, il expire : le jeton est
// retiré et la page rechargée (chaque espace renvoie alors vers la connexion, comme sans session).
// La durée maximale depuis la connexion (12 h ou 7 jours selon le compte) est contrôlée par l'API.
const ACTIVITY_KEY = "edoto-last-activity"
const CHECK_MS = 30 * 1000
const RENEW_WHEN_LEFT_MS = 4 * 60 * 1000
// Visio (30/10/2026) : l'appel Jitsi est dans un autre onglet, sans clic ni frappe ici. Une visio ouverte compte
// comme une activité jusqu'à la fin prévue du rendez-vous + 15 min (3 h au plus). Durée maximale API inchangée.
const VISIO_KEY = "edoto-visio-until"
const VISIO_AFTER_END_MS = 15 * 60 * 1000
const VISIO_MAX_MS = 3 * 60 * 60 * 1000

export function keepSessionDuringVisio(endsAt) {
    const end = new Date(endsAt).getTime()
    if (!Number.isFinite(end)) return
    const now = Date.now()
    const until = Math.min(end + VISIO_AFTER_END_MS, now + VISIO_MAX_MS)
    if (until <= now) return
    try { localStorage.setItem(VISIO_KEY, String(until)) } catch { }
}

function tokenTimes(token) {
    try {
        const p = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")))
        return typeof p.exp === "number" ? { iat: (p.iat || 0) * 1000, exp: p.exp * 1000 } : null
    } catch {
        return null
    }
}

function read(key) {
    try { return localStorage.getItem(key) } catch { return null }
}

export function startSessionKeeper() {
    if (typeof window === "undefined") return () => { }
    let lastMark = 0
    const mark = () => {
        const now = Date.now()
        if (now - lastMark < 5000) return
        lastMark = now
        try { localStorage.setItem(ACTIVITY_KEY, String(now)) } catch { }
    }
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"]
    events.forEach((e) => window.addEventListener(e, mark, { passive: true }))
    mark()

    let renewing = false
    const check = async () => {
        const token = read("token")
        if (!token) return
        const t = tokenTimes(token)
        if (!t) return
        const now = Date.now()
        if ((Number(read(VISIO_KEY)) || 0) > now) {
            try { localStorage.setItem(ACTIVITY_KEY, String(now)) } catch { }
        }
        if (t.exp <= now) {
            try { localStorage.removeItem("token"); localStorage.removeItem("user") } catch { }
            window.location.reload()
            return
        }
        if (renewing || (Number(read(ACTIVITY_KEY)) || 0) <= t.iat || t.exp - now > RENEW_WHEN_LEFT_MS) return
        renewing = true
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_REST_API_ENDPOINT}/token/refresh`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: "{}",
            })
            const data = res.ok ? await res.json() : null
            // Un autre onglet a pu se déconnecter entre-temps : on ne remet pas de jeton dans ce cas
            if (data?.token && read("token") === token) localStorage.setItem("token", data.token)
        } catch {
            // Réseau indisponible : nouvel essai au prochain contrôle
        } finally {
            renewing = false
        }
    }
    const timer = window.setInterval(check, CHECK_MS)
    check()
    return () => {
        window.clearInterval(timer)
        events.forEach((e) => window.removeEventListener(e, mark))
    }
}
