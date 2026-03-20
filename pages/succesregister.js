"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { CheckCircle, Sparkles, MailCheck } from "lucide-react";
import { useEffect, useState } from "react";

export default function RegistrationSuccessPage() {
    const router = useRouter();

    const [email, setEmail] = useState(null);
    const [verified, setVerified] = useState(false);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        //sessionStorage.setItem("register_email", "becare.fr.ge@gmail.com");
        //sessionStorage.setItem("register_verified", "true");
        const storedEmail = sessionStorage.getItem("register_email");
        const storedVerified = sessionStorage.getItem("register_verified");

        if (!storedEmail && !storedVerified) {
             router.replace("/");
             return;
        }

        setEmail(storedEmail);
        setVerified(storedVerified === "true");
        setReady(true);
    }, [router]);

    if (!ready) return null;

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-white via-slate-50 to-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">

            {/* Background */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 0.18, scale: 1 }}
                transition={{ duration: 1.2 }}
                className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,110,169,0.35),transparent_60%)] pointer-events-none"
            />

            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9 }}
                className="absolute top-16 right-10 text-pink-400/40"
            >
                <Sparkles size={110} />
            </motion.div>

            {/* Card */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="max-w-lg w-full bg-white/85 backdrop-blur-xl rounded-[5px] p-10 border border-white/50 relative z-10 text-center"
            >
                {/* Icon */}
                <motion.div
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="flex items-center justify-center mb-6"
                >
                    {/*  
                    <CheckCircle className="w-20 h-20 text-emerald-500 drop-shadow-md " />
                    */}
                    <MailCheck className="w-20 h-20 text-emerald-500 drop-shadow-md " />
                </motion.div>

                {/* Title */}
                <motion.h1
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-4"
                >
                    {verified ? "Inscription réussie 🎉" : "Inscription réussie 🎉"}
                </motion.h1>

                {/* Message 
                <motion.p
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45, duration: 0.6 }}
                    className="text-slate-600 text-sm md:text-base leading-relaxed"
                >
                    {verified ? (
                        <>
                            Merci d’avoir confirmé votre adresse email.
                            <br /><br />
                            Votre compte <span className="font-semibold text-slate-800">E-Doto Family</span> est maintenant actif
                            et prêt à être utilisé en toute confidentialité.
                        </>
                    ) : (
                        <>
                            Votre compte <span className="font-semibold text-slate-800">E-Doto Family</span> a bien été créé.
                            <br /><br />
                            {email && (
                                <>
                                    Un message de confirmation a été envoyé à&nbsp;
                                    <span className="font-semibold text-slate-800 break-all">
                                        {email}
                                    </span>.
                                    <br /><br />
                                </>
                            )}
                            Veuillez cliquer sur le lien contenu dans l’email afin d’activer votre compte.
                        </>
                    )}
                </motion.p>
                */}
                <motion.p
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45, duration: 0.6 }}
                    className="text-slate-600 text-sm md:text-base leading-relaxed"
                >
                    Votre inscription sur <span className="font-semibold text-slate-800">E-Doto Family</span> a bien été prise en compte 🎉
                    <br /><br />

                    Afin d’activer votre compte et garantir la sécurité de vos informations,
                    nous vous avons envoyé un email de confirmation à l’adresse suivante :

                    {email && (
                        <>
                            <span className="block font-semibold text-slate-800 break-all mt-1">
                                {email}
                            </span>
                        </>
                    )}


                    Veuillez cliquer sur le lien contenu dans cet email pour finaliser votre inscription.
                </motion.p>


            </motion.div>
        </div>
    );
}
