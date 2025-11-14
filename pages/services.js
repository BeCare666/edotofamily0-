"use client"

import { motion } from "framer-motion"
import { HeartPulse, Stethoscope, Baby, Flower2, Sparkles, HandHeart, ShieldCheck, Droplet } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
export default function ServicesPage() {
    const router = useRouter()
    return (
        <main className="relative min-h-screen bg-gradient-to-b from-[#fff9fb] via-white to-[#fff3f8] text-[#0F172A] overflow-hidden">
            {/* Orbes décoratives */}
            <motion.div
                className="absolute top-10 left-10 w-72 h-72 bg-[#FF6EA9]/20 rounded-full blur-3xl"
                animate={{ y: [0, 30, 0], opacity: [0.5, 0.8, 0.5] }}
                transition={{ repeat: Infinity, duration: 7 }}
            />
            <motion.div
                className="absolute bottom-10 right-10 w-96 h-96 bg-[#FF6EA9]/25 rounded-full blur-3xl"
                animate={{ y: [0, -30, 0], opacity: [0.4, 0.6, 0.4] }}
                transition={{ repeat: Infinity, duration: 9 }}
            />

            {/* HERO */}
            <section className="relative text-center py-28 px-6">
                <motion.h1
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="text-5xl sm:text-6xl font-semibold tracking-tight leading-tight"
                >
                    Nos <span className="text-[#FF6EA9]">Services</span> :
                    un univers de soins et de confiance.
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 1 }}
                    className="mt-6 text-gray-600 max-w-2xl mx-auto text-lg"
                >
                    E·Doto vous accompagne à chaque étape de votre bien-être : de la santé intime à la maternité,
                    avec élégance, innovation et douceur.
                </motion.p>
            </section>

            {/* SERVICES */}
            <section className="max-w-6xl mx-auto px-6 pb-24 grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
                {[
                    {
                        icon: <HeartPulse size={34} className="text-[#FF6EA9]" />,
                        title: "Santé intime & fertilité",
                        text: "Des soins délicats et adaptés pour comprendre, renforcer et harmoniser votre santé reproductive."
                    },
                    {
                        icon: <Baby size={34} className="text-[#FF6EA9]" />,
                        title: "Accompagnement grossesse",
                        text: "Des produits et conseils personnalisés pour vivre votre maternité avec sérénité, beauté et équilibre."
                    },
                    {
                        icon: <Stethoscope size={34} className="text-[#FF6EA9]" />,
                        title: "Consultation bien-être",
                        text: "Un espace d’écoute et d’orientation autour du corps, des émotions et de la santé globale féminine."
                    },
                    {
                        icon: <Flower2 size={34} className="text-[#FF6EA9]" />,
                        title: "Soins corporels et rituels",
                        text: "Des rituels de soins sensoriels et réparateurs inspirés des traditions et de la science moderne."
                    },
                    {
                        icon: <ShieldCheck size={34} className="text-[#FF6EA9]" />,
                        title: "Protection & prévention",
                        text: "Des solutions respectueuses pour se protéger, se comprendre et prévenir avec bienveillance."
                    },
                    {
                        icon: <HandHeart size={34} className="text-[#FF6EA9]" />,
                        title: "Soutien émotionnel",
                        text: "Une approche holistique du bien-être, où la santé émotionnelle est au cœur du soin féminin."
                    }
                ].map((service, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ scale: 1.05 }}
                        className="p-8 rounded-3xl bg-white/70 backdrop-blur-md border border-[#ffd6e8]/60 shadow-md hover:shadow-xl transition-all"
                    >
                        <div className="flex justify-center mb-5">{service.icon}</div>
                        <h3 className="text-lg font-semibold mb-3 text-[#0F172A]">{service.title}</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">{service.text}</p>
                    </motion.div>
                ))}
            </section>

            {/* SECTION EXPÉRIENCE SENSORIELLE */}
            <section className="relative w-full py-28 px-6 bg-gradient-to-b from-[#fff0f6] to-transparent text-center overflow-hidden">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="max-w-3xl mx-auto"
                >
                    <Sparkles className="text-[#FF6EA9] mx-auto mb-5" size={34} />
                    <h2 className="text-4xl font-bold mb-6">
                        Une expérience <span className="text-[#FF6EA9]">sensorielle</span> du soin.
                    </h2>
                    <p className="text-gray-600 text-lg mb-10">
                        Chez E·Doto, chaque service est une immersion dans un univers doux et lumineux,
                        où le corps et l’esprit se rencontrent dans un équilibre harmonieux.
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        className="px-8 py-3 rounded-full bg-[#FF6EA9] text-white font-semibold shadow-md hover:bg-[#ff589d] transition-all"
                    >
                        Découvrir nos centres partenaires
                    </motion.button>
                </motion.div>

                {/* Orbes lumineuses */}
                <motion.div
                    className="absolute w-96 h-96 bg-[#FF6EA9]/30 rounded-full blur-3xl top-10 right-10"
                    animate={{ y: [0, 25, 0], opacity: [0.5, 0.7, 0.5] }}
                    transition={{ repeat: Infinity, duration: 9 }}
                />
                <motion.div
                    className="absolute w-80 h-80 bg-[#ffc4dc]/40 rounded-full blur-3xl bottom-10 left-10"
                    animate={{ y: [0, -25, 0], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ repeat: Infinity, duration: 8 }}
                />
            </section>

            {/* IMAGE SIGNATURE */}
            <section className="relative h-[70vh] w-full flex items-center justify-center overflow-hidden">
                <Image
                    src="/images/service-bg.avif"
                    alt="E·Doto Service"
                    fill
                    className="object-cover opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/90" />

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="relative z-10 text-center px-6 max-w-3xl"
                >
                    <Droplet className="text-[#FF6EA9] mx-auto mb-5" size={34} />
                    <h3 className="text-3xl sm:text-4xl font-semibold text-[#0F172A] mb-4">
                        “Prendre soin de soi, c’est écrire chaque jour un poème sur son corps.”
                    </h3>
                    <p className="text-gray-500">— L’équipe E·Doto Family</p>
                </motion.div>
            </section>
            {/* Bouton retour flottant */}
            <motion.button
                onClick={() => router.back()}
                className="fixed bottom-8 left-8 z-50 w-14 h-14 rounded-full bg-[#FF6EA9]/20 backdrop-blur-md border border-white/30 
             flex items-center justify-center shadow-lg hover:shadow-2xl hover:scale-110 transition-all"
                whileHover={{ rotate: -5 }}
                whileTap={{ scale: 0.9 }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#FF6EA9" className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
            </motion.button>
        </main>
    )
}
