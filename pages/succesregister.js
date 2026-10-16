"use client";

import { useRouter } from "next/navigation";
import { MailCheck } from "lucide-react";
import { useEffect, useState } from "react";
import AuthShell from "../components/auth/AuthShell";

export default function RegistrationSuccessPage() {
    const router = useRouter();

    const [email, setEmail] = useState(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const storedEmail = sessionStorage.getItem("register_email");
        const storedVerified = sessionStorage.getItem("register_verified");

        if (!storedEmail && !storedVerified) {
            router.replace("/");
            return;
        }

        setEmail(storedEmail);
        setReady(true);
    }, [router]);

    if (!ready) return null;

    // Même cadre que la connexion et l'inscription (16/10/2026) ; texte inchangé
    return (
        <AuthShell>
            <div className="text-center">
                <span className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF6F0] text-[#2F5D3A]">
                    <MailCheck size={30} strokeWidth={1.6} />
                </span>
                <h1 className="mb-4 text-2xl font-semibold tracking-tight text-[#1A1814]">Inscription réussie 🎉</h1>
                <p className="text-sm leading-relaxed text-[#57524B] md:text-base">
                    Votre inscription sur <span className="font-semibold text-[#1A1814]">E.doto family</span> a bien été prise en compte 🎉
                    <br /><br />

                    Afin d’activer votre compte et garantir la sécurité de vos informations,
                    nous vous avons envoyé un email de confirmation à l’adresse suivante :

                    {email && (
                        <span className="mt-1 block break-all font-semibold text-[#1A1814]">
                            {email}
                        </span>
                    )}

                    Veuillez cliquer sur le lien contenu dans cet email pour finaliser votre inscription.
                </p>
            </div>
        </AuthShell>
    );
}
