"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Reveal, { PhotoFrame, photoClass } from "./home/Reveal";
import santePhoto from "../public/images/sante1800.jpg";

// Refonte du 06/10/2026 : bandeau photo, puis très grands chiffres ; le compteur démarre
// quand les chiffres deviennent visibles. Chiffres et textes inchangés.
interface Stat {
    value: number;
    label: string;
    suffix?: string; // pour "+", etc.
}

export default function SocialProof() {
    const stats: Stat[] = [
        { value: 12000, label: "jeunes accompagnés d’ici 2027", suffix: "+" },
        { value: 140, label: "points de retrait partenaires d’ici 2027", suffix: "+" },
        { value: 25, label: "entreprises engagées en RSE d’ici 2027", suffix: "+" },
    ];

    const ref = useRef<HTMLDListElement | null>(null);
    const [counts, setCounts] = useState<number[]>(stats.map(() => 0));

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        let raf = 0;
        const run = () => {
            const duration = 2000;
            const start = performance.now();
            const animate = (time: number) => {
                const p = Math.min((time - start) / duration, 1);
                const eased = 1 - Math.pow(1 - p, 3);
                setCounts(stats.map((s) => Math.floor(s.value * eased)));
                if (p < 1) raf = requestAnimationFrame(animate);
            };
            raf = requestAnimationFrame(animate);
        };
        if (typeof IntersectionObserver === "undefined") {
            run();
            return () => cancelAnimationFrame(raf);
        }
        const io = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    run();
                    io.disconnect();
                }
            },
            { threshold: 0.3 },
        );
        io.observe(el);
        return () => {
            io.disconnect();
            cancelAnimationFrame(raf);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <section className="bg-[#FCFAF8]">
            <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-36">
                <Reveal className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end">
                    <h2 className="text-[44px] font-extralight leading-none tracking-[-0.04em] text-[#161412] sm:text-[64px]">Notre objectif</h2>
                    <p className="max-w-md text-[16px] leading-[1.8] text-[#6B645D]">
                        Aligné avec les standards du Ministère de la Santé et de ses partenaires
                    </p>
                </Reveal>

                <Reveal delay={0.1} className="mt-14">
                    <PhotoFrame className="aspect-[16/7] sm:aspect-[16/5]">
                        <Image src={santePhoto} alt="" fill placeholder="blur" sizes="(min-width: 1280px) 1216px, 100vw" className={photoClass} />
                    </PhotoFrame>
                </Reveal>

                <dl ref={ref} className="mt-4 grid grid-cols-[minmax(0,1fr)] md:grid-cols-3">
                    {stats.map((stat, i) => (
                        <div key={stat.label} className="border-b border-[#ECE6E0] py-12 md:border-b-0 md:border-l md:px-10 md:first:border-l-0 md:first:pl-0">
                            <dd className="text-[76px] font-extralight leading-none tracking-[-0.05em] tabular-nums text-[#161412] sm:text-[96px]">
                                {counts[i].toLocaleString("fr-FR")}
                                <span className="font-light text-[#D6457F]">{stat.suffix || ""}</span>
                            </dd>
                            <dt className="mt-5 max-w-[16rem] text-[15px] leading-[1.7] text-[#6B645D]">{stat.label}</dt>
                        </div>
                    ))}
                </dl>
            </div>
        </section>
    );
}
