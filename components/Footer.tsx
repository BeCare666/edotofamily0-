import React from 'react';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import { ViewState } from '../types';
import { useRouter } from 'next/navigation'
import CalendlyDrawer from "./CalendlyDrawer";
interface FooterProps {
    changeView: (view: ViewState) => void;
}

export const Footer: React.FC<FooterProps> = ({ changeView }) => {
    const [openCalendly, setOpenCalendly] = React.useState(false);
    const router = useRouter()
    return (
        <>
            <footer className="bg-white border-t border-slate-100 pt-16 pb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

                        <div className="space-y-4">
                            <h3 className="text-2xl font-bold text-slate-900">
                                <span className="text-pink-500">E-Doto</span> Family
                            </h3>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                Votre partenaire de confiance pour la santé sexuelle et reproductive.
                                Nous œuvrons pour un accès aux produits de la Santé Sexuelle et Reproductive.
                            </p>
                            <div className="flex gap-4">
                                <SocialButton icon={Facebook} />
                                <SocialButton icon={Instagram} />
                                <SocialButton icon={Twitter} />
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-slate-900 mb-6">Navigation</h4>
                            <ul className="space-y-3 text-sm text-slate-600">
                                <li><button onClick={() => router.push('/')} className="hover:text-pink-500 transition-colors">Accueil</button></li>
                                <li><button onClick={() => router.push('/category/categories_id=3')} className="hover:text-pink-500 transition-colors">Boutique</button></li>
                                <li><button onClick={() => router.push('/compaigns')} className="hover:text-pink-500 transition-colors">Campagnes</button></li>
                                <li className="hidden"><button onClick={() => setOpenCalendly(true)} className="hover:text-pink-500 transition-colors">Nos Centres</button></li>
                                <li><button onClick={() => router.push('/about')} className="hover:text-pink-500 transition-colors">A propos</button></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-slate-900 mb-6">Légal</h4>
                            <ul className="space-y-3 text-sm text-slate-600">
                                <li><button onClick={() => router.push('/cgv')} className="hover:text-pink-500 transition-colors">Mentions légales CGV</button></li>
                                <li><button onClick={() => router.push('/privacy')} className="hover:text-pink-500 transition-colors">Politique de confidentialité</button></li>
                                <li className="hidden"><button onClick={() => router.push('/cgv')} className="hover:text-pink-500 transition-colors">CGV</button></li>
                                <li><button onClick={() => router.push('/faq')} className="hover:text-pink-500 transition-colors">FAQ</button></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-slate-900 mb-6">Contact</h4>
                            <ul className="space-y-4 text-sm text-slate-600">
                                <li className="flex items-start gap-3">
                                    <MapPin size={18} className="text-pink-500 mt-0.5" />
                                    <span>St Rita,<br />Cotonou, Bénin</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Phone size={18} className="text-pink-500" />
                                    <span>+229 01 67 69 81 91</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Mail size={18} className="text-pink-500" />
                                    <span>contact@edotofamily.com</span>
                                </li>
                            </ul>
                        </div>

                    </div>

                    <div className="border-t border-slate-100 pt-8 text-center">
                        <p className="text-slate-400 text-sm">
                            © 2025 E-Doto Family. Tous droits réservés.
                        </p>
                    </div>
                </div>
            </footer >
            <CalendlyDrawer isOpen={openCalendly} onClose={() => setOpenCalendly(false)} />
        </>
    );
};
export default Footer;
const SocialButton = ({ icon: Icon }: { icon: any }) => (
    <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-pink-500 hover:text-white transition-all duration-300">
        <Icon size={18} />
    </button>
);