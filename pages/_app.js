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
  useEffect(() => {
    const logStart = (url) => {
      console.log("➡️ routeChangeStart:", url);
      console.trace("Navigation stack");
    };

    const logComplete = (url) => {
      console.log("✅ routeChangeComplete:", url);
    };

    const logError = (err, url) => {
      console.error("❌ routeChangeError vers:", url, err);
    };

    Router.events.on("routeChangeStart", logStart);
    Router.events.on("routeChangeComplete", logComplete);
    Router.events.on("routeChangeError", logError);
    const originalPush = Router.push;

    Router.push = (...args) => {
      console.log("🚨 router.push vers:", args[0]);
      console.trace("Stack navigation");
      return originalPush.apply(Router, args);
    };

    return () => {
      Router.events.off("routeChangeStart", logStart);
      Router.events.off("routeChangeComplete", logComplete);
      Router.events.off("routeChangeError", logError);
      Router.push = originalPush;
    };
  }, []);

  return (
    <AuthProvider>
      <Head>
        <title>e-doto family</title>
      </Head>
      <Layout>
        {!isHomePage && <Header />}
        <Component {...pageProps} />
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      </Layout>
      {!isHomePage && <Footer />}
    </AuthProvider>
  )
}
