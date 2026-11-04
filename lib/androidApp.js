import { useEffect, useState } from "react";
import { isStandalone } from "./installPrompt";

// Application Android (04/11/2026) : le lien « Télécharger l'application » (page /application) ne s'affiche
// que sur un téléphone Android, et jamais à l'intérieur de l'application elle même (affichage plein écran).
export function useShowAndroidApp() {
    const [show, setShow] = useState(false);
    useEffect(() => {
        const android = /android/i.test(navigator.userAgent || "");
        setShow(android && !isStandalone());
    }, []);
    return show;
}
