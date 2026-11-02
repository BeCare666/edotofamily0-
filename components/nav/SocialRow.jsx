"use client"

import { SiX } from "react-icons/si"
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTiktok, FaYoutube } from "react-icons/fa"
import { socialIcons, useSiteInfo } from "../../lib/siteInfo"

// Réseaux sociaux des menus : icônes toujours affichées, lien actif quand le réseau est renseigné dans l'admin
const ICONS = { instagram: FaInstagram, facebook: FaFacebookF, linkedin: FaLinkedinIn, x_url: SiX, tiktok: FaTiktok, youtube: FaYoutube }
const NAMES = { instagram: "Instagram", facebook: "Facebook", linkedin: "LinkedIn", x_url: "X", tiktok: "TikTok", youtube: "YouTube" }

export default function SocialRow({ className = "" }) {
    const info = useSiteInfo()
    return (
        <div className={`flex items-center gap-1.5 ${className}`}>
            {socialIcons(info).map((s) => {
                const Icon = ICONS[s.key]
                const base = "flex h-8 w-8 items-center justify-center rounded-full border border-[#E9E5DF] bg-white text-[13px] text-[#6B645D] transition"
                return s.url ? (
                    <a key={s.key} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={NAMES[s.key]}
                        className={`${base} hover:border-[#C2185B]/30 hover:text-[#C2185B]`}>
                        <Icon />
                    </a>
                ) : (
                    <span key={s.key} role="img" aria-label={`${NAMES[s.key]} (bientôt disponible)`} title="Bientôt disponible" className={`${base} opacity-60`}>
                        <Icon />
                    </span>
                )
            })}
        </div>
    )
}
