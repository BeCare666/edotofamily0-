"use client"

import { motion } from "framer-motion"
import { Mail, MapPin, Phone, Send, HeartHandshake } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { DEFAULT_MAP_URL, telHref, useSiteInfo } from "../lib/siteInfo"
export default function ContactPage() {
  const [sent, setSent] = useState(false)
  const info = useSiteInfo()
  const router = useRouter()
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#fff9fb] via-white to-[#fff5fa] text-[#0F172A] overflow-hidden relative">
      {/* Déco : orbes flottantes */}
      <motion.div
        className="absolute top-10 left-10 w-64 h-64 bg-[#FF6EA9]/20 rounded-full blur-3xl"
        animate={{ y: [0, 20, 0], opacity: [0.4, 0.6, 0.4] }}
        transition={{ repeat: Infinity, duration: 6 }}
      />
      <motion.div
        className="absolute bottom-10 right-20 w-80 h-80 bg-[#FF6EA9]/25 rounded-full blur-3xl"
        animate={{ y: [0, -30, 0], opacity: [0.5, 0.7, 0.5] }}
        transition={{ repeat: Infinity, duration: 8 }}
      />

      {/* SECTION HERO */}
      <section className="relative text-center py-24 px-6">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-5xl sm:text-6xl font-semibold tracking-tight leading-tight"
        >
          Entrons en <span className="text-[#FF6EA9]">connexion</span>.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="mt-6 text-gray-600 max-w-xl mx-auto text-lg"
        >
          Une question, une collaboration, un besoin de conseil ?
          L’équipe <span className="text-[#FF6EA9] font-medium">E.doto family</span> vous écoute avec bienveillance.
        </motion.p>
      </section>

      {/* SECTION CONTACT */}
      <section className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center pb-24">
        {/* FORMULAIRE */}
        <motion.form
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white/70 backdrop-blur-xl shadow-lg rounded-3xl p-8 border border-[#ffd6e8]/60"
          onSubmit={(e) => {
            e.preventDefault()
            setSent(true)
            setTimeout(() => setSent(false), 4000)
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <HeartHandshake className="text-[#FF6EA9]" size={28} />
            <h2 className="text-2xl font-bold">Écrivez-nous</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
              <input
                required
                type="text"
                className="w-full rounded-xl border border-[#ffd6e8] bg-white/50 px-4 py-3 focus:ring-2 focus:ring-[#FF6EA9]/30 outline-none transition"
                placeholder="Votre nom"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse e-mail</label>
              <input
                required
                type="email"
                className="w-full rounded-xl border border-[#ffd6e8] bg-white/50 px-4 py-3 focus:ring-2 focus:ring-[#FF6EA9]/30 outline-none transition"
                placeholder="vous@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                required
                rows="4"
                className="w-full rounded-xl border border-[#ffd6e8] bg-white/50 px-4 py-3 focus:ring-2 focus:ring-[#FF6EA9]/30 outline-none transition resize-none"
                placeholder="Écrivez votre message..."
              ></textarea>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="mt-6 flex items-center justify-center gap-2 bg-[#FF6EA9] text-white font-semibold px-6 py-3 rounded-full shadow-md hover:bg-[#ff4d8d] transition-all"
          >
            <Send size={18} /> Envoyer le message
          </motion.button>

          {sent && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-sm text-green-600"
            >
              ✅ Message envoyé avec succès !
            </motion.p>
          )}
        </motion.form>

        {/* INFOS DE CONTACT */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <h3 className="text-3xl font-bold mb-4">Nos coordonnées</h3>
          <p className="text-gray-600 max-w-md">
            Que ce soit pour un partenariat, un renseignement ou un suivi de produit,
            notre équipe est à votre écoute avec attention et douceur.
          </p>

          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-[#FF6EA9]/10 text-[#FF6EA9]">
                <Phone size={22} />
              </div>
              <a href={telHref(info.phone)} className="text-gray-800 font-medium hover:text-[#FF6EA9]">{info.phone}</a>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-[#FF6EA9]/10 text-[#FF6EA9]">
                <Mail size={22} />
              </div>
              <a href={`mailto:${info.email}`} className="text-gray-800 font-medium hover:text-[#FF6EA9]">{info.email}</a>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-[#FF6EA9]/10 text-[#FF6EA9]">
                <MapPin size={22} />
              </div>
              <p className="text-gray-800 font-medium">{info.address}</p>
            </div>
          </div>
        </motion.div>
      </section>
      {/* MAP INTEGREE */}
      <div className="relative overflow-hidden mb-5 m-5 border border-[#ffd6e8]/70 bg-white/60 backdrop-blur-md">
        <iframe
          title="E.doto family Location"
          src={info.map_url || DEFAULT_MAP_URL}
          width="100%"
          height="500"
          loading="lazy"
          style={{ border: "0" }}
          allowFullScreen
        ></iframe>
      </div>
      {/* Bouton retour flottant */}
      <motion.button
        onClick={() => router.back()}
        className="!hidden fixed bottom-8 left-8 z-50 w-14 h-14 rounded-full bg-[#FF6EA9]/20 backdrop-blur-md border border-white/30 
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
