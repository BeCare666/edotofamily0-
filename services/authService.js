import { apiRequest } from "../lib/api"

export const authService = {
    async register(name, email, password) {
        const res = await apiRequest("/register", {
            method: "POST",
            body: JSON.stringify({ name, email, password }),
        })

        return res
    },
    async login(email, password) {
        const res = await apiRequest("/token", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        })

        // Sauvegarde du token
        if (typeof window !== "undefined" && res.token) {
            localStorage.setItem("token", res.token)
        }

        return res
    },

    async me() {
        // ⚠️ Ton endpoint doit correspondre à ce que ton API expose, ex: /users/me ou /me
        const res = await apiRequest("/me", {
            method: "GET",
        })
        console.log("👉 Réponse /me :", res)
        return res
    },

    async logout() {
        await apiRequest("/logout", { method: "POST" });
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    },
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
