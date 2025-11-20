"use client"

import { motion } from "framer-motion"
import { Heart, Target, Leaf, Sparkles, Users } from "lucide-react"
import { useRouter } from "next/navigation"
export default function MissionPage() {
  const router = useRouter()
  return (
    <main className="relative min-h-screen bg-gradient-to-b from-[#fff9fb] via-white to-[#fff5fa] text-[#0F172A] overflow-hidden">
      {/* Déco orbes */}
      <motion.div
        className="absolute top-10 left-20 w-72 h-72 bg-[#FF6EA9]/20 rounded-full blur-3xl"
        animate={{ y: [0, 25, 0], opacity: [0.4, 0.7, 0.4] }}
        transition={{ repeat: Infinity, duration: 8 }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-80 h-80 bg-[#FF6EA9]/30 rounded-full blur-3xl"
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
          Notre <span className="text-[#FF6EA9]">mission</span> est une promesse.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="mt-6 text-gray-600 max-w-2xl mx-auto text-lg"
        >
          Chez <span className="text-[#FF6EA9] font-medium">E-Doto Family</span>, nous croyons que chaque femme mérite une santé intime, une maternité et un bien-être entourés de respect, de science et de beauté.
        </motion.p>
      </section>

      {/* MISSION */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-2">
            <Target className="text-[#FF6EA9]" /> Notre mission
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Apporter à chaque femme et chaque famille un accompagnement de qualité à travers des produits et services
            centrés sur la santé sexuelle et reproductive, la maternité et le bien-être corporel.
            <br /><br />
            Nous voulons réconcilier science, nature et élégance, pour une expérience de soin douce, sincère et innovante.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white/60 backdrop-blur-xl border border-[#ffd6e8]/70 rounded-3xl shadow-lg p-6"
        >
          <img
            src="/images/mission-hero.avif"
            alt="Mission E-Doto"
            className="rounded-2xl w-full h-64 object-cover"
          />
        </motion.div>
      </section>

      {/* VISION */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white/60 backdrop-blur-xl border border-[#ffd6e8]/70 rounded-3xl shadow-lg p-6 order-2 md:order-1"
        >
          <img
            src="/images/vision.png"
            alt="Vision E-Doto"
            className="rounded-2xl w-full h-64 object-cover"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="order-1 md:order-2"
        >
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-2">
            <Leaf className="text-[#FF6EA9]" /> Notre vision
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Devenir une référence panafricaine dans la santé sexuelle et le bien-être, en combinant innovation, durabilité et inclusion.
            <br /><br />
            Nous imaginons un monde où le soin intime et la maternité sont abordés avec fierté, élégance et savoir.
          </p>
        </motion.div>
      </section>

      {/* ENGAGEMENT */}
      <section className="max-w-5xl mx-auto text-center px-6 py-24">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl font-bold mb-6"
        >
          Nos <span className="text-[#FF6EA9]">engagements</span>.
        </motion.h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-12">
          Nous ne sommes pas qu’une marque, nous sommes une communauté qui s’engage pour l’éducation, la santé et la confiance féminine.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: <Heart className="text-[#FF6EA9]" size={28} />,
              title: "Bienveillance & respect",
              text: "Chaque produit est conçu avec amour, dans le respect du corps et de l’environnement."
            },
            {
              icon: <Sparkles className="text-[#FF6EA9]" size={28} />,
              title: "Innovation & élégance",
              text: "Nous allions la technologie et la beauté pour offrir une expérience sensorielle unique."
            },
            {
              icon: <Users className="text-[#FF6EA9]" size={28} />,
              title: "Communauté & partage",
              text: "Nous bâtissons des ponts entre femmes, familles et experts pour grandir ensemble."
            }
          ].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.03 }}
              className="p-6 rounded-3xl bg-white/70 backdrop-blur-md border border-[#ffd6e8]/60 shadow-md text-left"
            >
              <div className="mb-4">{item.icon}</div>
              <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{item.text}</p>
            </motion.div>
          ))}
        </div>
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
