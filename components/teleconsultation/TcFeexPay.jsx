"use client";

import { useEffect, useRef } from "react";
import toast from "react-hot-toast";

// Paiement d'une téléconsultation (23/11/2026) : même SDK FeexPay v2 et mêmes réglages Vercel que le paiement
// des commandes (components/FeexPayModal.jsx). Ici, pas de commande : la référence de la transaction est rendue
// à la prise de rendez-vous (onPaid), qui la transmet à l'API ; l'API la vérifie chez FeexPay avant de réserver.
const FEEXPAY_TOKEN = process.env.NEXT_PUBLIC_FEEXPAY_PUBLIC_KEY;
const FEEXPAY_STORE_ID = process.env.NEXT_PUBLIC_FEEXPAY_STORE_ID;
const SDK_URL = "https://api-v2.feexpay.me/feexpay-javascript-sdk/index.js";

const closeOverlay = () =>
    document.querySelectorAll(".feexpay-modal-overlay.active").forEach((el) => el.classList.remove("active"));

export default function TcFeexPay({ payment, onPaid, onClose }) {
    const done = useRef(false);

    useEffect(() => {
        if (!payment) return;
        done.current = false;
        if (!FEEXPAY_TOKEN || !FEEXPAY_STORE_ID) {
            toast.error("Le paiement est momentanément indisponible. Réessayez plus tard.");
            onClose?.();
            return;
        }

        const container = document.createElement("div");
        container.id = "render";
        document.body.appendChild(container);

        const start = () => {
            if (!window.FeexPayButton) {
                toast.error("Le paiement est momentanément indisponible. Réessayez plus tard.");
                onClose?.();
                return;
            }
            window.FeexPayButton.init("render", {
                token: FEEXPAY_TOKEN,
                id: FEEXPAY_STORE_ID,
                amount: payment.amount,
                custom_id: payment.reference,
                description: "Téléconsultation E.doto family " + payment.reference,
                mode: "LIVE",
                currency: "XOF",
                callback: (response) => {
                    if (done.current) return;
                    done.current = true;
                    closeOverlay();
                    if (response?.status !== "SUCCESSFUL" || !response?.transaction_id) {
                        toast.error("Le paiement n’a pas été confirmé par FeexPay.");
                        onClose?.();
                        return;
                    }
                    onPaid?.(String(response.transaction_id));
                },
            });
        };

        let script = document.querySelector(`script[src="${SDK_URL}"]`);
        if (script && window.FeexPayButton) start();
        else {
            script = document.createElement("script");
            script.src = SDK_URL;
            script.async = true;
            script.onload = start;
            script.onerror = () => {
                toast.error("Le paiement est momentanément indisponible. Réessayez plus tard.");
                onClose?.();
            };
            document.body.appendChild(script);
        }

        return () => {
            const div = document.getElementById("render");
            if (div) div.remove();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [payment]);

    return null;
}
