// pages/_app.jsx
import '../styles/globals.css'
import Head from 'next/head'
import Layout from '../components/Layout'
import { AuthProvider } from '../context/AuthContext'
import { Toaster } from "react-hot-toast"
export default function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Head>
        <title>e-doto family</title>
      </Head>
      <Layout>
        <Component {...pageProps} />
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      </Layout>
    </AuthProvider>
  )
}
