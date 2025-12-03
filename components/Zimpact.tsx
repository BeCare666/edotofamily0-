"use client";

import { JSX, useEffect, useState } from "react";
import { Users, MapPin, Briefcase } from "lucide-react";

interface Stat {
    value: number;
    label: string;
    icon: JSX.Element;
    suffix?: string; // pour "+", etc.
}

export default function SocialProof() {
    const stats: Stat[] = [
        { value: 12000, label: "jeunes accompagnés", icon: <Users className="w-10 h-10 text-pink-600" />, suffix: "+" },
        { value: 140, label: "points de retrait partenaires", icon: <MapPin className="w-10 h-10 text-pink-600" />, suffix: "+" },
        { value: 25, label: "entreprises engagées en RSE", icon: <Briefcase className="w-10 h-10 text-pink-600" />, suffix: "+" },
    ];

    const [counts, setCounts] = useState<number[]>(stats.map(() => 0));

    useEffect(() => {
        const duration = 1500; // durée de l'animation en ms
        const start = performance.now();

        function animate(time: number) {
            const progress = Math.min((time - start) / duration, 1);
            const newCounts = stats.map((stat) => Math.floor(stat.value * progress));
            setCounts(newCounts);
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }

        requestAnimationFrame(animate);
    }, []);

    return (
        <section className="max-w-6xl mx-auto px-6 py-16">
            {/* Title */}
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
                    Notre impact
                </h2>
                <p className="text-slate-500 max-w-2xl mx-auto mt-3">
                    Aligné avec les standards du Ministère de la Santé et de ses partenaires
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                {stats.map((stat, i) => (
                    <div
                        key={i}
                        className="flex flex-col items-center justify-center gap-4 bg-white rounded-3xl p-10 shadow-lg hover:shadow-2xl transition duration-300"
                    >
                        <div className="mb-2">{stat.icon}</div>
                        <p className="text-4xl md:text-5xl font-extrabold text-slate-900">
                            {counts[i].toLocaleString()} {stat.suffix || ""}
                        </p>
                        <p className="text-lg md:text-xl text-slate-600">{stat.label}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
