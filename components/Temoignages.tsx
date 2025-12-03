"use client";

import { Quote } from "lucide-react";

export default function Testimonials() {
    const testimonials = [
        {
            text: "Avec E-Doto Family, j’ai récupéré mes produits SSR en 5 minutes, sans gêne.",
            author: "Utilisatrice, Cotonou",
        },
        {
            text: "La plateforme m’a permis de trouver rapidement des solutions fiables et discrètes.",
            author: "Jeune adulte, Porto-Novo",
        },
        {
            text: "Les informations sont claires et j’ai pu me sentir en sécurité tout au long du processus.",
            author: "Étudiante, Parakou",
        },
        {
            text: "Un service accessible et sans jugement, exactement ce dont nous avions besoin.",
            author: "Jeune mère, Abomey-Calavi",
        },
    ];

    return (
        <section className="max-w-6xl mx-auto px-6 py-16 bg-gray-50 rounded-3xl">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
                    Témoignages
                </h2>
                <p className="text-slate-500 max-w-2xl mx-auto mt-3">
                    Ce que nos utilisateurs disent de E-Doto Family
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {testimonials.map((t, i) => (
                    <div
                        key={i}
                        className="flex flex-col justify-between p-6 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition duration-300"
                    >
                        <Quote className="w-8 h-8 text-pink-600 mb-4" />
                        <p className="text-slate-700 font-medium mb-4">{t.text}</p>
                        <p className="text-slate-500 font-light text-sm">{t.author}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
