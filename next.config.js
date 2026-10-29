/** @type {import('next').NextConfig} 
const nextConfig = {
    webpack: (config) => {
        // 👇 Force FeexPay à utiliser la même instance de React.
        config.resolve.alias = {
            ...(config.resolve.alias || {}),
            react: require.resolve("react"),
            "react-dom": require.resolve("react-dom"),
        };
        //console.log(config.resolve.alias);
        return config;
    },
};

module.exports = nextConfig;**/




// En-têtes de sécurité (audit sécurité 1.3, 22/10/2026).
// La CSP est d'abord en « Report-Only » : elle signale dans la console du navigateur sans rien bloquer.
// Après 7 jours sans alerte (paiement FeexPay, carte, formulaires) : passer la clé en Content-Security-Policy.
const API = "https://edotofamily.onrender.com";
const CSP = [
    "default-src 'self'",
    "script-src 'self' https://api-v2.feexpay.me",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: blob: https://res.cloudinary.com https://img.icons8.com https://tiles.openfreemap.org https://*.tile.openstreetmap.org",
    `connect-src 'self' ${API} https://api-v2.feexpay.me https://api.ipify.org https://tiles.openfreemap.org https://nominatim.openstreetmap.org https://routing.openstreetmap.de`,
    "frame-src https://api-v2.feexpay.me https://checkout.feexpay.me https://feexpay.me https://www.google.com https://calendly.com https://docs.google.com",
    "worker-src 'self' blob:",
    "frame-ancestors 'self'",
].join("; ");

const securityHeaders = [
    { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    // La visio Jitsi s'ouvre dans un nouvel onglet : pas de caméra ni de micro pour les pages du site
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
    { key: "X-Frame-Options", value: "SAMEORIGIN" },
    { key: "Content-Security-Policy-Report-Only", value: CSP },
];

/** @type {import('next').NextConfig} **/
const nextConfig = {
    images: {
        domains: ["res.cloudinary.com"],
    },
    async headers() {
        return [{ source: "/(.*)", headers: securityHeaders }];
    },
};

module.exports = nextConfig;