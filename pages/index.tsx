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
import Visions from '../public/icons/edotocenter.gif';
import SSRAccessDrawer from "../components/SSRAccessDrawer";
import Reveal, { PhotoFrame, photoClass } from '../components/home/Reveal';
import servicePhoto from '../public/images/service-bg.jpg';
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
      {/* Services Section (refonte du 06/10/2026 : photo existante du site, textes inchangés) */}
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)] gap-16 px-5 py-24 sm:px-8 lg:grid-cols-[minmax(0,6fr)_minmax(0,6fr)] lg:gap-24 lg:py-36">
          <Reveal className="lg:sticky lg:top-28 lg:self-start">
            <PhotoFrame className="aspect-[4/5]">
              <Image src={servicePhoto} alt="" fill placeholder="blur" sizes="(min-width: 1024px) 48vw, 100vw" className={`${photoClass} object-[62%_50%]`} />
            </PhotoFrame>
          </Reveal>

          <div>
            <Reveal>
              <h2 className="text-[44px] font-extralight leading-[1.02] tracking-[-0.04em] text-[#161412] sm:text-[64px]">Nos Services : un univers de soins</h2>
              <p className="mt-7 max-w-lg text-[16px] leading-[1.8] text-[#6B645D]">E.doto family vous accompagne à chaque étape de votre bien-être : de la santé intime à la maternité, avec élégance, innovation et douceur.</p>
            </Reveal>

            <div className="mt-14">
              <ServiceCard
                index={1}
                icon={Heart}
                title="Santé intime & fertilité"
                desc="Des soins délicats et adaptés pour comprendre, renforcer et harmoniser votre santé reproductive."
              />
              <ServiceCard
                index={2}
                icon={Smile}
                title="Accompagnement grossesse"
                desc="Des produits et conseils personnalisés pour vivre votre maternité avec sérénité et équilibre."
              />
              <ServiceCard
                index={3}
                icon={Users}
                title="Communauté solidaire"
                desc="Bâtir un espace d'échange et d'inspiration autour du bien-être intime et de la confiance."
              />
            </div>
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
                className="hidden mt-4 px-8 py-3 bg-slate-900 text-white rounded-full font-semibold hover:bg-pink-600 transition-colors"
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
const ServiceCard = ({ index, icon: Icon, title, desc }: { index: number, icon: any, title: string, desc: string }) => (
  <Reveal delay={index * 0.06} y={18}>
    <div className="group grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 border-t border-[#ECE6E0] py-9">
      <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#E7DFD8] text-[#D6457F] transition-colors duration-500 group-hover:border-[#D6457F]">
        <Icon size={19} strokeWidth={1.5} />
      </span>
      <div>
        <p className="text-[12px] font-medium tracking-[0.2em] text-[#A8A29B]">0{index}</p>
        <h3 className="mt-1.5 text-[24px] font-light leading-[1.25] tracking-[-0.01em] text-[#161412] sm:text-[28px]">{title}</h3>
        <p className="mt-3 max-w-md text-[15px] leading-[1.75] text-[#6B645D]">{desc}</p>
      </div>
    </div>
  </Reveal>
);

const FeatureRow = ({ icon: Icon, text }: { icon: any, text: string }) => (
  <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-pink-50 shadow-sm">
    <div className="text-pink-500">
      <Icon size={20} />
    </div>
    <span className="font-medium text-slate-700">{text}</span>
  </div>
);
