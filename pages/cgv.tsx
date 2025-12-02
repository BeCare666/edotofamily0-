import React from 'react';
import { ViewState } from '../types';
import { ArrowLeft, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface LegalProps {
  changeView: (view: ViewState) => void;
}

export const Legal: React.FC<LegalProps> = ({ changeView }) => {
    const router = useRouter()
  return (
    <div className="min-h-screen bg-slate-50 pt-8 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center gap-3 mb-8">
            <button 
                onClick={() => router.back()} 
                className="p-2 bg-white rounded-full shadow-sm text-slate-500 hover:text-pink-600 transition-colors"
            >
                <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold text-slate-900">Mentions Légales & CGV</h1>
        </div>

        <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-sm border border-slate-100 prose prose-slate max-w-none">
            <div className="flex items-center gap-2 text-pink-600 font-bold uppercase tracking-wider text-sm mb-6">
                <FileText size={18} />
                <span>Dernière mise à jour : Octobre 2025</span>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Présentation du site</h2>
            <p className="text-slate-600 mb-6">
                En vertu de l'article 6 de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique, il est précisé aux utilisateurs du site internet E-Doto Family l'identité des différents intervenants dans le cadre de sa réalisation et de son suivi :
                <br/><br/>
                <strong>Propriétaire :</strong> E-Doto Family SARL - Capital social de 1.000.000 FCFA<br/>
                <strong>Siège social :</strong> 123 Avenue de la Santé, Cotonou, Bénin<br/>
                <strong>Contact :</strong> contact@edotofamily.com
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Conditions Générales d’Utilisation (CGU)</h2>
            <p className="text-slate-600 mb-6">
                L’utilisation du site E-Doto Family implique l’acceptation pleine et entière des conditions générales d’utilisation ci-après décrites. Ces conditions d’utilisation sont susceptibles d’être modifiées ou complétées à tout moment, les utilisateurs du site sont donc invités à les consulter de manière régulière.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Description des services fournis</h2>
            <p className="text-slate-600 mb-6">
                Le site internet E-Doto Family a pour objet de fournir une information concernant l’ensemble des activités de la société, ainsi qu'une plateforme de vente de produits de santé et de mise en relation avec des centres de soins.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Limitations de responsabilité</h2>
            <p className="text-slate-600 mb-6">
                E-Doto Family ne pourra être tenu responsable des dommages directs et indirects causés au matériel de l’utilisateur, lors de l’accès au site internet. De plus, l’utilisateur du site s’engage à accéder au site en utilisant un matériel récent, ne contenant pas de virus.
            </p>
            
            <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Données personnelles</h2>
            <p className="text-slate-600 mb-6">
                Les informations recueillies font l’objet d’un traitement informatique destiné à la gestion des commandes et à l'amélioration de nos services. Conformément à la loi « informatique et libertés », vous bénéficiez d’un droit d’accès et de rectification aux informations qui vous concernent.
            </p>
        </div>

      </div>
    </div>
  );
};

export default Legal;