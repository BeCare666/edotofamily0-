import { CalendarCheck2, HeartHandshake, Home, QrCode, ShoppingBag, User } from "lucide-react";

// Menu du dashboard jeune (/mon-espace), partagé avec le détail d'une commande (/orders/[id]) qui
// s'affiche dans le même cadre (30/10/2026).
export const YOUTH_MENU = [
    { key: "home", label: "Accueil", icon: Home },
    { key: "contraception", label: "Ma contraception", icon: HeartHandshake },
    { key: "appointments", label: "Mes rendez-vous", icon: CalendarCheck2 },
    { key: "referrals", label: "Mes orientations", icon: QrCode },
    { key: "orders", label: "Mes commandes et kits", icon: ShoppingBag },
    { key: "profile", label: "Mon profil", icon: User },
];
