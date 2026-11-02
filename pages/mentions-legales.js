import Head from "next/head";
import Link from "next/link";
import { telHref, useSiteInfo } from "../lib/siteInfo";

// Mentions légales (02/11/2026), demandées par l'APDP (autorisation n° 2026-327/AT/APDP/DST/SC, point c).
// Remplace l'ancienne page /cgv (octobre 2025), qui citait la loi française : /cgv redirige ici (next.config.js).
// Uniquement des informations déjà publiées : ancienne page /cgv (société, capital), politique de confidentialité
// (responsable du traitement, prestataires), informations du site réglées par le super admin (adresse, téléphone, e-mail).
const UPDATED_AT = "2 novembre 2026";

const HOSTS = [
    { name: "LWS", role: "nom de domaine edotofamily.com" },
    { name: "Vercel", role: "hébergement du site et de l'administration" },
    { name: "Render", role: "hébergement du serveur (API)" },
    { name: "TiDB Cloud", role: "base de données (Europe, Allemagne)" },
    { name: "Cloudinary", role: "stockage des images et des factures" },
];

function Block({ title, children }) {
    return (
        <section className="rounded-2xl border border-[#E9E5DF] bg-white p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-[#1A1814]">{title}</h2>
            <div className="mt-3 space-y-2 text-[15px] leading-relaxed text-[#57524B]">{children}</div>
        </section>
    );
}

const A = ({ href, children }) => (
    <Link href={href} className="text-[#C2185B] hover:underline">{children}</Link>
);

export default function MentionsLegales() {
    const info = useSiteInfo();

    return (
        <>
            <Head><title>Mentions légales · E.doto family</title></Head>
            <main className="min-h-screen bg-[#F9F8F6]">
                <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-[#C2185B]">Légal</p>
                    <h1 className="mt-2 font-serif text-4xl text-[#1A1814]">Mentions légales</h1>
                    <p className="mt-3 text-[13px] text-[#8A837A]">Dernière mise à jour : {UPDATED_AT}</p>

                    <div className="mt-8 space-y-4">
                        <Block title="Éditeur de la plateforme">
                            <p>
                                La plateforme <strong className="font-medium text-[#1A1814]">E.doto family</strong> (edotofamily.com)
                                est éditée par <strong className="font-medium text-[#1A1814]">BeCare SARL</strong>, au capital social de 1 000 000 FCFA.
                            </p>
                            <p>Siège social : {info.address}</p>
                            <p>
                                Téléphone : <a href={telHref(info.phone)} className="text-[#C2185B] hover:underline">{info.phone}</a>
                                {" · "}E-mail : <a href={`mailto:${info.email}`} className="text-[#C2185B] hover:underline">{info.email}</a>
                            </p>
                            <p>Directeur de la publication : SODINYESSI Sènou Gérard, Président Directeur Général de BeCare.</p>
                        </Block>

                        <Block title="Objet de la plateforme">
                            <p>
                                E.doto family propose la vente de produits de santé avec retrait en point de retrait, des kits gratuits lors de campagnes,
                                la téléconsultation et la mise en relation avec des centres de soins, l'accompagnement au choix d'une contraception
                                et un assistant d'information sur la santé sexuelle et reproductive.
                            </p>
                            <p>Les informations publiées ne remplacent pas l'avis d'un professionnel de santé.</p>
                        </Block>

                        <Block title="Hébergement et prestataires techniques">
                            <ul className="list-disc space-y-1 pl-5">
                                {HOSTS.map((h) => (
                                    <li key={h.name}><span className="font-medium text-[#1A1814]">{h.name}</span> : {h.role}</li>
                                ))}
                            </ul>
                            <p>La liste complète des prestataires figure dans la <A href="/privacy">politique de confidentialité</A>.</p>
                        </Block>

                        <Block title="Données personnelles">
                            <p>
                                Responsable du traitement : SODINYESSI Sènou Gérard, PDG de BeCare
                                (<a href="mailto:becare.fr.ge@gmail.com" className="text-[#C2185B] hover:underline">becare.fr.ge@gmail.com</a>).
                            </p>
                            <p>
                                Délégué à la protection des données : M. Isaac T. Habib GBENOU, téléphone{" "}
                                <a href="tel:+2290161614747" className="text-[#C2185B] hover:underline">+229 01 61 61 47 47</a>.
                            </p>
                            <p>
                                Traitement autorisé par l'Autorité de Protection des Données à caractère Personnel (APDP) :
                                autorisation n° 2026-327/AT/APDP/DST/SC du 25 juin 2026.
                            </p>
                            <p>
                                Données collectées, finalités, durée de conservation, destinataires, transferts et vos droits (accès, portabilité,
                                opposition, rectification, suppression, oubli) : voir la <A href="/privacy">politique de confidentialité</A>.
                                Cookies et traces de connexion : voir <A href="/privacy#cookies">cette section</A>. Vous pouvez aussi saisir l'APDP (www.apdp.bj).
                            </p>
                        </Block>

                        <Block title="Conditions d'utilisation">
                            <p>L'utilisation de la plateforme est soumise aux <A href="/terms">termes et conditions</A>.</p>
                        </Block>

                        <Block title="Propriété intellectuelle">
                            <p>
                                Le nom E.doto family, son logo et les contenus de la plateforme appartiennent à BeCare ; toute reproduction sans autorisation est interdite.
                                Les photos libres utilisées, leurs auteurs et leurs licences sont indiqués dans les <A href="/credits-photos">crédits photos</A>.
                            </p>
                        </Block>

                        <Block title="Droit applicable">
                            <p>
                                La plateforme est soumise au droit de la République du Bénin, notamment à la loi n° 2017-20 du 20 avril 2018
                                portant code du numérique en République du Bénin, modifiée par la loi n° 2020-35 du 06 janvier 2021.
                            </p>
                        </Block>
                    </div>
                </div>
            </main>
        </>
    );
}
