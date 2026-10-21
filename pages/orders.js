import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import OrdersPanel from "../components/orders/OrdersPanel";
import { useAuthContext } from "../context/AuthContext";

// « Mes commandes » (21/10/2026) : un compte jeune les retrouve dans son espace (« Mon dashboard », rubrique Commandes) ;
// les autres comptes gardent cette page.
export default function OrdersPage() {
    const router = useRouter();
    const { user } = useAuthContext() || {};
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (!user) {
            // Compte pas encore chargé (ou non connecté : le panneau renvoie vers la connexion)
            const t = setTimeout(() => setShow(true), 600);
            return () => clearTimeout(t);
        }
        if (user.role === "customer") router.replace("/mon-espace#orders");
        else setShow(true);
    }, [user, router]);

    return show ? <OrdersPanel /> : null;
}
