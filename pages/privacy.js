"use client"

import { motion } from "framer-motion"
import { ShieldCheck, Lock, Eye, Heart } from "lucide-react"
import { useRouter } from "next/navigation"
export default function PrivacyPage() {
  const router = useRouter()
  return (
    <main className="relative min-h-screen bg-gradient-to-b from-[#fff9fb] via-white to-[#fff3f8] text-[#0F172A] overflow-hidden px-6 py-20">
      {/* Orbes lumineuses décoratives */}
      <motion.div
        className="absolute top-10 left-10 w-64 h-64 bg-[#FF6EA9]/20 rounded-full blur-3xl"
        animate={{ y: [0, 25, 0], opacity: [0.4, 0.7, 0.4] }}
        transition={{ repeat: Infinity, duration: 7 }}
      />
      <motion.div
        className="absolute bottom-10 right-10 w-96 h-96 bg-[#FF6EA9]/30 rounded-full blur-3xl"
        animate={{ y: [0, -30, 0], opacity: [0.5, 0.8, 0.5] }}
        transition={{ repeat: Infinity, duration: 9 }}
      />

      {/* HERO */}
      <section className="relative text-center max-w-4xl mx-auto mb-20">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-5xl sm:text-6xl font-semibold mb-6 tracking-tight leading-tight"
        >
          Votre <span className="text-[#FF6EA9]">confiance</span> est notre priorité.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1 }}
          className="text-gray-600 text-lg leading-relaxed"
        >
          Chez <span className="font-semibold text-[#FF6EA9]">E·Doto Family</span>, la protection de vos données personnelles n’est pas qu’une obligation — c’est un engagement d’amour, de respect et de transparence.
        </motion.p>
      </section>

      {/* SECTIONS DE POLITIQUE */}
      <section className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12">
        {[
          {
            icon: <ShieldCheck size={36} className="text-[#FF6EA9]" />,
            title: "Sécurité & confidentialité",
            text: "Vos informations sont traitées avec une sécurité renforcée. Nous utilisons des systèmes de chiffrement modernes et des protocoles stricts pour éviter tout accès non autorisé.",
          },
          {
            icon: <Lock size={36} className="text-[#FF6EA9]" />,
            title: "Collecte responsable",
            text: "Les données collectées servent uniquement à améliorer votre expérience : commandes, accompagnement personnalisé, et services de bien-être.",
          },
          {
            icon: <Eye size={36} className="text-[#FF6EA9]" />,
            title: "Transparence totale",
            text: "Vous savez toujours quelles données sont utilisées, pourquoi et comment. Rien n’est caché, tout est clair, simple et accessible.",
          },
          {
            icon: <Heart size={36} className="text-[#FF6EA9]" />,
            title: "Respect de votre vie privée",
            text: "Vos données ne seront jamais revendues ni partagées sans votre consentement. Vous restez la seule personne maître de votre identité numérique.",
          },
        ].map((section, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: i * 0.2 }}
            className="bg-white/70 backdrop-blur-lg border border-[#ffd6e8]/60 rounded-3xl p-8 shadow-md hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-3 mb-4">
              {section.icon}
              <h2 className="text-xl font-semibold text-[#0F172A]">{section.title}</h2>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">{section.text}</p>
          </motion.div>
        ))}
      </section>

      {/* SECTION — DROITS UTILISATEURS */}
      <section className="max-w-4xl mx-auto text-center mt-28">
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-3xl font-bold mb-6"
        >
          Vos droits, notre responsabilité.
        </motion.h3>
        <p className="text-gray-600 mb-6 leading-relaxed">
          Vous pouvez à tout moment demander la modification, la suppression ou la consultation de vos données.
          Écrivez-nous simplement à <span className="text-[#FF6EA9] font-medium">privacy@edotofamily.com</span> — nous répondrons avec bienveillance.
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          className="px-8 py-3 rounded-full bg-[#FF6EA9] text-white font-semibold shadow-md hover:bg-[#ff589d] transition-all"
        >
          Contacter notre équipe
        </motion.button>
      </section>

      {/* CITATION DE CLÔTURE */}
      <section className="relative text-center py-24">
        <motion.blockquote
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="max-w-3xl mx-auto text-2xl italic text-gray-700 leading-relaxed"
        >
          “La confiance est le premier soin que nous offrons à nos utilisateurs.”
          <footer className="mt-4 text-sm text-gray-500">— L’équipe E·Doto Family</footer>
        </motion.blockquote>
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
