"use client";

import Link from "next/link";
import Reveal from "./Reveal";

// Section « Nos partenaires » (15/10/2026) : les partenaires qui accompagnent techniquement et
// financièrement la plateforme. Logos officiels (Wikimedia Commons, domaine public / CC BY-SA),
// non modifiés. Aucun logo officiel vérifié pour l'ambassade : nom écrit, sans logo inventé.
const PARTNERS: { name: string; full: string; logo?: string; logoClass?: string }[] = [
    { name: "UNFPA", full: "Fonds des Nations Unies pour la population", logo: "/partners/unfpa.svg", logoClass: "h-14 sm:h-16" },
    { name: "PNUD", full: "Programme des Nations Unies pour le développement", logo: "/partners/pnud.svg", logoClass: "h-20 sm:h-24" },
    { name: "UNCDF", full: "Fonds d’équipement des Nations Unies", logo: "/partners/uncdf.png", logoClass: "h-20 sm:h-24" },
    { name: "Ambassade du Luxembourg", full: "Grand-Duché de Luxembourg" },
];

export default function Partners() {
    return (
        <section className="bg-white" aria-labelledby="partners-title">
            <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
                <Reveal>
                    <p className="text-[12px] font-medium tracking-[0.2em] text-[#A8A29B]">PARTENAIRES</p>
                    <h2 id="partners-title" className="mt-3 text-[40px] font-normal leading-[1.05] tracking-[-0.04em] text-[#161412] sm:text-[56px]">Nos partenaires</h2>
                    <p className="mt-6 max-w-2xl text-[16px] leading-[1.8] text-[#6B645D]">
                        Ils accompagnent techniquement et financièrement la plateforme E.doto family.
                    </p>
                </Reveal>

                <ul className="mt-14 grid grid-cols-[minmax(0,1fr)] border-t border-[#ECE6E0] sm:grid-cols-2 lg:grid-cols-4">
                    {PARTNERS.map((p, i) => (
                        <li key={p.name} className="border-b border-[#ECE6E0] sm:[&:nth-child(odd)]:border-r lg:border-r lg:[&:nth-child(4n)]:border-r-0">
                            <Reveal delay={i * 0.06} y={16} className="flex h-full flex-col items-center justify-between gap-8 px-6 py-12 text-center">
                                <div className="flex h-24 items-center justify-center">
                                    {p.logo ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={p.logo} alt={`Logo ${p.name}`} className={`${p.logoClass} w-auto object-contain`} loading="lazy" />
                                    ) : (
                                        <span className="text-[22px] font-normal leading-[1.2] tracking-[-0.01em] text-[#161412]">{p.name}</span>
                                    )}
                                </div>
                                <div>
                                    {p.logo && <p className="text-[15px] font-medium text-[#161412]">{p.name}</p>}
                                    <p className="mt-1 text-[13px] leading-[1.6] text-[#8A827A]">{p.full}</p>
                                </div>
                            </Reveal>
                        </li>
                    ))}
                </ul>

                <Reveal className="mt-12 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="max-w-xl text-[15px] leading-[1.7] text-[#6B645D]">Votre organisation souhaite financer une campagne de distribution de kits et en suivre l’impact en temps réel ?</p>
                    <Link href="/sponsor/inscription" className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#161412] px-6 py-3 text-[14px] text-[#161412] transition-colors duration-300 hover:bg-[#161412] hover:text-white">
                        Devenir sponsor
                    </Link>
                </Reveal>
            </div>
        </section>
    );
}
