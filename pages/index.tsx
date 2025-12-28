import React from 'react';
import Hero from '../components/Hero';
import { Heart, Globe, Users, Smile, Shield, MapPin } from 'lucide-react';
import { ViewState } from '../types';
import UniversFemme from '../components/UniversFemme';
import Why from '../components/Why';
import Impact from '../components/Zimpact';
import Temoignages from '../components/Temoignages';
import Cta from '../components/Cta';
import Image from 'next/image';
import Visions from '../public/images/woman-soft-bg.jpg';
import SSRAccessDrawer from "../components/SSRAccessDrawer";
interface HomeProps {
  changeView: (view: ViewState) => void;
}

export const Home: React.FC<HomeProps> = ({ changeView }) => {
  return (
    <>
      <Hero />
      <UniversFemme />
      <Why />
      <Impact />
      {/*  <Temoignages />

      <Cta />**/}
      {/* Services Section  *********/}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Nos Services : un univers de soins</h2>
            <p className="text-slate-600">E-Doto vous accompagne à chaque étape de votre bien-être : de la santé intime à la maternité, avec élégance, innovation et douceur.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ServiceCard
              icon={Heart}
              title="Santé intime & fertilité"
              desc="Des soins délicats et adaptés pour comprendre, renforcer et harmoniser votre santé reproductive."
              color="text-rose-500"
              bg="bg-rose-50"
            />
            <ServiceCard
              icon={Smile}
              title="Accompagnement grossesse"
              desc="Des produits et conseils personnalisés pour vivre votre maternité avec sérénité et équilibre."
              color="text-pink-500"
              bg="bg-pink-50"
            />
            <ServiceCard
              icon={Users}
              title="Communauté solidaire"
              desc="Bâtir un espace d'échange et d'inspiration autour du bien-être intime et de la confiance."
              color="text-purple-500"
              bg="bg-purple-50"
            />
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-24 bg-pink-50/50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <Image
                src={Visions}
                alt="Femme heureuse"
                className="rounded-3xl shadow-2xl object-cover w-full h-[500px]"
              />
              <div className="absolute -bottom-8 -right-8 bg-white p-6 rounded-2xl shadow-xl max-w-xs hidden md:block">
                <div className="flex items-center gap-4 mb-3">
                  <div className="p-3 bg-green-100 rounded-full text-green-600">
                    <Shield size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">100% Sécurisé</p>
                    <p className="text-xs text-slate-500">Produits certifiés</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600">Nous travaillons uniquement avec des laboratoires reconnus.</p>
              </div>
            </div>

            <div className="space-y-8">
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">
                Une vision <span className="text-pink-500">durable</span> & <span className="text-pink-500">humaine</span>.
              </h2>
              <p className="text-slate-600 text-lg">
                Nos objectifs guident chaque création. Car pour nous, la santé féminine est une mission de cœur, pas une simple tendance. Nous voulons réconcilier science, nature et élégance.
              </p>

              <div className="space-y-4">
                <FeatureRow icon={Globe} text="Rayonner à l'échelle africaine" />
                <FeatureRow icon={Shield} text="Promouvoir la durabilité et l'écologie" />
                <FeatureRow icon={Users} text="Créer des liens forts entre les praticiens et les patients" />
              </div>

              <button
                onClick={() => changeView(ViewState.SHOP)}
                className="mt-4 px-8 py-3 bg-slate-900 text-white rounded-full font-semibold hover:bg-pink-600 transition-colors"
              >
                Rejoindre la mission
              </button>
            </div>
          </div>
        </div>
      </section>
      <SSRAccessDrawer />
    </>
  );
};
export default Home;
const ServiceCard = ({ icon: Icon, title, desc, color, bg }: { icon: any, title: string, desc: string, color: string, bg: string }) => (
  <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
    <div className={`w-14 h-14 ${bg} ${color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
      <Icon size={28} />
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
    <p className="text-slate-500 leading-relaxed">{desc}</p>
  </div>
);

const FeatureRow = ({ icon: Icon, text }: { icon: any, text: string }) => (
  <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-pink-50 shadow-sm">
    <div className="text-pink-500">
      <Icon size={20} />
    </div>
    <span className="font-medium text-slate-700">{text}</span>
  </div>
);
