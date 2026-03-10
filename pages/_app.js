// pages/_app.jsx
import '../styles/globals.css'
import Head from 'next/head'
import Layout from '../components/Layout'
import { AuthProvider } from '../context/AuthContext'
import Footer from '../components/Footer';
import { Toaster } from "react-hot-toast"
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation"
import Router from "next/router";
import CookieConsent from '../components/CookieConsent';
const Header = dynamic(() => import("../components/header"), {
  ssr: false,
});
import { useEffect } from "react";


export default function MyApp({ Component, pageProps }) {
  let pathname = usePathname() || ""
  const isHomePage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname === "/succesregister"


  return (
    <AuthProvider>
      <Head>
        <title>e-doto family</title>
      </Head>
      <Layout>
        {!isHomePage && <Header />}
        <Component {...pageProps} />
        <CookieConsent />
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      </Layout>
      {!isHomePage && <Footer />}
    </AuthProvider>
  )
}
