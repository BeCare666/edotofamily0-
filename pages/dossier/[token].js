import { useEffect } from "react";
import { useRouter } from "next/router";
import { Loader2 } from "lucide-react";
import { rememberRedirect } from "../../lib/roleHome";
import { token as authToken } from "../../components/teleconsultation/tcShared";

// Adresse contenue dans le code QR d'orientation (19/10/2026). Le dossier ne s'ouvre que dans l'espace
// du centre recommandé, connecté : sans session, connexion puis retour ici ; sinon, espace centre.
export default function DossierRedirect() {
    const router = useRouter();
    useEffect(() => {
        if (!router.isReady) return;
        const t = String(router.query.token || "");
        if (!/^[a-f0-9]{48}$/.test(t)) {
            router.replace("/");
            return;
        }
        if (!authToken()) {
            rememberRedirect(`/dossier/${t}`);
            router.replace("/login");
            return;
        }
        router.replace(`/centre?dossier=${t}`);
    }, [router]);
    return (
        <div className="flex min-h-screen items-center justify-center bg-[#F9F8F6]">
            <Loader2 className="h-8 w-8 animate-spin text-[#C2185B]" />
        </div>
    );
}
