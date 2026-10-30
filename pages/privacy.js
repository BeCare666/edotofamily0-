"use client"

import { motion } from "framer-motion"
import { ShieldCheck, Lock, Eye, Heart } from "lucide-react"
import { useRouter } from "next/navigation"

export default function PrivacyPage() {
  const router = useRouter()

  // Politique mise à jour le 30/10/2026 selon l'autorisation APDP n° 2026-327/AT/APDP/DST/SC du 25 juin 2026
  // (points a à f) ; chaque point décrit ce que fait réellement la plateforme.
  const legalSections = [
    {
      title: "Responsable du traitement",
      text: `Le responsable du traitement des données collectées sur la plateforme edotofamily.com est :
SODINYESSI Sènou Gérard, PDG de BeCare, la startup E.doto family
Email : becare.fr.ge@gmail.com
Téléphone : +229 01 67698191
Ville : Cotonou, République du Bénin.

Traitement autorisé par l'Autorité de Protection des Données à caractère Personnel (APDP) :
autorisation n° 2026-327/AT/APDP/DST/SC du 25 juin 2026.`,
    },
    {
      title: "Données collectées",
      text: `Selon les services utilisés :
- compte : nom et prénoms, adresse e-mail, numéro de téléphone, date de naissance, sexe, ville, photo de profil ;
- commandes et paiements : produits, montants, point de retrait choisi, référence du paiement FeexPay (aucun numéro de carte ni code mobile money n'est conservé par E.doto family) ;
- kits gratuits des campagnes : demande, point de retrait, empreintes techniques de l'appareil servant à limiter une demande par personne ;
- santé (téléconsultation, adoption d'un contraceptif, suivi) : comptes rendus, notes et rapports, chiffrés dans la base de données ;
- assistant SSR : questions et réponses, sans nom ni adresse IP, chiffrées et supprimées après 90 jours ;
- traces de connexion : voir la section « Cookies et traces de connexion ».`,
    },
    {
      title: "Finalités du traitement",
      text: `Les données servent à :
- créer et gérer les comptes ;
- traiter les commandes, les paiements, les retraits et les commissions des points de retrait ;
- organiser les campagnes de kits gratuits ;
- permettre les téléconsultations, les orientations vers un centre et le suivi d'une contraception ;
- répondre aux questions sur la santé sexuelle et reproductive (assistant SSR) ;
- envoyer les e-mails et SMS liés à ces services ;
- assurer la sécurité de la plateforme et des comptes.`,
    },
    {
      title: "Base légale et consentement",
      text: `Le traitement repose sur votre consentement, recueilli lors de l'inscription, et sur l'exécution des services que vous demandez.
Vous consentez librement à la collecte et au transfert des données décrits ici ; vous pouvez retirer ce consentement à tout moment (voir « Vos droits »), ce qui entraîne la fermeture du compte.`,
    },
    {
      title: "Durée de conservation",
      text: `Vos données sont conservées tant que votre compte est actif, puis au plus six (06) mois à compter du moment où il est constaté que vous n'êtes plus actif sur la plateforme ; elles sont ensuite supprimées ou rendues anonymes.
Les échanges avec l'assistant SSR sont supprimés après 90 jours.
Les pièces que la loi oblige à garder plus longtemps (factures, paiements) sont conservées pour la seule durée légale.`,
    },
    {
      title: "Destinataires et sous-traitants",
      text: `Les données ne sont jamais vendues. Seules les personnes habilitées y accèdent : l'équipe E.doto family, et pour un dossier de santé, le médecin et le centre concernés (chaque ouverture d'un dossier est enregistrée).
Prestataires techniques, agissant comme sous-traitants :
- Vercel : hébergement du site et de l'administration ;
- Render : hébergement du serveur (API) ;
- TiDB Cloud : base de données (Europe, Allemagne) ;
- Cloudinary : stockage des images et des factures ;
- Brevo : envoi des e-mails et des SMS ;
- FeexPay : paiements mobile money et carte ;
- Groq : réponses de l'assistant SSR (questions transmises sans identité) ;
- Jitsi (meet.jit.si) : visioconférence des téléconsultations ;
- OpenStreetMap : carte et calcul d'itinéraire vers les points de retrait.`,
    },
    {
      title: "Transfert des données hors du Bénin",
      text: `Plusieurs prestataires ci-dessus hébergent les données hors du Bénin, notamment dans l'Union européenne et aux États-Unis.
Ces transferts sont nécessaires au fonctionnement des services ; vous y consentez librement en créant votre compte, et pouvez retirer ce consentement en demandant la fermeture du compte.`,
    },
    {
      id: "cookies",
      title: "Cookies et traces de connexion",
      text: `E.doto family n'utilise aucun outil de mesure d'audience ni de publicité. Seuls des traceurs nécessaires au fonctionnement sont utilisés, pour soixante (60) jours au plus :
- cookie « edoto_device_id » (60 jours) : limiter les demandes de kits gratuits à une par personne et par campagne ;
- stockage du navigateur : votre session (fermée après 5 minutes d'inactivité), la reconnaissance de votre appareil après le code reçu par e-mail (30 jours), vos préférences d'affichage.
Traces côté serveur, pour la sécurité : chaque requête (méthode, adresse masquée, résultat, durée, sans adresse IP) ; l'ouverture d'un dossier de santé et les actions faites dans l'administration (compte, date, adresse IP).`,
    },
    {
      title: "Sécurité",
      text: `Connexions chiffrées (HTTPS, TLS vers la base), données de santé chiffrées (AES-256), mots de passe stockés sous forme illisible, session fermée après 5 minutes d'inactivité, code reçu par e-mail lors d'une connexion depuis un nouvel appareil.`,
    },
  ]

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-[#fff9fb] via-white to-[#fff3f8] text-[#0F172A] overflow-hidden px-6 py-20">

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
          Chez <span className="font-semibold text-[#FF6EA9]">E.doto family</span>,
          la protection de vos données personnelles n’est pas qu’une obligation :
          c’est un engagement d’amour, de respect et de transparence.
        </motion.p>
      </section>

      {/* SECTIONS PRINCIPALES */}
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
            text: "Les données collectées servent uniquement à améliorer votre expérience : commandes, accompagnement personnalisé et services de bien-être.",
          },
          {
            icon: <Eye size={36} className="text-[#FF6EA9]" />,
            title: "Transparence totale",
            text: "Vous savez toujours quelles données sont utilisées, pourquoi et comment. Rien n’est caché, tout est clair, simple et accessible.",
          },
          {
            icon: <Heart size={36} className="text-[#FF6EA9]" />,
            title: "Respect de votre vie privée",
            text: "Vos données ne seront jamais revendues ni partagées sans votre consentement.",
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

      {/* SECTIONS JURIDIQUES */}
      <section className="max-w-5xl mx-auto mt-24 grid md:grid-cols-2 gap-12">
        {legalSections.map((section, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: i * 0.15 }}
            id={section.id}
            className="scroll-mt-24 bg-white/70 backdrop-blur-lg border border-[#ffd6e8]/60 rounded-3xl p-8 shadow-md"
          >
            <h3 className="text-xl font-semibold mb-4 text-[#0F172A]">
              {section.title}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
              {section.text}
            </p>
          </motion.div>
        ))}
      </section>

      {/* DROITS UTILISATEURS */}
      <section className="max-w-4xl mx-auto text-center mt-28">
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-3xl font-bold mb-6"
        >
          Vos droits, notre responsabilité.
        </motion.h3>

        <p className="text-gray-600 mb-4 leading-relaxed">
          Conformément aux articles 437, 438, 440, 441 et 443 du Code du numérique, vous disposez des droits
          d’accès, de portabilité, d’opposition, de rectification et de suppression de vos données,
          ainsi que du droit à l’effacement et à l’oubli.
        </p>
        <p className="text-gray-600 mb-6 leading-relaxed text-left sm:text-center">
          Pour les exercer : écrivez-nous à l’adresse ci-dessous en précisant le droit concerné et l’adresse e-mail de votre compte ;
          vous pouvez aussi corriger vous-même vos informations dans « Mon profil ». Vous pouvez également saisir l’APDP (www.apdp.bj).
        </p>

        <p className="text-gray-600 mb-6">
          Contact :{" "}
          <span className="text-[#FF6EA9] font-medium">
            contact@edotofamily.com
          </span>
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          className="hidden px-8 py-3 rounded-full bg-[#FF6EA9] text-white font-semibold shadow-md hover:bg-[#ff589d] transition-all"
        >
          Contacter notre équipe
        </motion.button>
      </section>

      {/* CITATION */}
      <section className="relative text-center py-24">
        <motion.blockquote
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="max-w-3xl mx-auto text-2xl italic text-gray-700 leading-relaxed"
        >
          “La confiance est le premier soin que nous offrons à nos utilisateurs.”
          <footer className="mt-4 text-sm text-gray-500">
            L’équipe E.doto family
          </footer>
        </motion.blockquote>
      </section>

      {/* BOUTON RETOUR */}
      <motion.button
        onClick={() => router.back()}
        className="!hidden fixed bottom-8 left-8 z-50 w-14 h-14 rounded-full bg-[#FF6EA9]/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg hover:shadow-2xl hover:scale-110 transition-all"
        whileHover={{ rotate: -5 }}
        whileTap={{ scale: 0.9 }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="#FF6EA9"
          className="w-7 h-7"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </motion.button>
    </main>
  )
}