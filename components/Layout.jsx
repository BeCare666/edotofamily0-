"use client"
import { usePathname } from "next/navigation"
import FooterLogo from "./FooterLogo"
export default function Layout({ children }) {
  const pathname = usePathname()

  // Vérifie si on est sur la page d’accueil
  const isHomePage = pathname === "/"

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">

        {children}

      </main>

      {/* Footer visible uniquement sur la page d’accueil */}
      {isHomePage && <FooterLogo />}
    </div>
  )
}
