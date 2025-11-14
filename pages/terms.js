"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  FileText,
  ShieldCheck,
  CreditCard,
  Repeat,
  AlertTriangle,
  BookOpen,
  Globe,
  Mail,
} from "lucide-react"
import { useRouter } from "next/navigation"
export default function TermsPage() {
  const router = useRouter()
  const updatedAt = "7 novembre 2025"

  const SECTIONS = [
    {
      id: "acceptance",
      title: "1. Acceptation des présentes conditions",
      icon: FileText,
      content: `En accédant et en utilisant le site et les services E·Doto Family (ci-après "E·Doto"), vous
        acceptez d'être lié par les présentes Conditions d'utilisation. Si vous n'êtes pas d'accord, merci de ne pas utiliser nos services.`,
    },
    {
      id: "eligibility",
      title: "2. Eligibilité et responsabilité utilisateur",
      icon: ShieldCheck,
      content: `Vous déclarez être majeur selon la législation applicable dans votre pays et capable légalement de conclure des contrats.
        Vous acceptez d'utiliser le site conformément aux lois et de ne pas soumettre de contenu illégal.`,
    },
    {
      id: "products",
      title: "3. Produits et informations",
      icon: BookOpen,
      content: `Nous faisons notre possible pour afficher des descriptions et images fidèles. Cependant, certaines variations (coloris, conditionnement)
        peuvent exister. Les informations fournies (posologies, composition) ne remplacent pas un avis médical.`,
    },
    {
      id: "orders_payments",
      title: "4. Commandes & Paiements",
      icon: CreditCard,
      content: `La validation d'une commande vaut acceptation du prix et des présentes conditions. Les paiements sont sécurisés via nos prestataires.
        En cas de refus de paiement, la commande pourra être annulée.`,
    },
    {
      id: "refunds",
      title: "5. Remboursements & retours",
      icon: Repeat,
      content: `Les retours et remboursements sont traités selon notre politique (produits non ouverts, délais spécifiques). Certains produits de santé peuvent être non remboursables pour des raisons d'hygiène.`,
    },
    {
      id: "prescription",
      title: "6. Produits sous prescription",
      icon: AlertTriangle,
      content: `Certains médicaments ou produits peuvent nécessiter une ordonnance. Si un produit requiert une prescription, vous en serez informé et la commande pourra être soumise à vérification.`,
    },
    {
      id: "privacy",
      title: "7. Protection des données",
      icon: ShieldCheck,
      content: `La confidentialité de vos données est primordiale. Consultez notre Politique de confidentialité pour connaître vos droits, la durée de conservation et les usages de vos données.`,
    },
    {
      id: "ip",
      title: "8. Propriété intellectuelle",
      icon: FileText,
      content: `Tous les contenus du site (textes, images, logos, codes) sont la propriété d'E·Doto ou de ses partenaires.
        Toute reproduction sans autorisation est interdite.`,
    },
    {
      id: "liability",
      title: "9. Limitation de responsabilité",
      icon: AlertTriangle,
      content: `Dans la mesure permise par la loi, E·Doto ne pourra être tenu responsable des dommages indirects, perte de profit ou préjudice découlant de l'utilisation du site.`,
    },
    {
      id: "law",
      title: "10. Loi applicable & juridiction",
      icon: Globe,
      content: `Les présentes conditions sont régies par la législation applicable au Bénin. En cas de litige, les tribunaux compétents seront ceux indiqués par la loi.`,
    },
    {
      id: "contact",
      title: "11. Contact",
      icon: Mail,
      content: `Pour toute question sur ces conditions : info@edotofamily.com / contact@edotofamily.com ou +229 67 69 81 91.`,
    },
  ]

  const [open, setOpen] = useState(SECTIONS[0].id)

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#fff9fb] via-white to-[#fff5fa] text-[#0F172A] py-12 px-6">
      {/* header */}
      <header className="max-w-4xl mx-auto text-center mb-8">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl font-semibold tracking-tight"
        >
          Termes et conditions d'utilisation
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="mt-4 text-gray-600 max-w-2xl mx-auto"
        >
          Veuillez lire attentivement ces conditions. Elles régissent votre accès aux services et produits fournis par E·Doto Family.
        </motion.p>

        <div className="mt-4 inline-flex items-center gap-3 text-sm text-gray-500 bg-white/60 backdrop-blur-md px-4 py-2 rounded-full border border-[#ffd6e8]/60 shadow-sm">
          <span>Dernière mise à jour :</span>
          <strong className="text-[#FF6EA9]">{updatedAt}</strong>
        </div>
      </header>

      <section className="max-w-5xl mx-auto grid lg:grid-cols-3 gap-8">
        {/* left: intro + toc */}
        <aside className="lg:col-span-1">
          <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-[#ffd6e8]/60 shadow-sm sticky top-6">
            <p className="text-gray-600 mb-4">
              Ces conditions organisent la relation entre E·Doto Family et ses utilisateurs. Elles expliquent vos droits et responsabilités.
            </p>

            <nav className="mt-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Sommaire</h4>
              <ul className="space-y-2 text-sm">
                {SECTIONS.map((s) => (
                  <li key={s.id}>
                    <button
                      onClick={() => setOpen(s.id)}
                      className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg transition ${open === s.id ? "bg-[#FF6EA9]/10 text-[#FF6EA9]" : "hover:bg-white/50"
                        }`}
                    >
                      <s.icon size={16} />
                      <span>{s.title.replace(/^\d+\.\s*/, "")}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </aside>

        {/* main: accordion content */}
        <article className="lg:col-span-2 space-y-4">
          {SECTIONS.map((s, idx) => {
            const Icon = s.icon
            const isOpen = open === s.id
            return (
              <motion.section
                key={s.id}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.03 }}
                className="bg-white/70 backdrop-blur-md border border-[#ffd6e8]/60 rounded-2xl shadow-sm overflow-hidden"
              >
                <button
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : s.id)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-[#FF6EA9]/10 text-[#FF6EA9]">
                      <Icon size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{s.title}</h3>
                      <p className="text-sm text-gray-500 mt-1 hidden md:block">{s.content.slice(0, 120)}...</p>
                    </div>
                  </div>

                  <div className="text-sm text-gray-500">{isOpen ? "Masquer" : "Lire"}</div>
                </button>

                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={isOpen ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="px-6 pb-5"
                >
                  <div className="text-sm text-gray-700 leading-relaxed py-2">{s.content}</div>
                </motion.div>
              </motion.section>
            )
          })}

          {/* Footer legal quicknotes */}
          <div className="mt-6 text-xs text-gray-500">
            <p className="mb-2">
              Ces conditions peuvent être modifiées. La version publiée sur ce site fait foi. En cas de modification substantielle, nous vous en informerons par email.
            </p>
            <p>
              Pour toute question juridique : <strong className="text-[#FF6EA9]">legal@edotofamily.com</strong>
            </p>
          </div>
        </article>
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
