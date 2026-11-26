import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Minus, Plus } from 'lucide-react';

// FAQ réécrite autour du parcours (26/11/2026, repositionnement écosystème).
// Chaque réponse décrit ce que fait réellement la plateforme (code vérifié le 26/11/2026).
// Avant : cinq questions de boutique en ligne (délais de livraison 24h à 48h et 3 à 5 jours, sans source).
// Conservées mot pour mot : « Les produits sont-ils certifiés ? » et « Puis-je retourner un produit ? ».
type QA = { question: string; answer: string };
type Group = { title: string; items: QA[] };

const GROUPS: Group[] = [
  {
    title: "Mon parcours",
    items: [
      {
        question: "Qu’est-ce que E.doto family ?",
        answer: "Le parcours de santé sexuelle et reproductive des jeunes, de la première question à la prise en charge : s’informer, parler à un médecin, être orienté vers un centre de santé partenaire, recevoir un kit gratuit ou retirer un produit près de chez soi, en toute confidentialité.",
      },
      {
        question: "Comment poser une question sans être reconnu(e) ?",
        answer: "Utilisez l’Assistant SSR, accessible à toute heure depuis le site. Les réponses sont automatiques, anonymes et confidentielles. Si votre situation le demande, l’Assistant vous propose de prendre rendez-vous avec un médecin.",
      },
      {
        question: "Comment choisir une contraception ?",
        answer: "La page Contraception présente les contraceptifs modernes reconnus d’après le manuel de l’OMS : avantages, inconvénients et critères. Certaines méthodes demandent une rencontre avec un professionnel de santé, en visio ou par téléphone, avant de choisir. Les autres sont accessibles sans prescription : votre demande est suivie jusqu’au centre partenaire, sans rencontre obligatoire.",
      },
      {
        question: "Comment consulter un médecin ?",
        answer: "Choisissez « Consulter un médecin », puis un créneau, en visio ou par appel. Le prix de la consultation est affiché avant la confirmation ; lorsqu’elle est payante, elle se règle par Mobile Money. Le lien de la visio s’active 15 minutes avant le début du rendez-vous.",
      },
      {
        question: "Qu’est-ce qu’une orientation vers un centre partenaire ?",
        answer: "Lorsque votre situation le demande, votre dossier est transmis à un centre de santé partenaire, avec les consignes du médecin. Au centre, vous présentez votre code QR, ou votre code de secours de 8 caractères : vous n’avez pas à tout réexpliquer.",
      },
    ],
  },
  {
    title: "Kits gratuits et produits",
    items: [
      {
        question: "Comment bénéficier des kits gratuits ?",
        answer: "La page Kits gratuits affiche les campagnes en cours près de vous. Demandez votre kit, choisissez votre point de retrait, puis retirez-le avec votre code.",
      },
      {
        question: "Comment commander un produit ?",
        answer: "Dans la Boutique, choisissez votre produit et payez en ligne. Vous le retirez ensuite avec un code dans le point de retrait de votre choix, ou vous le faites livrer à l’adresse indiquée : le prix de la livraison est affiché avant de payer.",
      },
      {
        question: "Quand mon colis est-il disponible au point de retrait ?",
        answer: "Les colis rejoignent les points de retrait lors des tournées de 09h00 et de 17h00. L’heure de disponibilité vous est annoncée dès la commande ou la demande de kit, et une notification vous prévient quand votre colis est prêt.",
      },
      {
        question: "Les produits sont-ils certifiés ?",
        answer: "Absolument. Tous nos produits proviennent de laboratoires certifiés et respectent les normes sanitaires en vigueur au Bénin.",
      },
      {
        question: "Puis-je retourner un produit ?",
        answer: "Pour des raisons d'hygiène, les produits de santé intime ne sont ni repris ni échangés, sauf en cas de défaut de fabrication avéré à la réception.",
      },
    ],
  },
  {
    title: "Confidentialité",
    items: [
      {
        question: "Mes données sont-elles protégées ?",
        answer: "Vos données de santé sont chiffrées, et aucune donnée de santé n’est gardée sur votre téléphone. Le détail figure dans notre politique de confidentialité.",
      },
    ],
  },
  {
    title: "Rejoindre le réseau",
    items: [
      {
        question: "Mon organisation souhaite financer une campagne : comment faire ?",
        answer: "Créez votre espace sponsor et décrivez la campagne souhaitée : villes, dates, nombre de kits, budget. L’équipe E.doto family étudie la demande puis crée la campagne. Vous suivez ensuite sur une carte les inscriptions et les retraits en temps réel, et vous exportez les données une fois la campagne terminée.",
      },
      {
        question: "Comment devenir point de retrait ?",
        answer: "Remplissez le formulaire « Devenir point de retrait » et confirmez votre adresse e-mail grâce au lien reçu. Notre équipe vérifie votre point de retrait ; une fois validé, vous vous connectez à votre espace partenaire.",
      },
      {
        question: "Je suis médecin ou je travaille dans un centre de santé",
        answer: "Les comptes des médecins et des centres partenaires sont créés par l’équipe E.doto family. Contactez-nous pour rejoindre le réseau.",
      },
    ],
  },
];

export default function FAQ() {
  return (
    <main className="bg-white text-[#161412]">
      <div className="mx-auto max-w-4xl px-5 pb-24 pt-10 sm:px-8 lg:pb-32">
        <p className="text-[13px] font-medium text-[#B8336A]">Questions fréquentes</p>
        <h1 className="mt-5 text-[38px] font-normal leading-[1.05] tracking-[-0.04em] sm:text-[56px]">Vos questions, nos réponses</h1>
        <p className="mt-6 max-w-xl text-[16px] leading-[1.8] text-[#6B645D]">Tout ce qu’il faut savoir sur votre parcours avec E.doto family.</p>

        {GROUPS.map((g) => (
          <section key={g.title} className="mt-14">
            <h2 className="text-[22px] font-normal tracking-[-0.01em] text-[#161412] sm:text-[26px]">{g.title}</h2>
            <div className="mt-5 border-t border-[#ECE6E0]">
              {g.items.map((qa) => <AccordionItem key={qa.question} {...qa} />)}
            </div>
          </section>
        ))}

        <div className="mt-16 flex flex-col items-start gap-6 rounded-[28px] bg-[#FCFAF8] p-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[18px] font-medium">Vous ne trouvez pas votre réponse ?</p>
            <p className="mt-1 text-[15px] text-[#6B645D]">Notre équipe est là pour vous aider.</p>
          </div>
          <Link href="/contact" className="inline-flex items-center gap-2.5 rounded-full bg-[#1A1814] px-7 py-4 text-[15px] font-medium text-white transition hover:bg-[#C2185B]">
            Contactez-nous <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </main>
  );
}

function AccordionItem({ question, answer }: QA) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-[#ECE6E0]">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-6 py-6 text-left text-[16px] font-medium text-[#161412] transition hover:text-[#C2185B] sm:text-[17px]"
      >
        {question}
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${isOpen ? 'border-[#C2185B] text-[#C2185B]' : 'border-[#E7DFD8] text-[#6B645D]'}`}>
          {isOpen ? <Minus size={15} /> : <Plus size={15} />}
        </span>
      </button>
      <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <p className="max-w-3xl pb-6 text-[15px] leading-[1.8] text-[#6B645D]">{answer}</p>
        </div>
      </div>
    </div>
  );
}
