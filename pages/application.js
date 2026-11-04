import Head from "next/head";
import { useEffect, useState } from "react";

// Application Android E.doto family (04/11/2026) : TWA distribuée par fichier APK, en attendant le Play Store.
// L'application affiche ce site : elle se met à jour toute seule à chaque déploiement.
// À chaque nouvel APK : changer VERSION, TAILLE et SHA256 (rapports/PLAN_APPLICATION_ANDROID_TWA.md).
const APK = "/telechargement/edoto-family.apk";
const VERSION = "1.0.0";
const TAILLE = "1,8 Mo";
const SHA256 = "E1:1F:1E:25:AD:6B:FF:FE:A6:A0:14:93:C5:C8:4A:37:04:11:A7:27:B1:B8:A2:B7:60:BD:AB:07:72:16:98:87";

const ETAPES = [
    "Touchez « Télécharger l'application » et attendez la fin du téléchargement.",
    "Ouvrez le fichier edoto-family.apk depuis la notification ou le dossier Téléchargements.",
    "Si Android le demande, autorisez votre navigateur à installer des applications (Paramètres, puis « Autoriser cette source »), puis revenez en arrière.",
    "Touchez « Installer ». Si Play Protect affiche « application non reconnue », touchez « Plus de détails » puis « Installer quand même ».",
    "Ouvrez E.doto family depuis l'écran d'accueil et connectez vous comme sur le site.",
];

export default function Application() {
    const [appareil, setAppareil] = useState("autre");
    useEffect(() => {
        const ua = navigator.userAgent || "";
        if (/android/i.test(ua)) setAppareil("android");
        else if (/iphone|ipad|ipod/i.test(ua)) setAppareil("iphone");
    }, []);

    return (
        <>
            <Head><title>Application Android · E.doto family</title></Head>
            <main className="min-h-screen bg-[#F9F8F6]">
                <section className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:py-16">
                    <div>
                        <p className="text-[11px] uppercase tracking-[0.2em] text-[#C2185B]">Application</p>
                        <h1 className="mt-2 font-serif text-4xl text-[#1A1814]">E.doto family sur votre téléphone Android</h1>
                        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-[#57524B]">
                            Kits gratuits, produits, téléconsultation et conseils, en plein écran depuis votre écran d'accueil.
                            L'application se met à jour toute seule. Aucune donnée de santé n'est gardée sur le téléphone.
                        </p>

                        {appareil === "iphone" ? (
                            <div className="mt-6 rounded-2xl border border-[#E9E5DF] bg-white p-5 text-sm text-[#57524B]">
                                <p className="font-medium text-[#1A1814]">Sur iPhone</p>
                                <p className="mt-1">
                                    Ce fichier ne s'installe que sur Android. Sur iPhone, ouvrez ce site dans Safari, touchez le bouton
                                    Partager puis « Sur l'écran d'accueil ».
                                </p>
                            </div>
                        ) : (
                            <div className="mt-6">
                                <a
                                    href={APK}
                                    download
                                    className="inline-flex items-center gap-3 rounded-full bg-[#C2185B] px-6 py-3 text-[15px] font-medium text-white hover:bg-[#A3144C]"
                                >
                                    <img src="/app/icon-192.png" alt="" className="h-7 w-7 rounded-lg bg-white" />
                                    Télécharger l'application
                                </a>
                                <p className="mt-3 text-[13px] text-[#57524B]">
                                    Version {VERSION} · {TAILLE} · Android 7 ou plus récent
                                </p>
                                {appareil === "autre" && (
                                    <p className="mt-1 text-[13px] text-[#57524B]">
                                        Ouvrez cette page sur votre téléphone Android pour installer l'application.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                    <img
                        src="/images/site/choix-assistant.jpg"
                        alt=""
                        className="h-80 w-full rounded-3xl object-cover lg:h-[26rem]"
                    />
                </section>

                <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
                    <h2 className="font-serif text-2xl text-[#1A1814]">Installer en cinq étapes</h2>
                    <ol className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {ETAPES.map((e, i) => (
                            <li key={i} className="flex gap-4 rounded-2xl border border-[#E9E5DF] bg-white p-4 text-sm text-[#57524B]">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F9F8F6] font-medium text-[#C2185B]">{i + 1}</span>
                                <span className="leading-relaxed">{e}</span>
                            </li>
                        ))}
                    </ol>

                    <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-[#E9E5DF] bg-white p-5 text-sm text-[#57524B]">
                            <p className="font-medium text-[#1A1814]">Vous avez déjà l'icône E.doto family ?</p>
                            <p className="mt-1 leading-relaxed">
                                Si vous aviez ajouté le site à votre écran d'accueil depuis Chrome, vous aurez deux icônes.
                                Après l'installation, gardez la nouvelle et supprimez l'ancienne (appui long, puis Désinstaller ou Supprimer).
                            </p>
                        </div>
                        <div className="rounded-2xl border border-[#E9E5DF] bg-white p-5 text-sm text-[#57524B]">
                            <p className="font-medium text-[#1A1814]">Vérifier que le fichier est authentique</p>
                            <p className="mt-1 leading-relaxed">
                                Téléchargez l'application uniquement depuis www.edotofamily.com. Empreinte SHA 256 du fichier :
                            </p>
                            <p className="mt-2 break-all font-mono text-[12px] text-[#1A1814]">{SHA256}</p>
                        </div>
                    </div>

                    {/* Deux façons d'installer (04/11/2026, plan étape 9.4) : renvoi vers la façon 2 de l'accueil */}
                    <div className="mt-3 rounded-2xl border border-[#E9E5DF] bg-white p-5 text-sm text-[#57524B]">
                        <p className="font-medium text-[#1A1814]">Vous préférez ne rien télécharger ?</p>
                        <p className="mt-1 leading-relaxed">
                            Ajoutez simplement l'icône E.doto family sur votre écran d'accueil depuis votre navigateur, sur Android comme sur iPhone.
                            Le contenu est le même ; une seule des deux façons suffit.
                        </p>
                        <a href="/#application" className="mt-2 inline-block font-medium text-[#C2185B] hover:underline">
                            Voir les deux façons d'installer
                        </a>
                    </div>
                </section>
            </main>
        </>
    );
}
