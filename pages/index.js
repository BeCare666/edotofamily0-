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
    { id: 1, title: 'fertlite', image: '/icons/fertility.avif', slug: 'fertlite' },
    { id: 2, title: 'Grossesse', image: '/icons/grossesse.avif', slug: 'grossesse' },
    { id: 3, title: 'Intimité', image: '/icons/intimite.jpg', slug: 'intimite' },
    { id: 4, title: 'Soins', image: '/icons/soins.png', slug: 'soins' },
    { id: 5, title: 'Bien-être', image: '/icons/bien-etre.avif', slug: 'bien-etre' },
  ]

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-5 h-[100vh] ">
      <header className="mb-8 text-center relative overflow-hidden ">
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#0F172A] relative z-10">
          Bienvenue sur <span className="text-[#FF6EA9]">E‑DOTO</span> Family
        </h2>
        <p className="text-sm md:text-base text-gray-600 max-w-xl mx-auto relative z-10 p-4">
          Votre destination pour contraception, maternité et bien-être.
        </p>

        {/* Formes artistiques flottantes */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-[-50px] left-1/4 w-48 h-48 bg-pink-300 opacity-20 rounded-full animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-purple-300 opacity-15 rounded-full animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/3 w-56 h-56 bg-indigo-300 opacity-10 rounded-full animate-blob animation-delay-4000"></div>
        </div>
      </header>




      <OrbitalMenu categories={categories} radius={120} />

      <section className=" mt-12 text-center max-w-2xl px-6">
        <h3 className="hidden text-xl font-semibold">Soins conçus avec bienveillance</h3>
        <p className="text-gray-600 mt-3 text-[11px] ">  © {new Date().getFullYear()} E-DOTO Family — Tous droits réservés</p>
      </section>
    </div>
  )
}