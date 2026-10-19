import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { roleHome, rememberRedirect } from "../../lib/roleHome";
import { api, token } from "../pickup-dashboard/api";

// Écran « Accès impossible » commun aux espaces réservés (19/10/2026) : au lieu d'une impasse,
// le compte connecté est renvoyé vers son propre espace ou peut changer de compte.
export default function AccessDenied({ message, here }) {
    const router = useRouter();
    const [home, setHome] = useState(null);

    useEffect(() => {
        if (!token()) return;
        api("me").then((u) => setHome(roleHome(u?.role))).catch(() => { });
    }, []);

    const switchAccount = () => {
        try { localStorage.removeItem("token"); localStorage.removeItem("user"); } catch { }
        if (here) rememberRedirect(here);
        window.location.href = "/login";
    };

    return (
        <div className="min-h-screen bg-[#F9F8F6] flex items-center justify-center p-6 text-center">
            <div className="max-w-md">
                <p className="font-serif text-2xl text-[#1A1814]">Accès impossible</p>
                <p className="text-[#6B655D] mt-2">{message}</p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                    {home && home !== here && (
                        <button onClick={() => router.replace(home)} className="rounded-full bg-[#1A1814] px-5 py-2.5 text-sm text-white hover:bg-black transition">
                            Aller à mon espace
                        </button>
                    )}
                    <button onClick={switchAccount} className="rounded-full border border-[#1A1814] px-5 py-2.5 text-sm text-[#1A1814] hover:bg-white transition">
                        Changer de compte
                    </button>
                    <button onClick={() => router.push("/")} className="rounded-full px-5 py-2.5 text-sm text-[#57524B] hover:text-[#1A1814] transition">
                        Accueil
                    </button>
                </div>
            </div>
        </div>
    );
}
