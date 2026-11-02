import { useEffect, useMemo, useState } from "react";
import { useAuthContext } from "../../context/AuthContext";
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

    // Photo et nom suivis en direct (02/11/2026) : après un changement dans « Mon profil » (qui met à jour
    // le compte connecté), la barre latérale et le menu de l'espace affichent la nouvelle photo sans recharger.
    const auth = useAuthContext() || {};
    const live = useMemo(
        () => (me && auth.user && auth.user.id === me.id ? { ...me, name: auth.user.name, profile: auth.user.profile } : me),
        [me, auth.user]
    );

    return { me: live, denied };
}
