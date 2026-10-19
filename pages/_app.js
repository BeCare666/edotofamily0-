// pages/_app.jsx
import '../styles/globals.css'
import '../styles/edoto-font.css' // police unique : en dernier
import Head from 'next/head'
import Layout from '../components/Layout'
import { AuthProvider } from '../context/AuthContext'
import Footer from '../components/Footer';
import { Toaster } from "react-hot-toast"
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation"
import Router from "next/router";
import CookieConsent from '../components/CookieConsent';
import SSRAdvisorButton from "../components/SSRAdvisorButton";
import { ChatAIProvider } from "../context/ChatAIContext";
const ChatAIDrawer = dynamic(() => import("../components/ai-chat/ChatAIDrawer"), { ssr: false });
// Téléconsultation (19/10/2026) : choix assistant / rendez-vous et prise de rendez-vous
const SSRChoice = dynamic(() => import("../components/teleconsultation/SSRChoice"), { ssr: false });
const BookingDrawer = dynamic(() => import("../components/teleconsultation/BookingDrawer"), { ssr: false });
const MobileBottomNav = dynamic(() => import("../components/mobile/MobileBottomNav"), { ssr: false });
const Header = dynamic(() => import("../components/header"), {
  ssr: false,
});
import { useEffect } from "react";
import { syncSiteFont } from "../lib/siteFont";


export default function MyApp({ Component, pageProps }) {
  // Police choisie par le super admin (admin → Police du site) : lue à l'ouverture
  useEffect(() => {
    syncSiteFont(process.env.NEXT_PUBLIC_REST_API_ENDPOINT);
  }, []);
  let pathname = usePathname() || ""
  const isHomePage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/devenir-point-de-retrait" ||
    pathname === "/pickup-dashboard" || // le dashboard a sa propre barre latérale, son en-tête et son pied de page
    pathname.startsWith("/sponsor") || // espace sponsor : même principe
    // Téléconsultation (19/10/2026) : espaces jeune, médecin, centre ; activation ; dossier ; code QR
    pathname === "/mon-espace" ||
    pathname === "/medecin" ||
    pathname === "/centre" ||
    pathname.startsWith("/espace/") ||
    pathname.startsWith("/dossier/") ||
    pathname.startsWith("/qr/") ||

    pathname.startsWith("/admin") ||
    pathname === "/forgot-password" ||
    pathname === "/succesregister"

  // Pages sans pied de page : « Mes commandes » et « Campagnes »
  const hideFooter = pathname === "/orders" || pathname === "/campaigns"

  const isHomePagex =
    pathname === "/" ||
    pathname.startsWith("/category") ||
    pathname.startsWith("/product") ||
    pathname === "/Campaigns"

  return (
    <AuthProvider>
      <ChatAIProvider>
      <Head>
        <title>E.doto family</title>
      </Head>
      <Layout>
        {!isHomePage && <Header />}
        <Component {...pageProps} />
        <CookieConsent />
        {isHomePagex && <SSRAdvisorButton />}
        <ChatAIDrawer />
        <SSRChoice />
        <BookingDrawer />
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      </Layout>
      {!isHomePage && !hideFooter && <Footer />}
      {/* Navigation mobile du bas (mêmes pages que l'en-tête) */}
      {/* Le dashboard jeune garde aussi la barre mobile du site (19/10/2026) */}
      {(!isHomePage || pathname === "/mon-espace") && <MobileBottomNav />}
      </ChatAIProvider>
    </AuthProvider>
  )
}
