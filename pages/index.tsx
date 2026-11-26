import React from 'react';
import Hero from '../components/Hero';
import { ViewState } from '../types';
import Why from '../components/Why';
import Impact from '../components/Zimpact';
import SSRAccessDrawer from "../components/SSRAccessDrawer";
import Parcours from '../components/home/Parcours';
import Reseau from '../components/home/Reseau';
import Partners from '../components/home/Partners';
import dynamic from 'next/dynamic';
// Installer l'application (02/11/2026) : guide Android et iPhone, côté navigateur seulement
const InstallSection = dynamic(() => import('../components/home/InstallSection'), { ssr: false });
interface HomeProps {
  changeView: (view: ViewState) => void;
}

// Repositionnement écosystème (26/11/2026, rapports/PROPOSITION_ECOSYSTEME_EDOTO_FAMILY.md) :
// parcours du jeune en cinq temps, puis le réseau, puis les engagements.
// Retirés : « Nos Services : un univers de soins » (grossesse, communauté : services inexistants)
// et la section Vision (durabilité, « Visiter nos produits »).
export const Home: React.FC<HomeProps> = () => {
  return (
    <>
      <Hero />
      <Parcours />
      <Reseau />
      <Why />
      <Impact />

      {/* Application installable (02/11/2026) */}
      <InstallSection />

      {/* Partenaires techniques et financiers (15/10/2026) */}
      <Partners />
      <SSRAccessDrawer />
    </>
  );
};
export default Home;
