"use client";

import React from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import { FaFacebookF, FaLinkedinIn, FaTiktok, FaInstagram, FaYoutube } from "react-icons/fa";
import { SiX } from "react-icons/si";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import logo from "../public/logo/favicon.png";
import Image from "next/image"
import BrandMark from "./BrandMark";
import { useShowAndroidApp } from "../lib/androidApp";
import { socialIcons, telHref, useSiteInfo } from "../lib/siteInfo";
import { useChatAI } from "../context/ChatAIContext";

/* ✅ FIX TS DEFINITIF */
const MotionDiv = motion.div as React.FC<any>;

type SocialLink = {
    icon: React.ReactNode;
    color: string;
    url: string | null;
};

interface FooterProps {
    changeView: (view: any) => void;
}

// Réseaux sociaux réglés par le super admin (B5, 30/10/2026) ; avant : liens d'exemple « toncompte »
const SOCIAL_STYLE: Record<string, { icon: React.ReactNode; color: string }> = {
    instagram: { icon: <FaInstagram />, color: "#E4405F" },
    facebook: { icon: <FaFacebookF />, color: "#1877F2" },
    linkedin: { icon: <FaLinkedinIn />, color: "#0077B5" },
    x_url: { icon: <SiX />, color: "#000000" },
    tiktok: { icon: <FaTiktok />, color: "#000000" },
    youtube: { icon: <FaYoutube />, color: "#FF0000" },
};

export const Footer: React.FC<FooterProps> = ({ changeView }) => {
    const router = useRouter();
    const info = useSiteInfo();
    const { openBooking } = useChatAI() as { openBooking: (ctx?: unknown) => void };
    // Application Android (04/11/2026) : lien seulement sur Android et hors de l'application
    const showAndroidApp = useShowAndroidApp();
    const socialLinks: SocialLink[] = socialIcons(info).map((s) => ({ ...SOCIAL_STYLE[s.key], url: s.url }));

    return (
        <>
            <footer className="relative bg-white border-t border-slate-100 pt-20 pb-10">

                {/* Background glow premium */}
                <div className="absolute inset-0 pointer-events-none opacity-30">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2  h-[300px] bg-pink-200 blur-3xl rounded-full" />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-14 mb-14">

                        {/* Branding */}
                        <div className="space-y-5">
                            <div
                                className="flex-shrink-0 flex items-center cursor-pointer gap-2"
                            >
                                <BrandMark size="lg" />
                            </div>

                            <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
                                Le parcours santé sexuelle et reproductive des jeunes : information, consultation,
                                orientation et accès aux produits, en toute confidentialité.
                            </p>

                            {/* Social premium */}
                            <div className="flex gap-4">
                                {socialLinks.map((social, i) => {
                                    // Réseau pas encore renseigné dans l'admin : icône affichée, sans lien
                                    const Tag: any = social.url ? "a" : "span";
                                    const linkProps = social.url ? { href: social.url, target: "_blank", rel: "noopener noreferrer" } : { "aria-disabled": true, title: "Bientôt disponible" };
                                    return (
                                    <Tag
                                        key={i}
                                        {...linkProps}
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
                                    </Tag>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Mon parcours (26/11/2026, repositionnement écosystème) */}
                        <div>
                            <h4 className="font-semibold text-slate-900 mb-6">Mon parcours</h4>
                            <ul className="space-y-3 text-sm text-slate-600">
                                <li><button onClick={() => router.push("/campaigns")} className="hover:text-pink-500 transition">Kits gratuits</button></li>
                                <li><button onClick={() => router.push("/contraception")} className="hover:text-pink-500 transition">Contraception</button></li>
                                <li><button onClick={() => openBooking()} className="hover:text-pink-500 transition">Consulter un médecin</button></li>
                                <li><button onClick={() => router.push("/category/categories_id=all")} className="hover:text-pink-500 transition">Boutique</button></li>
                                <li><button onClick={() => router.push("/mon-espace")} className="hover:text-pink-500 transition">Mon espace</button></li>
                            </ul>
                        </div>

                        {/* Rejoindre le réseau */}
                        <div>
                            <h4 className="font-semibold text-slate-900 mb-6">Rejoindre le réseau</h4>
                            <ul className="space-y-3 text-sm text-slate-600">
                                <li><button onClick={() => router.push("/sponsor/inscription")} className="hover:text-pink-500 transition">Financer une campagne</button></li>
                                <li><button onClick={() => router.push("/devenir-point-de-retrait")} className="hover:text-pink-500 transition">Devenir point de retrait</button></li>
                                <li><button onClick={() => router.push("/contact")} className="hover:text-pink-500 transition">Professionnel de santé</button></li>
                                <li><button onClick={() => router.push("/about")} className="hover:text-pink-500 transition">Qui sommes-nous</button></li>
                            </ul>
                        </div>

                        {/* Légal */}
                        <div>
                            <h4 className="font-semibold text-slate-900 mb-6">Légal</h4>
                            <ul className="space-y-3 text-sm text-slate-600">
                                <li><button onClick={() => router.push("/mentions-legales")} className="hover:text-pink-500 transition">Mentions légales</button></li>
                                <li><button onClick={() => router.push("/privacy")} className="hover:text-pink-500 transition">Confidentialité</button></li>
                                <li><button onClick={() => router.push("/credits-photos")} className="hover:text-pink-500 transition">Crédits photos</button></li>
                                <li><button onClick={() => router.push("/faq")} className="hover:text-pink-500 transition">FAQ</button></li>
                                {showAndroidApp && (
                                    <li><button onClick={() => router.push("/application")} className="hover:text-pink-500 transition">Télécharger l&apos;application</button></li>
                                )}
                            </ul>
                        </div>

                        {/* Contact */}
                        <div>
                            <h4 className="font-semibold text-slate-900 mb-6">Contact</h4>
                            <ul className="space-y-4 text-sm text-slate-600">
                                <li className="flex items-start gap-3">
                                    <MapPin size={18} className="text-pink-500 mt-0.5" />
                                    <span>{info.address}</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Phone size={18} className="text-pink-500" />
                                    <a href={telHref(info.phone)} className="hover:text-pink-500 transition">{info.phone}</a>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Mail size={18} className="text-pink-500" />
                                    <a href={`mailto:${info.email}`} className="hover:text-pink-500 transition">{info.email}</a>
                                </li>
                            </ul>
                        </div>

                    </div>

                    {/* Bottom */}
                    <div className="border-t border-slate-100 pt-8 text-center">
                        <p className="text-slate-400 text-sm">
                            © {new Date().getFullYear()} E.doto family. Tous droits réservés.
                        </p>
                    </div>
                </div>
            </footer>

        </>
    );
};

export default Footer;