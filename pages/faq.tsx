import React, { useState } from 'react';
import { ViewState } from '../types';
import { ArrowLeft, Plus, Minus, HelpCircle } from 'lucide-react';

interface FAQProps {
  changeView: (view: ViewState) => void;
}

export const FAQ: React.FC<FAQProps> = ({ changeView }) => {
  const faqs = [
    {
      question: "Comment passer une commande ?",
      answer: "Pour passer une commande, naviguez vers la Boutique, selectionnez une catégories de produits souhaité, puis suivez les étapes de paiement sécurisé."
    },
    {
      question: "Quels sont les délais de livraison ?",
      answer: "Nous livrons généralement sous 24h à 48h à Cotonou et ses environs. Pour les autres villes, comptez 3 à 5 jours ouvrés."
    },
    {
      question: "Les produits sont-ils certifiés ?",
      answer: "Absolument. Tous nos produits proviennent de laboratoires certifiés et respectent les normes sanitaires en vigueur au Bénin."
    },
    {
      question: "Puis-je retourner un produit ?",
      answer: "Pour des raisons d'hygiène, les produits de santé intime ne sont ni repris ni échangés, sauf en cas de défaut de fabrication avéré à la réception."
    },
    {
      question: "Comment bénéficier des kits gratuits ?",
      answer: "Consultez notre page 'Campagnes' pour voir les distributions en cours. Il suffit de remplir le formulaire d'inscription pour réserver votre kit."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-8 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
            <button 
                onClick={() => changeView(ViewState.HOME)} 
                className="absolute top-8 left-4 md:left-8 p-2 bg-white rounded-full shadow-sm text-slate-500 hover:text-pink-600 transition-colors"
            >
                <ArrowLeft size={20} />
            </button>
            <div className="inline-flex p-3 bg-pink-100 text-pink-600 rounded-2xl mb-4">
                <HelpCircle size={32} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Foire Aux Questions</h1>
            <p className="text-slate-500">Nous avons les réponses à vos questions.</p>
        </div>

        <div className="space-y-4">
            {faqs.map((faq, index) => (
                <AccordionItem key={index} question={faq.question} answer={faq.answer} />
            ))}
        </div>
        
        <div className="mt-12 text-center bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <p className="font-bold text-slate-900 mb-2">Vous ne trouvez pas votre réponse ?</p>
            <p className="text-slate-500 mb-6 text-sm">Notre équipe est là pour vous aider.</p>
            <button className="bg-slate-900 text-white px-8 py-3 rounded-full font-bold hover:bg-pink-600 transition-colors shadow-lg">
                Contactez-nous
            </button>
        </div>

      </div>
    </div>
  );
};
export default FAQ;
interface AccordionItemProps {
  question: string;
  answer: string;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-5 text-left font-bold text-slate-800 hover:bg-slate-50 transition-colors"
            >
                {question}
                <span className={`p-1 rounded-full ${isOpen ? 'bg-pink-100 text-pink-600' : 'bg-slate-100 text-slate-500'}`}>
                    {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                </span>
            </button>
            <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-5 pt-0 text-slate-600 text-sm leading-relaxed border-t border-slate-50">
                    {answer}
                </div>
            </div>
        </div>
    );
};
