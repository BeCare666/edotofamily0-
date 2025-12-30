"use client";
import React from "react";
import { ShoppingBag, Menu, X, Home, MapPin, Info, User, Gift, Phone, Target, Flag, FileText, Shield, LogOut, Star, Briefcase } from 'lucide-react';
import { ViewState } from '../types';
import { useRouter } from 'next/navigation';
import { useAuthContext } from "../context/AuthContext";
import logo from "../public/logo/logo.png";
import toast from "react-hot-toast"
import GoogleFormDrawer from "./GoogleFormDrawer";
import CalendlyDrawer from "./CalendlyDrawer";
import Image from "next/image"
interface HeaderProps {
    currentView: ViewState;
    setView: (view: ViewState) => void;
    cartItemCount?: number;
    isAuthenticated?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ currentView, setView, cartItemCount = 0, isAuthenticated = false }) => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [openShop, setOpenShop] = React.useState(false);
    const [openShopMobile, setOpenShopMobile] = React.useState(false);
    const [showUserMenu, setShowUserMenu] = React.useState(false);
    const [showUserMenuDesktop, setShowUserMenuDesktop] = React.useState(false);
    const [openForm, setOpenForm] = React.useState(false);
    const [openCalendly, setOpenCalendly] = React.useState(false);
    const router = useRouter();
    const { user, logout } = useAuthContext();
    const HandleGotoShop = (id: number) => {
        router.push(`/category/categories_id=${id}`);

    }
    const handleLogout = async () => {
        try {
            await logout()
            toast.success("Déconnexion réussie 👋")
        } catch (error) {
            toast.error("Une erreur est survenue lors de la déconnexion")
        }
    }
    const handleLogin = () => {
        if (typeof window !== "undefined") {
            localStorage.setItem("redirect_after_login", window.location.pathname);
        }
        router.push("/login");
    }
    // Determine if header should be visible or styled differently based on view.
    const isAuthPage = currentView === ViewState.LOGIN || currentView === ViewState.REGISTER;

    if (isAuthPage) return null; // Hide header on login/register pages

    const navItems = [
        { label: 'Accueil', view: ViewState.HOME, icon: Home },
        { label: 'Boutique', view: ViewState.SHOP, icon: ShoppingBag },
        { label: 'Campagnes', view: ViewState.CAMPAIGNS, icon: Gift },
        { label: 'Centres SSR', view: ViewState.CENTERS, icon: MapPin },
        { label: 'A propos', view: ViewState.ABOUT, icon: Info },
    ];
    //{ id: 1, name: "Fertilité", slug: "fertilite", icon: "https://img.icons8.com/fluency/48/product.png" },
    const categories = [
        { id: 2, name: "Grossesse", slug: "grossesse", icon: "https://img.icons8.com/?size=48&id=s3Jrlqy6yqSl&format=png" },
        { id: 3, name: "Intimité", slug: "intimite", icon: "https://img.icons8.com/fluency/48/car.png" },
        { id: 4, name: "Soins", slug: "soins", icon: "https://img.icons8.com/fluency/48/coal.png" },
        { id: 5, name: "Bien-être", slug: "bien-etre", icon: "https://img.icons8.com/fluency/48/factory.png" }
    ];
    const handleFinalize = () => {

        const formUrl = "https://docs.google.com/forms/d/e/1FAIpQLScY-R5SkFwByPEDyzW7AxVmEoEc2NSTI4RYYtvlp0w0jhEIjg/viewform?usp=publish-editor";
        window.open(formUrl, "_blank", "noopener,noreferrer")
    };
    return (
        <>
            <header className="sticky top-0 z-50 w-full glass-card border-b border-pink-100 shadow-sm ">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        {/* Logo */}
                        <div
                            className="flex-shrink-0 flex items-center cursor-pointer gap-2"
                            onClick={() => setView(ViewState.HOME)}
                        >
                            <div className="w-13 h-13 bg-gradient-to-tr from-pink-400 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-pink-200">
                                <Image src={logo} alt="E-Doto logo" width={40} height={40} className="rounded-full object-cover" />
                            </div>
                            <span className="font-bold text-2xl tracking-tight text-slate-800">
                                <span className="text-pink-500">E-Doto</span> Family
                            </span>
                        </div>

                        {/* Desktop Nav */}
                        <nav className="hidden md:flex space-x-4 lg:space-x-8">
                            {navItems.map((item) => {

                                const isShop = item.view === ViewState.SHOP;
                                const isCampaigns = item.view === ViewState.CAMPAIGNS;
                                const isCenters = item.view === ViewState.CENTERS;
                                const isAbout = item.view === ViewState.ABOUT;
                                const isHome = item.view === ViewState.HOME;

                                // ----------- 🚀 CAS SPÉCIAL : SHOP -------------
                                if (isShop) {
                                    return (
                                        <div key={item.label} className="relative">
                                            <button
                                                onClick={() => setOpenShop((prev) => !prev)}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200
                                                ${openShop
                                                        ? "bg-pink-50 text-pink-600 ring-1 ring-pink-200"
                                                        : "text-slate-600 hover:text-pink-500 hover:bg-pink-50/50"
                                                    }`}
                                            >
                                                <item.icon size={16} />
                                                {item.label}
                                                <span className="text-xs">{openShop ? "▲" : "▼"}</span>
                                            </button>

                                            {openShop && (
                                                <div className="absolute mt-2 w-56 bg-white shadow-lg border rounded-xl z-50">
                                                    <ul className="divide-y divide-gray-100">
                                                        {categories.map((cat) => (
                                                            <li
                                                                key={cat.id}
                                                                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50"
                                                                onClick={() => {
                                                                    HandleGotoShop(cat.id);
                                                                    setOpenShop(false);
                                                                }}
                                                            >
                                                                <img src={cat.icon} className="w-6 h-6" alt={cat.name} />
                                                                <span className="text-gray-700 font-medium">{cat.name}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    );
                                }

                                // ----------- 🚀 ROUTER POUR LES AUTRES ITEMS -------------
                                const handleRoute = () => {
                                    if (isCampaigns) router.push("/campaigns");
                                    else if (isCenters) setOpenCalendly(true);
                                    else if (isAbout) router.push("/about");
                                    else if (isHome) router.push("/");
                                    else setView(item.view);
                                };

                                return (
                                    <button
                                        key={item.label}
                                        onClick={handleRoute}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 
                                    ${currentView === item.view
                                                ? "bg-pink-50 text-pink-600 ring-1 ring-pink-200"
                                                : "text-slate-600 hover:text-pink-500 hover:bg-pink-50/50"
                                            }`}
                                    >
                                        <item.icon size={16} />
                                        {item.label}
                                    </button>
                                );
                            })}
                        </nav>



                        {/* CTA  */}
                        <div className="flex items-center gap-4">

                            {/* 🔥 USER DROPDOWN (DESKTOP) */}
                            {user ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setShowUserMenuDesktop((prev) => !prev)}
                                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-700 text-sm font-medium transition-all hover:border-pink-300 hover:text-pink-600"
                                    >
                                        {/* Avatar */}
                                        <div className="w-7 h-7 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">
                                            <User size={16} />
                                        </div>

                                        <span className="hidden sm:inline">{user?.name || "Mon Espace"}</span>
                                        <span className="text-xs">{showUserMenuDesktop ? "▲" : "▼"}</span>
                                    </button>

                                    {/* MENU */}
                                    {showUserMenuDesktop && (
                                        <div className="absolute right-0 mt-2 w-60 bg-white shadow-xl border border-pink-100 rounded-xl overflow-hidden z-50 animate-fade-in">

                                            {/* Header */}
                                            <div className="px-4 py-3 bg-pink-50 border-b border-pink-100">
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {user?.name}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">
                                                    {user?.email}
                                                </p>
                                            </div>

                                            {/* Liens */}
                                            <button
                                                onClick={() => {
                                                    router.push("/profile");
                                                    setShowUserMenuDesktop(false);
                                                }}
                                                className="w-full text-left px-4 py-3 flex items-center gap-2 hover:bg-pink-50 transition text-gray-700"
                                            >
                                                <User size={16} /> Profil
                                            </button>

                                            <button
                                                onClick={() => {
                                                    router.push("/orders");
                                                    setShowUserMenuDesktop(false);
                                                }}
                                                className="w-full text-left px-4 py-3 flex items-center gap-2 hover:bg-pink-50 transition text-gray-700"
                                            >
                                                <ShoppingBag size={16} /> Commandes
                                            </button>
                                            {user?.role === "super_pickuppoint" ? (
                                                <button
                                                    onClick={() => {
                                                        router.push("/pickup-dashboard");
                                                        setShowUserMenuDesktop(false);
                                                    }}
                                                    className="w-full text-left px-4 py-3 flex items-center gap-2 hover:bg-pink-50 transition text-gray-700"
                                                >
                                                    <Star size={16} /> Dashboard
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        handleFinalize();
                                                        setShowUserMenuDesktop(false);
                                                    }}
                                                    className="w-full text-left px-4 py-3 flex items-center gap-2 hover:bg-pink-50 transition text-gray-700"
                                                >
                                                    <Star size={16} /> Devenir Point de Retrait
                                                </button>
                                            )}



                                            {/* Logout */}
                                            <button
                                                onClick={() => {
                                                    handleLogout();
                                                    setShowUserMenuDesktop(false);
                                                }}
                                                className="w-full text-left px-4 py-3 flex items-center gap-2 text-pink-600 hover:bg-pink-50 transition font-medium"
                                            >
                                                <LogOut size={16} /> Déconnexion
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <button
                                    onClick={handleLogin}
                                    className="hidden md:flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
                                >
                                    <span>Connexion</span>
                                </button>
                            )}

                            {/* 🛍️ Panier */}
                            <button
                                className=" hidden p-2 relative text-slate-600 hover:text-pink-500 transition-colors"
                                onClick={() => setView(ViewState.CART)}
                            >
                                <ShoppingBag size={24} />
                                {cartItemCount > 0 && (
                                    <span className="absolute top-0 right-0 h-5 w-5 bg-pink-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                                        {cartItemCount}
                                    </span>
                                )}
                            </button>

                            {/* 📱 Menu Mobile */}
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="md:hidden p-2 text-slate-600 hover:text-pink-500"
                            >
                                {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                            </button>
                        </div>

                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden absolute top-20 left-0 w-full bg-white/95 backdrop-blur-md border-b border-pink-100 shadow-xl animate-fade-in h-screen z-50">
                        <div className="px-4 pt-2 pb-6 space-y-2">

                            {navItems.map((item) => {
                                const isShop = item.view === ViewState.SHOP;
                                const isCampaigns = item.view === ViewState.CAMPAIGNS;
                                const isCenters = item.view === ViewState.CENTERS;
                                const isAbout = item.view === ViewState.ABOUT;
                                const isHome = item.view === ViewState.HOME;

                                const active = currentView === item.view;

                                // ---------- 🚀 CAS SPÉCIAL : SHOP SUR MOBILE ----------
                                if (isShop) {
                                    return (
                                        <div key={item.label} className="w-full">
                                            <button
                                                onClick={() => setOpenShopMobile((prev) => !prev)}
                                                className={`
                                                flex items-center justify-between w-full px-4 py-3 rounded-xl
                                                text-base font-medium
                                                ${active ? "bg-pink-50 text-pink-600" : "text-slate-600"}
                                            `}
                                            >
                                                <span className="flex items-center gap-3">
                                                    <item.icon size={20} />
                                                    {item.label}
                                                </span>
                                                <span className="text-xs">{openShopMobile ? "▲" : "▼"}</span>
                                            </button>

                                            {/* Dropdown catégories SHOP */}
                                            {openShopMobile && (
                                                <div className="ml-6 mt-1 space-y-1">
                                                    {categories.map((cat) => (
                                                        <button
                                                            key={cat.id}
                                                            onClick={() => {
                                                                HandleGotoShop(cat.id);
                                                                setIsMenuOpen(false);
                                                                setOpenShopMobile(false);
                                                            }}
                                                            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-base text-slate-700 bg-white hover:bg-gray-50"
                                                        >
                                                            <img src={cat.icon} className="w-6 h-6" alt={cat.name} />
                                                            {cat.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                }

                                // ---------- 🔥 AUTRES ITEMS AVEC ROUTER ----------
                                const handleClick = () => {
                                    if (isCampaigns) router.push("/campaigns");
                                    else if (isCenters) setOpenCalendly(true);
                                    else if (isAbout) router.push("/about");
                                    else if (isHome) router.push("/");
                                    else router.push('/'); // fallback

                                    setIsMenuOpen(false);
                                };

                                return (
                                    <button
                                        key={item.label}
                                        onClick={handleClick}
                                        className={`
                                        flex items-center gap-3 w-full px-4 py-3 rounded-xl text-base font-medium
                                        ${active ? "bg-pink-50 text-pink-600" : "text-slate-600"}
                                    `}
                                    >
                                        <item.icon size={20} />
                                        {item.label}
                                    </button>
                                );
                            })}

                            {/* ---------- Auth section ---------- */}
                            <div className="pt-4 mt-4 border-t border-slate-100">

                                {/* BOUTON PRINCIPAL — ouvrira le dropdown user */}
                                <button
                                    onClick={() => setShowUserMenu((prev) => !prev)}
                                    className="w-full bg-slate-100 text-slate-900 px-5 py-3 rounded-xl text-base font-medium flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        <User size={20} />
                                        {user ? "Mon compte" : "Compte"}
                                    </div>

                                    <span className="text-sm">{showUserMenu ? "▲" : "▼"}</span>
                                </button>

                                {/* DROPDOWN USER */}
                                {showUserMenu && (
                                    <div className="mt-2 bg-white border border-pink-100 rounded-xl shadow-md overflow-hidden animate-fade-in">

                                        {user ? (
                                            <>
                                                {/* Header utilisateur */}
                                                <div className="px-4 py-3 bg-pink-50 border-b border-pink-100">
                                                    <p className="text-sm font-semibold text-gray-800">
                                                        {user?.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500 truncate">
                                                        {user?.email}
                                                    </p>
                                                </div>

                                                {/* Liens */}
                                                <button
                                                    onClick={() => {
                                                        router.push("/profile");
                                                        setShowUserMenu(false);
                                                        setIsMenuOpen(false);
                                                    }}
                                                    className="flex items-center gap-2 w-full px-4 py-3 hover:bg-pink-50 transition text-gray-700"
                                                >
                                                    <User size={18} /> Profil
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        router.push("/orders");
                                                        setShowUserMenu(false);
                                                        setIsMenuOpen(false);
                                                    }}
                                                    className="flex items-center gap-2 w-full px-4 py-3 hover:bg-pink-50 transition text-gray-700"
                                                >
                                                    <ShoppingBag size={18} /> Commandes
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        router.push("/partner");
                                                        setShowUserMenu(false);
                                                        setIsMenuOpen(false);
                                                    }}
                                                    className="flex items-center gap-2 w-full px-4 py-3 hover:bg-pink-50 transition text-gray-700"
                                                >
                                                    <Star size={18} /> Devenir un centre
                                                </button>

                                                {/* Logout */}
                                                <button
                                                    onClick={() => {
                                                        handleLogout();
                                                        setShowUserMenu(false);
                                                        setIsMenuOpen(false);
                                                    }}
                                                    className="flex items-center gap-2 w-full px-4 py-3 text-pink-600 hover:bg-pink-50 transition font-medium"
                                                >
                                                    <LogOut size={18} /> Déconnexion
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        handleLogin();
                                                        setShowUserMenu(false);
                                                        setIsMenuOpen(false);
                                                    }}
                                                    className="block w-full px-4 py-3 hover:bg-pink-50 text-gray-700"
                                                >
                                                    Connexion
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        router.push("/register");
                                                        setShowUserMenu(false);
                                                        setIsMenuOpen(false);
                                                    }}
                                                    className="block w-full px-4 py-3 hover:bg-pink-50 text-gray-700"
                                                >
                                                    Créer un compte
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>


                        </div>
                    </div>
                )}
            </header>
            <GoogleFormDrawer
                isOpen={openForm}
                onClose={() => setOpenForm(false)}
                formUrl="https://docs.google.com/forms/d/e/1FAIpQLScY-R5SkFwByPEDyzW7AxVmEoEc2NSTI4RYYtvlp0w0jhEIjg/viewform?usp=publish-editor"
            />
            <CalendlyDrawer isOpen={openCalendly} onClose={() => setOpenCalendly(false)} />
        </>
    );
};
export default Header;