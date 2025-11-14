"use client"

import { useEffect, useState } from "react";
import { authService } from "../services/authService";

export function useAuth() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // 🔹 Charger le user au démarrage
    useEffect(() => {
        const token = localStorage.getItem("token");
        console.log("Fetched user data hooks:", token);

        if (!token) {
            setLoading(false);
            return;
        }

        authService.me()
            .then((data) => {
                console.log("Fetched user data:", data);
                setUser(data);
            })
            .catch((err) => {
                console.error("Erreur lors de la récupération du profil:", err);
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                setUser(null);
            })
            .finally(() => setLoading(false));
    }, []);

    // 🔹 Connexion
    const login = async (email, password) => {
        const res = await authService.login(email, password);

        // ✅ Si un token est renvoyé, on récupère le profil de l’utilisateur
        if (res.token) {
            try {
                const me = await authService.me();
                console.log("Profil utilisateur après login:", me);
                setUser(me); // ← ICI tu "set" le user connecté
            } catch (err) {
                console.error("Erreur lors du chargement du profil après login:", err);
            }
        }

        return res;
    };

    // 🔹 Déconnexion
    const logout = async () => {
        await authService.logout();
        setUser(null);
    };

    return { user, setUser, loading, login, logout };
}
