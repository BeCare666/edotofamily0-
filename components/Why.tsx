"use client";

import { CheckCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function PourquoiEDoto() {
    const items = [
        "Pour un accès égal et sans jugement",
        "Pour réduire les risques (grossesses non désirées, manque d’info…)",
        "Pour accompagner les jeunes avec des solutions discrètes",
        "Pour renforcer les chaînes communautaires de proximité",
        "Pour rendre la SSR aussi facile qu’acheter un forfait mobile",
        "Pour bâtir un réseau solidaire où chaque jeune trouve soutien et dignité.",
    ];

    const [visibleItems, setVisibleItems] = useState<boolean[]>(Array(items.length).fill(false));
    const refs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const index = refs.current.findIndex((el) => el === entry.target);
                    if (entry.isIntersecting && index !== -1) {
                        setVisibleItems((prev) => {
                            const copy = [...prev];
                            copy[index] = true;
                            return copy;
                        });
                    }
                });
            },
            { threshold: 0.2 }
        );

        refs.current.forEach((el) => el && observer.observe(el));

        return () => {
            refs.current.forEach((el) => el && observer.unobserve(el));
        };
    }, []);

    return (
        <section className="max-w-6xl mx-auto px-6 py-16">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
                    Pourquoi <span className="text-pink-600">E-Doto Family</span> ?
                </h2>
                <p className="text-slate-600 max-w-2xl mx-auto mt-3">
                    Une plateforme pensée pour la dignité, la confiance et l’accès libre
                    à la santé sexuelle reproductive.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {items.map((txt, i) => (
                    <div
                        key={i}
                        ref={(el) => { refs.current[i] = el; }} // ✅ correction ici
                        className={`p-5 rounded-2xl border border-slate-100 bg-white shadow-sm transform transition-all duration-500 
              ${visibleItems[i] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}
              hover:shadow-md`}
                        style={{ transitionDelay: `${i * 80}ms` }}
                    >
                        <div className="flex gap-4 items-start">
                            <div className="w-10 h-10 rounded-full bg-pink-100 grid place-items-center">
                                <CheckCircle className="w-5 h-5 text-pink-600" />
                            </div>
                            <p className="text-slate-700 font-medium leading-relaxed">{txt}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
