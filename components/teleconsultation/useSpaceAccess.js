import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { api, token } from "./tcShared";
import { rememberRedirect } from "../../lib/roleHome";

// Accès à un espace réservé : compte connecté avec le bon rôle, sinon connexion (avec retour ici)
// ou écran « Accès impossible ». Retourne le compte (/me) une fois vérifié.
export default function useSpaceAccess(role, here, deniedMessage) {
    const router = useRouter();
    const [me, setMe] = useState(null);
    const [denied, setDenied] = useState(null);

    useEffect(() => {
        if (!router.isReady) return;
        const back = here || router.asPath;
        if (!token()) {
            rememberRedirect(back);
            router.replace("/login");
            return;
        }
        api("me")
            .then((u) => (u?.role === role ? setMe(u) : setDenied(deniedMessage)))
            .catch((e) => {
                if (e.status === 401) {
                    try { localStorage.removeItem("token"); } catch { }
                    rememberRedirect(back);
                    router.replace("/login");
                } else setDenied(e.message);
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router.isReady]);

    return { me, denied };
}
