import OrbitalMenu from '../components/OrbitalMenu'
import { useEffect, useState } from "react";

export default function Home() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    console.log("Token utilisateur :", storedToken);
    setToken(storedToken);
  }, []);
  const categories = [
    { id: 1, title: 'Fertilité', image: '/icons/fertility.avif', slug: 'fertlite' },
    { id: 2, title: 'Grossesse', image: '/icons/grossesse.avif', slug: 'grossesse' },
    { id: 3, title: 'Intimité', image: '/icons/intimite.jpg', slug: 'intimite' },
    { id: 4, title: 'Soins', image: '/icons/soins.png', slug: 'soins' },
    { id: 5, title: 'Bien-être', image: '/icons/bien-etre.avif', slug: 'bien-etre' },
  ]

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-5 h-[100vh] ">
      <header className="mb-6 text-center">
        <h2 className="text-4xl font-bold text-[#0F172A]">Bienvenue sur <span className="text-[#FF6EA9]">E‑DOTO</span> Family</h2>
        <p className="text-sm text-gray-600">Une expérience premium pour les soins et la santé</p>
      </header>

      <OrbitalMenu categories={categories} radius={120} />

      <section className=" mt-12 text-center max-w-2xl px-6">
        <h3 className="hidden text-xl font-semibold">Soins conçus avec bienveillance</h3>
        <p className="text-gray-600 mt-3 text-[11px] ">  © {new Date().getFullYear()} E-DOTO Family — Tous droits réservés</p>
      </section>
    </div>
  )
}