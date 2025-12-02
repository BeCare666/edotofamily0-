import React from "react";
import { Heart, Baby, Sparkles, User, ShieldCheck, Gift, ShoppingBag } from "lucide-react";
import CalendlyDrawer from "./CalendlyDrawer";
import {useRouter} from 'next/navigation'

const Hero: React.FC = () => {
    const router = useRouter()
    const [openCalendly, setOpenCalendly] = React.useState(false);
    return (
        <section className="relative overflow-hidden pt-3 pb-24 lg:pt-2 lg:pb-32">
            {/* Background Decor */}
            <div className="blob bg-pink-200 w-96 h-96 rounded-full top-0 -left-20 mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
            <div className="blob bg-purple-200 w-96 h-96 rounded-full bottom-0 right-0 mix-blend-multiply filter blur-3xl opacity-30"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Text Content */}
                    <div className="text-center lg:text-left space-y-8 relative z-20">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-50 border border-pink-100 text-pink-600 text-sm font-medium">
                            <Sparkles size={16} />
                            <span>La référence santé féminine en Afrique</span>
                        </div>

                        <h1 className="text-3xl lg:text-4xl font-bold leading-tight text-slate-900">
                        Accès simple et confidentiel aux produits{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
                            SSR
                        </span>.
                        </h1>

                        <p className="text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                        E-Doto Family offre aux jeunes un accès discret, sécurisé et sans
                        jugement aux produits de santé sexuelle et reproductive. Commandez,
                        choisissez un point de retrait, ou récupérez vos kits SSR gratuits
                        via nos campagnes partenaires. Simple, serein, confidentiel.
                        </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">

                    {/* 🚀 Bouton Campagnes */}
                    <button
                        onClick={() => router.push('/campaigns')}
                        className="
                        group relative px-8 py-4 rounded-full font-semibold
                        bg-gradient-to-r from-pink-500 to-pink-600 text-white
                        shadow-[0_4px_14px_rgba(255,0,128,0.35)]
                        hover:shadow-[0_6px_20px_rgba(255,0,128,0.45)]
                        hover:-translate-y-0.5
                        transition-all duration-300 ease-out
                        flex items-center gap-3
                        "
                    >
                        <Gift className="w-5 h-5 transition-transform group-hover:rotate-12" />
                        <span>Nos campagnes</span>

                        {/* Light Shine */}
                        <span className="absolute inset-0 rounded-full bg-white/10 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                    </button>

                    {/* 🛍️ Bouton Produits */}
                    <button
                        onClick={() => router.push('/category/categories_id=3')}
                        className="
                        group relative px-8 py-4 rounded-full font-semibold
                        bg-white text-slate-700 border border-slate-200
                        hover:border-pink-300 hover:bg-white/90
                        shadow-[0_4px_14px_rgba(0,0,0,0.06)]
                        hover:shadow-[0_6px_20px_rgba(0,0,0,0.09)]
                        hover:-translate-y-0.5
                        transition-all duration-300 ease-out
                        flex items-center gap-3
                        "
                    >
                        <ShoppingBag className="w-5 h-5 text-pink-500 transition-transform group-hover:-translate-y-0.5" />
                        <span>Visiter nos produits</span>

                        {/* Subtle Shine */}
                        <span className="absolute inset-0 rounded-full bg-pink-100/10 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                    </button>

                    </div>

                    </div>

                    {/* Circular Interactive Visual */}
                    <div className="relative flex items-center justify-center mt-12 lg:mt-0 h-[400px] lg:h-[600px] w-full pause-hover">

                        {/* Static Center Circle */}
                        <div className="absolute z-20 w-48 h-48 lg:w-64 lg:h-64 rounded-full bg-gradient-to-br from-pink-100 to-white shadow-2xl flex items-center justify-center border-4 border-white">
                            <div className="text-center p-4">
                                <span className="block text-4xl mb-2 animate-bounce">🌸</span>
                                <h3 className="text-pink-900 font-bold text-lg lg:text-xl leading-tight">
                                    Univers<br />Femme
                                </h3>
                            </div>
                        </div>

                        {/* Orbit Container */}
                        <div className="absolute inset-0 flex items-center justify-center animate-spin-slow z-10">
                            {/* Orbit Circles */}
                            <div className="absolute w-[280px] h-[280px] lg:w-[450px] lg:h-[450px] border border-pink-200 rounded-full"></div>
                            <div className="absolute w-[350px] h-[350px] lg:w-[550px] lg:h-[550px] border border-dashed border-pink-100 rounded-full opacity-50"></div>

                            {/* Orbiting Items */}
                            <OrbitItem icon={Heart} label="Soins" angle={-90} color="bg-rose-100 text-rose-600" />
                            <OrbitItem icon={Baby} label="Maternité" angle={-18} color="bg-blue-100 text-blue-600" />
                            <OrbitItem icon={Sparkles} label="Fertilité" angle={54} color="bg-purple-100 text-purple-600" />
                            <OrbitItem icon={ShieldCheck} label="Intimité" angle={126} color="bg-emerald-100 text-emerald-600" />
                            <OrbitItem icon={User} label="Bien-être" angle={198} color="bg-orange-100 text-orange-600" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;

/* ---------------------- ORBIT ITEM ---------------------------- */

const OrbitItem = ({
    icon: Icon,
    label,
    angle,
    color,
}: {
    icon: any;
    label: string;
    angle: number;
    color: string;
}) => {
    return (
        <div
            className="absolute top-1/2 left-1/2 w-0 h-0 flex items-center justify-center z-30"
            style={{ transform: `rotate(${angle}deg)` }}
        >
            <div className="translate-x-[140px] lg:translate-x-[225px]">
                <div style={{ transform: `rotate(${-angle}deg)` }}>
                    <div className="animate-reverse-spin-slow">
                        <div className="w-20 h-20 lg:w-24 lg:h-24 flex flex-col items-center justify-center gap-1 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-100 hover:scale-110 hover:shadow-pink-200 transition-all cursor-pointer">
                            <div className={`p-2 rounded-full ${color}`}>
                                <Icon size={20} className="lg:w-6 lg:h-6" />
                            </div>
                            <span className="text-[10px] lg:text-xs font-bold text-slate-700">
                                {label}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
