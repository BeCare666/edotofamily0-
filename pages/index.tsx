import React from 'react';
import { ViewState } from '../types';
import Impact from '../components/Zimpact';
import SSRAccessDrawer from "../components/SSRAccessDrawer";
import Partners from '../components/home/Partners';
import HeroConseil from '../components/home/vitrine/HeroConseil';
import ServicesBande from '../components/home/vitrine/ServicesBande';
import Ruban from '../components/home/vitrine/Ruban';
import ParcoursScroll from '../components/home/vitrine/ParcoursScroll';
import CircuitKit from '../components/home/vitrine/CircuitKit';
import BoutiqueVitrine from '../components/home/vitrine/BoutiqueVitrine';
import ReseauVitrine from '../components/home/vitrine/ReseauVitrine';
import Engagements from '../components/home/vitrine/Engagements';
import AppelFinal from '../components/home/vitrine/AppelFinal';
import VisionProduits from '../components/home/vitrine/VisionProduits';
import dynamic from 'next/dynamic';
// Installer l'application (02/11/2026) : guide Android et iPhone, côté navigateur seulement
const InstallSection = dynamic(() => import('../components/home/InstallSection'), { ssr: false });
interface HomeProps {
  changeView: (view: ViewState) => void;
}

// Vitrine (26/11/2026) : hero, services en bandeau, parcours en défilement accompagné, circuit du kit gratuit,
// réseau, engagements, objectifs (chiffres inchangés), application, partenaires, appel final.
// Règle : aucune photo n'apparaît deux fois sur cette page, tiroir d'accès compris.
// L'hero précédent (« De la première question à la prise en charge ») reste disponible : components/Hero.tsx.
export const Home: React.FC<HomeProps> = () => {
  return (
    <>
      {/* Hero « Des questions sur la contraception ? » (27/11/2026, d'après l'affiche fournie) ; HeroVitrine.tsx conservé */}
      <HeroConseil />
      <ServicesBande />
      <Ruban />
      <ParcoursScroll />
      {/* Boutique (26/11/2026) : vrais produits, images des produits eux-mêmes */}
      <BoutiqueVitrine />
      <CircuitKit />
      <ReseauVitrine />
      <Engagements />
      <Impact />
      {/* « Une vision durable & humaine », illustration animée des produits (remise le 26/11/2026) */}
      <VisionProduits />

      {/* Application installable (02/11/2026) */}
      <InstallSection />

      {/* Partenaires techniques et financiers (15/10/2026) */}
      <Partners />
      <AppelFinal />
      <SSRAccessDrawer />
    </>
  );
};
export default Home;
