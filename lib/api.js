"use client"

const API_URL = process.env.NEXT_PUBLIC_REST_API_ENDPOINT

// ✅ Fonction pure (PAS de React hook)
export async function apiRequest(endpoint, options = {}) {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

    const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    }

    const config = { ...options, headers }

    const res = await fetch(`${API_URL}${endpoint}`, config)

    if (!res.ok) {
        let message = "Une erreur est survenue"
        try {
            const errorData = await res.json()
            message = errorData.message || message
        } catch { }

        if (res.status === 401) {
            if (typeof window !== "undefined") localStorage.removeItem("token")
            throw new Error("Session expirée. Veuillez vous reconnecter.")
        }

        throw new Error(message)
    }

    try {
        return await res.json()
    } catch {
        return {}
    }
}
