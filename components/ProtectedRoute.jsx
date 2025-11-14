"use client"

import { useAuthContext } from "../context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuthContext();
    const router = useRouter();
    const pathname = usePathname(); // récupère la route actuelle (ex: /profile)

    useEffect(() => {
        if (!loading && !user) {
            // redirige vers login avec l’URL d’origine dans un paramètre
            router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
        }
    }, [user, loading, pathname, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen text-gray-500">
                Chargement...
            </div>
        );
    }

    if (user) return children;

    return null;
}
