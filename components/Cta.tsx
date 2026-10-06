"use client";

import { useRouter } from "next/navigation";
import { Calendar, ShoppingCart, MessageCircle } from "lucide-react";

export default function FinalCTA() {
    const router = useRouter();

    return (
        <section
            className="relative max-w-6xl mx-auto px-6 py-20 rounded-3xl"
            style={{ background: 'linear-gradient(135deg, #7F00FF 0%, #E100FF 100%)' }}
        >
            <div className="text-center text-white max-w-3xl mx-auto space-y-6">
                <h2 className="text-3xl md:text-4xl font-extrabold">
                    Votre santé mérite confidentialité, respect et simplicité.
                </h2>
                <p className="text-lg md:text-xl">
                    Rejoignez la communauté <span className="font-semibold">E.doto family</span>.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
                    <button
                        onClick={() => router.push("/campagnes")}
                        className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-full transition duration-300"
                    >
                        <Calendar className="w-5 h-5" />
                        Découvrir les campagnes
                    </button>

                    <button
                        onClick={() => router.push("/commander")}
                        className="flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-purple-700 font-semibold py-3 px-6 rounded-full transition duration-300"
                    >
                        <ShoppingCart className="w-5 h-5" />
                        Commander un produit
                    </button>

                    <button
                        onClick={() => router.push("/conseiller")}
                        className="flex items-center justify-center gap-2 bg-purple-400 hover:bg-purple-500 text-white font-semibold py-3 px-6 rounded-full transition duration-300"
                    >
                        <MessageCircle className="w-5 h-5" />
                        Parler au conseiller virtuel
                    </button>
                </div>
            </div>
        </section>
    );
}
