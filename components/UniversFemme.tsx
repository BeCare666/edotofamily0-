// components/UniversFemme.tsx
"use client";

import React from "react";
import { motion, MotionProps } from "framer-motion";
import { MapPin, ShoppingCart, Heart, User } from "lucide-react";

type DivMotionProps = React.HTMLAttributes<HTMLDivElement> & MotionProps;
const MotionDiv = motion.div as unknown as React.FC<DivMotionProps>;

export default function UniversFemme() {
    return (
        <section className="w-full mx-auto px-6">
            <div className="bg-white -2 md:p-3">
                <div className="hidden grid grid-cols-12 lg:grid-cols-2 md:grid-cols-2 gap-4 items-start p-6 md:px-32">
                    {/* LEFT */}
                    <div className="space-y-4">
                        <h2 className="text-xl md:text-3xl font-extrabold text-slate-900 leading-tight">
                            Univers Femme
                        </h2>

                        <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                            Une expérience pensée pour la dignité, la santé et le bien-être de chaque femme.
                            Accédez à une sélection de services et produits essentiels : maternité, fertilité, intimité, hygiène, bien-être…

                        </p>

                        <div>
                            <button className="inline-block px-4 py-2 md:px-6 md:py-3 rounded-full bg-pink-600 text-white font-semibold shadow-md hover:bg-pink-700 transition">
                                Nos campagnes
                            </button>
                        </div>
                    </div>

                    {/* RIGHT — Image */}
                    <div className="flex justify-end hidden lg:block md:block">
                        <img
                            src="https://www.plan-international.fr/app/uploads/2022/10/4B4A9596.jpg"
                            alt="Santé sexuelle reproductive - Univers Femme"
                            className="w-40 h-40 md:w-72 md:h-72 rounded-2xl object-cover shadow-md"
                        />
                    </div>
                </div>


                {/* FEATURES — always 2 columns even on mobile */}
                <div className="grid grid-cols-2 gap-4 mt-10">
                    {/* 1 */}
                    <article className="flex flex-col gap-2 p-3 rounded-xl border bg-pink-50/40">
                        <div className="w-10 h-10 rounded-lg bg-pink-100 grid place-items-center">
                            <MapPin className="w-5 h-5 text-pink-600" />
                        </div>
                        <h3 className="text-sm font-semibold text-slate-900">
                            Localisation instantanée des campagnes SSR
                        </h3>
                        <p className="text-xs text-slate-500">
                            Trouvez en temps réel les distributions gratuites de préservatifs, kits SSR et services communautaires — près de chez vous.

                        </p>
                    </article>

                    {/* 2 */}
                    <article className="flex flex-col gap-2 p-3 rounded-xl border bg-pink-50/40">
                        <div className="w-10 h-10 rounded-lg bg-pink-100 grid place-items-center">
                            <ShoppingCart className="w-5 h-5 text-pink-600" />
                        </div>
                        <h3 className="text-sm font-semibold text-slate-900">
                            Marketplace confidentielle de produits SSR
                        </h3>
                        <p className="text-xs text-slate-500">
                            Commandez vos produits en toute discrétion et retirez-les dans des points de proximité fiables : Mobile Money, boutiques, coiffeurs.
                        </p>
                    </article>

                    {/* 3 */}
                    <article className="flex flex-col gap-2 p-3 rounded-xl border bg-pink-50/40">
                        <div className="w-10 h-10 rounded-lg bg-pink-100 grid place-items-center">
                            <Heart className="w-5 h-5 text-pink-600" />
                        </div>
                        <h3 className="text-sm font-semibold text-slate-900">
                            Conseiller virtuel IA – 24/7
                        </h3>
                        <p className="text-xs text-slate-500">
                            Posez toutes vos questions sur la sexualité, la fertilité, l’hygiène, la grossesse, etc.
                            Réponses anonymes, instantanées, fiables.
                        </p>
                    </article>

                    {/* 4 */}
                    <article className="flex flex-col gap-2 p-3 rounded-xl border bg-pink-50/40">
                        <div className="w-10 h-10 rounded-lg bg-pink-100 grid place-items-center">
                            <User className="w-5 h-5 text-pink-600" />
                        </div>
                        <h3 className="text-sm font-semibold text-slate-900">
                            Module RSE pour entreprises
                        </h3>
                        <p className="text-xs text-slate-500">
                            Les entreprises financent des campagnes SSR et offrent des kits gratuits à la population. Suivi d’impact inclus.

                        </p>
                    </article>
                </div>
            </div>
        </section>
    );
}
