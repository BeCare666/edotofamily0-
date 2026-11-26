"use client"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import Reveal, { PhotoFrame, photoClass } from "../components/home/Reveal"
import ParcoursScroll from "../components/home/vitrine/ParcoursScroll"
import ReseauVitrine from "../components/home/vitrine/ReseauVitrine"
import Engagements from "../components/home/vitrine/Engagements"
import Partners from "../components/home/Partners"
import aproposPhoto from "../public/images/site/contraception-detail.jpg"

// « Qui sommes-nous » (26/11/2026, repositionnement écosystème, rapports/PROPOSITION_ECOSYSTEME_EDOTO_FAMILY.md).
// Remplace l'ancienne page « bien-être féminin » et regroupe Notre mission, Nos objectifs et Services
// (ces adresses redirigent ici, next.config.js). Sections parcours, réseau et engagements partagées avec la vitrine
// (aucune photo répétée sur la page).
export default function QuiSommesNous() {
  return (
    <main className="bg-white text-[#161412]">
      <section className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)] items-center gap-12 px-5 pb-20 pt-10 sm:px-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16 lg:pb-28">
        <Reveal>
          <p className="text-[13px] font-medium text-[#B8336A]">Qui sommes-nous</p>
          <h1 className="mt-5 text-[38px] font-normal leading-[1.05] tracking-[-0.04em] sm:text-[56px]">
            Le parcours de santé sexuelle et reproductive des jeunes, porté par un réseau de confiance.
          </h1>
          <p className="mt-7 max-w-xl text-[16px] leading-[1.8] text-[#6B645D]">
            E.doto family relie les jeunes, les médecins, les centres de santé, les points de retrait et les sponsors sur une même plateforme, pour que chaque question trouve une réponse et chaque besoin une prise en charge.
          </p>
        </Reveal>
        <Reveal delay={0.12}>
          <PhotoFrame className="aspect-[4/5]">
            <Image src={aproposPhoto} alt="" fill priority placeholder="blur" sizes="(min-width: 1024px) 40vw, 100vw" className={`${photoClass} object-[50%_20%]`} />
          </PhotoFrame>
        </Reveal>
      </section>

      <section className="bg-[#F7E9EE]">
        <div className="mx-auto max-w-5xl px-5 py-24 sm:px-8 lg:py-32">
          <Reveal>
            <p className="text-[13px] font-medium text-[#B8336A]">Pourquoi E.doto family</p>
            <p className="mt-6 text-[26px] font-normal leading-[1.4] tracking-[-0.01em] sm:text-[36px]">
              Les solutions existent, mais beaucoup de jeunes hésitent à y accéder : peur d’être jugés, d’être reconnus, ou simplement de ne pas savoir vers qui se tourner.
            </p>
            <p className="mt-8 max-w-3xl text-[16px] leading-[1.8] text-[#6B645D]">
              Certains renoncent, d’autres se tournent vers des informations qui ne sont pas toujours fiables. Et lorsque des campagnes sont financées, il faut pouvoir suivre concrètement ce qui a été remis. E.doto family est née pour réduire cet écart entre les solutions disponibles et l’accès réel.
            </p>
          </Reveal>
        </div>
      </section>

      <ParcoursScroll />
      <ReseauVitrine />
      <Engagements />
      <Partners />

      <section className="bg-[#FCFAF8]">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-8 px-5 py-20 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="max-w-2xl text-[32px] font-normal leading-[1.1] tracking-[-0.03em] sm:text-[44px]">Une question, un projet de partenariat ?</h2>
          <Link href="/contact" className="inline-flex items-center gap-2.5 rounded-full bg-[#1A1814] px-7 py-4 text-[15px] font-medium text-white transition hover:bg-[#C2185B]">
            Nous contacter <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </main>
  )
}
