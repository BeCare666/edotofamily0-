"use client"

import { motion } from "framer-motion"
import { Globe, HeartHandshake, Leaf, Lightbulb, Users, Sparkles, Heart } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
export default function ObjectifsPage() {
  const router = useRouter()
  return (
    <main className="relative min-h-screen bg-gradient-to-b from-[#fff9fb] via-white to-[#fff3f8] text-[#0F172A] overflow-hidden">
      {/* Orbes décoratives */}
      <motion.div
        className="absolute top-10 right-20 w-72 h-72 bg-[#FF6EA9]/20 rounded-full blur-3xl"
        animate={{ y: [0, 25, 0], opacity: [0.4, 0.7, 0.4] }}
        transition={{ repeat: Infinity, duration: 8 }}
      />
      <motion.div
        className="absolute bottom-20 left-10 w-96 h-96 bg-[#FF6EA9]/30 rounded-full blur-3xl"
        animate={{ y: [0, -20, 0], opacity: [0.5, 0.8, 0.5] }}
        transition={{ repeat: Infinity, duration: 10 }}
      />

      {/* HERO */}
      <section className="relative text-center py-24 px-6">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-5xl sm:text-6xl font-semibold tracking-tight leading-tight"
        >
          Nos <span className="text-[#FF6EA9]">objectifs</span> tracent notre avenir.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="mt-6 text-gray-600 max-w-2xl mx-auto text-lg"
        >
          E·Doto Family s’engage à transformer durablement la perception de la santé féminine,
          à inspirer confiance et à offrir des solutions douces et puissantes à la fois.
        </motion.p>
      </section>

      {/* OBJECTIFS */}
      <section className="max-w-6xl mx-auto px-6 py-20 grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {[
          {
            icon: <HeartHandshake className="text-[#FF6EA9]" size={30} />,
            title: "Accompagner avec bienveillance",
            text: "Offrir à chaque femme une écoute et un accompagnement personnalisé, à travers des solutions naturelles et respectueuses."
          },
          {
            icon: <Lightbulb className="text-[#FF6EA9]" size={30} />,
            title: "Innover pour la santé féminine",
            text: "Créer des expériences uniques qui marient science, émotion et nature."
          },
          {
            icon: <Users className="text-[#FF6EA9]" size={30} />,
            title: "Créer une communauté solidaire",
            text: "Bâtir un espace d’échange et d’inspiration autour du bien-être intime et de la confiance."
          },
          {
            icon: <Leaf className="text-[#FF6EA9]" size={30} />,
            title: "Promouvoir la durabilité",
            text: "Utiliser des ressources écoresponsables et des méthodes de production respectueuses de l’environnement."
          },
          {
            icon: <Globe className="text-[#FF6EA9]" size={30} />,
            title: "Rayonner à l’échelle africaine",
            text: "Partager la vision d’E·Doto au-delà des frontières, en portant haut la santé et le bien-être féminin."
          },
          {
            icon: <Sparkles className="text-[#FF6EA9]" size={30} />,
            title: "Sublimer la beauté naturelle",
            text: "Mettre en lumière la puissance du soin intérieur, où chaque geste devient un acte d’amour pour soi."
          }
        ].map((item, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.04 }}
            className="p-8 rounded-3xl bg-white/70 backdrop-blur-md border border-[#ffd6e8]/60 shadow-md hover:shadow-xl transition-all text-center"
          >
            <div className="flex justify-center mb-4">{item.icon}</div>
            <h3 className="font-semibold text-lg mb-3">{item.title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{item.text}</p>
          </motion.div>
        ))}
      </section>

      {/* SECTION INSPIRATION */}
      <section className="text-center py-24 px-6 bg-gradient-to-b from-[#fff0f6] to-transparent">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl font-bold mb-6"
        >
          Une vision <span className="text-[#FF6EA9]">durable</span> & <span className="text-[#FF6EA9]">humaine</span>.
        </motion.h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-10">
          Nos objectifs guident chaque création.
          Car pour nous, la santé féminine est une **mission de cœur**, pas une simple tendance.
        </p>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="inline-block px-8 py-3 bg-[#FF6EA9] text-white font-semibold rounded-full shadow-md hover:bg-[#ff589d] transition-all"
        >
          Rejoindre la mission
        </motion.div>
      </section>

      {/* ✨ SECTION SIGNATURE (IMMERSIVE) */}
      <section className="relative w-full h-[70vh] flex items-center justify-center overflow-hidden bg-[#fff7fa]">
        <Image
          src="/images/woman-soft-bg.avif"
          alt="Vision féminine"
          fill
          className="object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/90" />

        {/* Citation poétique */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative z-10 max-w-3xl text-center px-6"
        >
          <Heart size={32} className="text-[#FF6EA9] mx-auto mb-4" />
          <h3 className="text-3xl sm:text-4xl font-semibold text-[#0F172A] leading-snug mb-4">
            “Chaque soin, chaque produit, chaque mot d’E·Doto
            est une déclaration d’amour à la féminité.”
          </h3>
          <p className="text-gray-500">— L’équipe E·Doto Family</p>
        </motion.div>

        {/* Orbes de lumière */}
        <motion.div
          className="absolute w-80 h-80 bg-[#FF6EA9]/30 rounded-full blur-3xl top-10 left-20"
          animate={{ y: [0, 20, 0], opacity: [0.4, 0.6, 0.4] }}
          transition={{ repeat: Infinity, duration: 8 }}
        />
        <motion.div
          className="absolute w-60 h-60 bg-[#ffbcd5]/40 rounded-full blur-3xl bottom-10 right-10"
          animate={{ y: [0, -25, 0], opacity: [0.5, 0.7, 0.5] }}
          transition={{ repeat: Infinity, duration: 10 }}
        />
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
