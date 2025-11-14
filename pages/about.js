"use client"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { HeartPulse, Baby, Droplet } from "lucide-react"
import { useRouter } from "next/navigation"
export default function AProposPage() {
  const router = useRouter()
  return (
    <main className="relative overflow-hidden bg-gradient-to-b from-[#fff9fb] via-[#fff] to-[#fef6fa] text-[#0F172A]">

      {/* Animated background gradient */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(255,110,169,0.07),transparent_70%)] animate-pulse"></div>

      {/* HERO */}
      <section className="relative flex flex-col items-center justify-center min-h-[80vh] text-center px-8">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-5xl sm:text-6xl font-semibold tracking-tight leading-tight max-w-3xl"
        >
          Une vision nouvelle du <span className="text-[#FF6EA9]">bien-être féminin</span>.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="mt-6 text-gray-600 max-w-xl text-lg"
        >
          Edoto Family propose des produits naturels et de qualité pour la fertilité, la grossesse, la maternité et la santé des femmes.
        </motion.p>

        {/* Floating decorative orbs — version premium visible */}
        <motion.div
          className="absolute top-20 left-10 w-48 h-48 bg-[#FF6EA9]/25 rounded-full blur-[120px] shadow-[0_0_60px_30px_rgba(255,110,169,0.25)]"
          animate={{ y: [0, 25, 0], opacity: [0.6, 0.9, 0.6], scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
        />

        <motion.div
          className="absolute bottom-16 right-16 w-56 h-56 bg-gradient-to-br from-[#FF6EA9]/30 via-[#FF9FC9]/30 to-white/20 rounded-full blur-[130px] shadow-[0_0_70px_40px_rgba(255,150,200,0.25)]"
          animate={{ y: [0, -30, 0], opacity: [0.5, 0.8, 0.5], rotate: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 9, ease: "easeInOut" }}
        />

        <motion.div
          className="absolute top-1/3 right-1/3 w-32 h-32 bg-white/50 rounded-full blur-[80px] mix-blend-overlay"
          animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
        />

      </section>

      {/* STORY SECTIONS */}
      <section className="relative space-y-32 py-16 px-8">
        {/* Bloc 1 */}
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center text-center"
        >
          <div className="w-52 h-52 relative mb-6">
            <Image src="/images/sante1800.jpg" alt="santé" fill className="object-cover rounded-full shadow-2xl" />
          </div>
          <HeartPulse size={28} className="text-[#FF6EA9] mb-3" />
          <h2 className="text-2xl font-semibold mb-3">Santé sexuelle & reproductive</h2>
          <p className="max-w-lg text-gray-600">
            Une approche moderne et bienveillante. Nos formules honorent le corps féminin, sans compromis entre élégance et efficacité.
          </p>
        </motion.div>

        {/* Bloc 2 */}
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center text-center"
        >
          <div className="w-52 h-52 relative mb-6">
            <Image src="/images/grossesse.jpg" alt="grossesse" fill className="object-cover rounded-full shadow-2xl" />
          </div>
          <Baby size={28} className="text-[#FF6EA9] mb-3" />
          <h2 className="text-2xl font-semibold mb-3">Grossesse & maternité</h2>
          <p className="max-w-lg text-gray-600">
            Le corps change, le cœur s’élargit. Nous créons des soins d’une douceur infinie, pensés pour accompagner chaque transformation avec amour.
          </p>
        </motion.div>

        {/* Bloc 3 */}
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center text-center"
        >
          <div className="w-52 h-52 relative mb-6">
            <Image src="/images/twopersons.avif" alt="soins" fill className="object-cover rounded-full shadow-2xl" />
          </div>
          <Droplet size={28} className="text-[#FF6EA9] mb-3" />
          <h2 className="text-2xl font-semibold mb-3">Soins & bien-être</h2>
          <p className="max-w-lg text-gray-600">
            De la peau à l’esprit, E·Doto imagine une beauté vivante, sensorielle, en harmonie avec les cycles naturels du corps.
          </p>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="relative py-24 text-center px-8 bg-gradient-to-b from-[#fff0f7] to-transparent">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <h3 className="text-3xl font-semibold mb-4">
            Explorez l’univers <span className="text-[#FF6EA9]">E·Doto</span>
          </h3>
          <p className="text-gray-600 max-w-md mx-auto mb-8">
            Des soins, des émotions, des cycles. Découvrez une nouvelle approche du bien-être féminin.
          </p>
          <Link
            href="/categories"
            className="px-8 py-3 bg-[#FF6EA9] text-white font-semibold rounded-full shadow-md hover:bg-[#ff589d] transition-all"
          >
            Découvrir nos produits
          </Link>
        </motion.div>
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

      </section>
    </main>
  )
}
