"use client";

import { useEffect, useRef } from "react";
import { FeexPayProvider, FeexPayButton } from "@feexpay/react-sdk";
import "@feexpay/react-sdk/style.css";

export default function FeexPayInner({ payment }) {
    const payBtnRef = useRef(null);

    useEffect(() => {
        if (payment?.reference && payBtnRef.current) {
            const timer = setTimeout(() => payBtnRef.current.click(), 600);
            return () => clearTimeout(timer);
        }
    }, [payment]);

    if (!payment) return null;

    return (
        <FeexPayProvider>
            <FeexPayButton
                ref={payBtnRef}
                amount={payment.amount}
                currency={payment.currency || "XOF"}
                token={payment.publicKey}
                id={process.env.NEXT_PUBLIC_FEEXPAY_STORE_ID}
                customId={payment.reference}
                description={`Paiement commande ${payment.reference}`}
                mode="LIVE"
                callback={(res) => {
                    console.log("✅ Réponse FeexPay :", res);
                    if (res.status === "SUCCESS") {
                        window.location.href = `/orders/success?ref=${payment.reference}`;
                    } else {
                        window.location.href = `/orders/failed?ref=${payment.reference}`;
                    }
                }}
                buttonText="💳 Payer maintenant"
                buttonClass="hidden"
            />
        </FeexPayProvider>
    );
}
