"use client"
import { usePathname } from "next/navigation"
import FooterLogo from "./FooterLogo"
export default function Layout({ children }) {
  let pathname = usePathname() || ""

  // Vérifie si on est sur la page d’accueil 
  const isHomePage =
    pathname === "/login" ||
    pathname === "/register" ||
     pathname === "/pickup-dashboard" ||
    pathname.startsWith("/category") ||
    pathname.startsWith("/product") ||
    pathname.startsWith("/orders") ||
    pathname === "/admin/add-pickup-point";
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">

        {children}

      </main>

      {/* Footer visible uniquement sur la page d’accueil 
       <FooterLogo />*/}
      {!isHomePage && <FooterLogo />}
    </div>
  )
}
