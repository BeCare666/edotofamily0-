import { apiRequest } from "../lib/api"
import { useRouter } from "next/navigation"
export const authService = {

    // Date de naissance (AAAA-MM-JJ) et sexe (female | male) obligatoires depuis le 16/10/2026
    async register(name, email, password, birth_date, sex) {
        const res = await apiRequest("/register", {
            method: "POST",
            body: JSON.stringify({ name, email, password, birth_date, sex }),
        })

        return res
    },
    async registerPickUpPoint({ name, email, password, pickup_lat, pickup_lng, pickup_address }) {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_REST_API_ENDPOINT}/register-pick-up-point`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    pickup_lat,
                    pickup_lng,
                    pickup_address,
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Erreur lors de la création du point de retrait.");

            return data;
        } catch (error) {
            throw new Error(error.message);
        }
    },
    async login(email, password) {
        // Appareil reconnu (code reçu par e-mail une première fois, 29/10/2026) : jeton gardé par adresse
        let device
        try { device = localStorage.getItem(`edoto-device:${String(email).toLowerCase()}`) || undefined } catch { }
        const res = await apiRequest("/token", {
            method: "POST",
            body: JSON.stringify({ email, password, ...(device ? { device } : {}) }),
        })

        // Sauvegarde du token... dans le localStorage (ou cookie selon ton choix)
        if (typeof window !== "undefined" && res.token) {
            localStorage.setItem("token", res.token)
        }

        return res
    },

    // Double authentification (audit sécurité 3.1, 29/10/2026) : étape 2 de la connexion.
    // Appel direct : les messages de l'API (« Code incorrect »…) sont gardés, même en 401.
    async totp(step, body) {
        const paths = { setup: "/token/totp/setup", activate: "/token/totp/activate", device: "/token/device", "device-resend": "/token/device/resend" }
        const path = paths[step] || "/token/totp"
        const res = await fetch(`${process.env.NEXT_PUBLIC_REST_API_ENDPOINT}${path}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        })
        let data = {}
        try { data = await res.json() } catch { }
        if (!res.ok) throw new Error(data.message || "Une erreur est survenue.")
        if (typeof window !== "undefined" && data.token) localStorage.setItem("token", data.token)
        return data
    },

    // Appareil reconnu 30 jours après le code reçu par e-mail
    rememberDevice(email, deviceToken) {
        try { if (deviceToken) localStorage.setItem(`edoto-device:${String(email).toLowerCase()}`, deviceToken) } catch { }
    },

    async me() {
        // ⚠️ Ton endpoint doit correspondre à ce que ton API expose, ex: /users/me ou /me
        const res = await apiRequest("/me", {
            method: "GET",
        })
        //console.log("👉 Réponse /me :", res)
        return res
    },

    async logout() {
        //const router = useRouter();
        // Session effacée même si l'appel échoue ; l'adresse de retour mémorisée aussi (19/10/2026),
        // sinon le compte suivant pouvait être envoyé sur la page d'un autre compte
        try {
            await apiRequest("/logout", { method: "POST" });
        } finally {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("redirect_after_login");
        }
        //router.push("/");
    },
    resendVerificationEmail: (email) =>
        apiRequest("/resend-verification-email", {
            method: "POST",
            body: JSON.stringify({ email }),
        }),

    forgetPassword: (email) =>
        apiRequest("/forget-password", {
            method: "POST",
            body: JSON.stringify({ email }),
        }),

    verifyForgetPasswordToken: (email, token) =>
        apiRequest("/verify-forget-password-token", {
            method: "POST",
            body: JSON.stringify({ email, token }),
        }),

    resetPassword: (email, token, password) =>
        apiRequest("/reset-password", {
            method: "POST",
            body: JSON.stringify({ email, token, password }),
        }),

    changePassword: (oldPassword, newPassword) =>
        apiRequest("/change-password", {
            method: "POST",
            body: JSON.stringify({ oldPassword, newPassword }),
        }),
}
