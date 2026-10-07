// Police du site choisie par le super admin dans l'admin (07/10/2026).
// Une seule police pour tous les textes : la variable --edoto-font de styles/edoto-font.css.
// Lisibilité : font-size-adjust = 0.548 (hauteur des minuscules de Poppins, mesurée dans le fichier
// officiel) → chaque police s'affiche à la même taille visuelle que Poppins. Poppins : aucun ajustement.
// Mêmes clés que l'API (edoto-api/src/site-appearance) et l'admin (admin/src/utils/site-font.ts).

const GF = "https://fonts.googleapis.com/css2?family=";
const SANS = "Arial, sans-serif";
export const POPPINS_ASPECT = "0.548";
export const FONT_STORAGE_KEY = "edoto_site_font";

export const SITE_FONTS = {
    poppins: { stack: `'Poppins', ${SANS}`, href: null }, // déjà chargée par pages/_document.js
    inter: { stack: `'Inter', ${SANS}`, href: `${GF}Inter:wght@400;500;600;700&display=swap` },
    "plus-jakarta-sans": { stack: `'Plus Jakarta Sans', ${SANS}`, href: `${GF}Plus+Jakarta+Sans:wght@400;500;600;700&display=swap` },
    "dm-sans": { stack: `'DM Sans', ${SANS}`, href: `${GF}DM+Sans:wght@400;500;600;700&display=swap` },
    manrope: { stack: `'Manrope', ${SANS}`, href: `${GF}Manrope:wght@400;500;600;700&display=swap` },
    outfit: { stack: `'Outfit', ${SANS}`, href: `${GF}Outfit:wght@400;500;600;700&display=swap` },
    figtree: { stack: `'Figtree', ${SANS}`, href: `${GF}Figtree:wght@400;500;600;700&display=swap` },
    "nunito-sans": { stack: `'Nunito Sans', ${SANS}`, href: `${GF}Nunito+Sans:wght@400;500;600;700&display=swap` },
    montserrat: { stack: `'Montserrat', ${SANS}`, href: `${GF}Montserrat:wght@400;500;600;700&display=swap` },
    lato: { stack: `'Lato', ${SANS}`, href: `${GF}Lato:wght@400;700&display=swap` },
    "work-sans": { stack: `'Work Sans', ${SANS}`, href: `${GF}Work+Sans:wght@400;500;600;700&display=swap` },
    // Graisses 500 à 700 seulement : le navigateur prend 500 au lieu des graisses fines (lisibilité)
    "cormorant-garamond": { stack: `'Cormorant Garamond', Georgia, serif`, href: `${GF}Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&display=swap` },
};

// Script exécuté dans <head> avant l'affichage : police mémorisée appliquée sans clignotement
export function fontBootScript() {
    const map = Object.fromEntries(Object.entries(SITE_FONTS).map(([k, f]) => [k, [f.stack, f.href]]));
    return `(function(){try{var k=localStorage.getItem(${JSON.stringify(FONT_STORAGE_KEY)});var F=${JSON.stringify(map)};var f=F[k];if(!f||k==="poppins")return;var r=document.documentElement.style;r.setProperty("--edoto-font",f[0]);r.setProperty("--edoto-font-adjust",${JSON.stringify(POPPINS_ASPECT)});var l=document.createElement("link");l.id="edoto-font-link";l.rel="stylesheet";l.href=f[1];document.head.appendChild(l);}catch(e){}})();`;
}

export function applySiteFont(key) {
    if (typeof document === "undefined") return;
    const f = SITE_FONTS[key] ? key : "poppins";
    const font = SITE_FONTS[f];
    const root = document.documentElement.style;
    root.setProperty("--edoto-font", font.stack);
    root.setProperty("--edoto-font-adjust", f === "poppins" ? "none" : POPPINS_ASPECT);
    let link = document.getElementById("edoto-font-link");
    if (!font.href) {
        if (link) link.remove();
    } else {
        if (!link) {
            link = document.createElement("link");
            link.id = "edoto-font-link";
            link.rel = "stylesheet";
            document.head.appendChild(link);
        }
        if (link.getAttribute("href") !== font.href) link.setAttribute("href", font.href);
    }
    try {
        localStorage.setItem(FONT_STORAGE_KEY, f);
    } catch {}
}

// Lecture du choix enregistré (API publique) ; en cas d'échec, la police mémorisée reste
export async function syncSiteFont(apiBase) {
    try {
        const res = await fetch(`${apiBase}/site-appearance`);
        if (!res.ok) return;
        const data = await res.json();
        if (data?.font) applySiteFont(data.font);
    } catch {}
}
