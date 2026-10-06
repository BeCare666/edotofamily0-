"use client";

import React from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import { FaFacebookF, FaLinkedinIn, FaTiktok, FaInstagram } from "react-icons/fa";
import { SiX } from "react-icons/si";
import { useRouter } from "next/navigation";
import CalendlyDrawer from "./CalendlyDrawer";
import { motion } from "framer-motion";
import logo from "../public/logo/favicon.png";
import Image from "next/image"
import BrandMark from "./BrandMark";

/* ✅ FIX TS DEFINITIF */
const MotionDiv = motion.div as React.FC<any>;

type SocialLink = {
    icon: React.ReactNode;
    color: string;
    url: string;
};

interface FooterProps {
    changeView: (view: any) => void;
}

const socialLinks: SocialLink[] = [
    {
        icon: <FaInstagram />,
        color: "#E4405F",
        url: "https://www.instagram.com/toncompte",
    },
    {
        icon: <FaFacebookF />,
        color: "#1877F2",
        url: "https://www.facebook.com/toncompte",
    },
    {
        icon: <FaLinkedinIn />,
        color: "#0077B5",
        url: "https://www.linkedin.com/in/toncompte",
    },
    {
        icon: <SiX />,
        color: "#000000",
        url: "https://x.com/toncompte",
    },
    {
        icon: <FaTiktok />,
        color: "#000000",
        url: "https://www.tiktok.com/@toncompte",
    },
];

export const Footer: React.FC<FooterProps> = ({ changeView }) => {
    const [openCalendly, setOpenCalendly] = React.useState(false);
    const router = useRouter();

    return (
        <>
            <footer className="relative bg-white border-t border-slate-100 pt-20 pb-10">

                {/* Background glow premium */}
                <div className="absolute inset-0 pointer-events-none opacity-30">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2  h-[300px] bg-pink-200 blur-3xl rounded-full" />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-14 mb-14">

                        {/* Branding */}
                        <div className="space-y-5">
                            <div
                                className="flex-shrink-0 flex items-center cursor-pointer gap-2"
                            >
                                <BrandMark size="lg" />
                            </div>

                            <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
                                Votre partenaire de confiance pour la santé sexuelle et reproductive.
                                Nous facilitons l’accès aux produits essentiels avec discrétion et sécurité.
                            </p>

                            {/* Social premium */}
                            <div className="flex gap-4">
                                {socialLinks.map((social, i) => (
                                    <a
                                        key={i}
                                        href={social.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group"
                                    >
                                        <MotionDiv
                                            whileHover={{ scale: 1.12, y: -4 }}
                                            whileTap={{ scale: 0.95 }}
                                            transition={{ type: "spring", stiffness: 250, damping: 18 }}
                                            className="
                        relative p-3 rounded-full
                        bg-white/70 backdrop-blur-xl
                        border border-white/40
                        shadow-md
                        transition-all duration-300
                        group-hover:shadow-xl
                      "
                                        >
                                            {/* Glow effect */}
                                            <div
                                                className="
                          absolute inset-0 rounded-full opacity-0
                          group-hover:opacity-100 transition duration-300
                          blur-lg
                        "
                                                style={{ backgroundColor: social.color }}
                                            />

                                            {/* Icon */}
                                            <div
                                                className="relative z-10 text-lg"
                                                style={{ color: social.color }}
                                            >
                                                {social.icon}
                                            </div>
                                        </MotionDiv>
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Navigation */}
                        <div>
                            <h4 className="font-semibold text-slate-900 mb-6">Navigation</h4>
                            <ul className="space-y-3 text-sm text-slate-600">
                                <li><button onClick={() => router.push("/")} className="hover:text-pink-500 transition">Accueil</button></li>
                                <li><button onClick={() => router.push("/category/categories_id=3")} className="hover:text-pink-500 transition">Boutique</button></li>
                                <li><button onClick={() => router.push("/compaigns")} className="hover:text-pink-500 transition">Campagnes</button></li>
                                <li><button onClick={() => router.push("/about")} className="hover:text-pink-500 transition">À propos</button></li>
                            </ul>
                        </div>

                        {/* Légal */}
                        <div>
                            <h4 className="font-semibold text-slate-900 mb-6">Légal</h4>
                            <ul className="space-y-3 text-sm text-slate-600">
                                <li><button onClick={() => router.push("/cgv")} className="hover:text-pink-500 transition">Mentions légales</button></li>
                                <li><button onClick={() => router.push("/privacy")} className="hover:text-pink-500 transition">Confidentialité</button></li>
                                <li><button onClick={() => router.push("/faq")} className="hover:text-pink-500 transition">FAQ</button></li>
                            </ul>
                        </div>

                        {/* Contact */}
                        <div>
                            <h4 className="font-semibold text-slate-900 mb-6">Contact</h4>
                            <ul className="space-y-4 text-sm text-slate-600">
                                <li className="flex items-start gap-3">
                                    <MapPin size={18} className="text-pink-500 mt-0.5" />
                                    <span>St Rita, Cotonou, Bénin</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Phone size={18} className="text-pink-500" />
                                    <span>+229 01 67 69 81 91</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Mail size={18} className="text-pink-500" />
                                    <span>contact@edotofamily.com</span>
                                </li>
                            </ul>
                        </div>

                    </div>

                    {/* Bottom */}
                    <div className="border-t border-slate-100 pt-8 text-center">
                        <p className="text-slate-400 text-sm">
                            © 2025 E.doto family. Tous droits réservés.
                        </p>
                    </div>
                </div>
            </footer>

            <CalendlyDrawer
                isOpen={openCalendly}
                onClose={() => setOpenCalendly(false)}
            />
        </>
    );
};

export default Footer;