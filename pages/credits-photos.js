import Head from "next/head";

// Crédits des photos libres utilisées sur le site (21/10/2026) : auteur, licence et lien vers la source,
// comme l'exigent les licences Creative Commons (CC BY, CC BY-SA).
const CREDITS = [
    { where: "Accueil, accès « Bénéficier de kits gratuits »", file: "/images/site/drawer-kits.jpg", author: "Surv1v4l1st", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Emergency_Hygiene_Kits,_Men_%26_Women.jpg" },
    { where: "Accueil, accès « Assistant SSR »", file: "/images/site/drawer-assistant.jpg", author: "Amira Guebsi", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Interf%C3%A9rence_Tunisia,_Lights_at_the_Medina.jpg" },
    { where: "Accueil, accès « Choisir ma contraception »", file: "/images/site/drawer-contraception.jpg", author: "USAID in Africa", license: "Domaine public", source: "https://commons.wikimedia.org/wiki/File:Family_planning_methods_(8329687815).jpg" },
    { where: "Assistant SSR, choix assistant ou rendez-vous", file: "/images/site/choix-assistant.jpg", author: "Adam Jones, Ph.D.", license: "CC BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:Young_Woman_-_Abomey_-_Benin.jpg" },
    { where: "Nos objectifs", file: "/images/site/objectifs.jpg", author: "The Wot-If? Trust", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:The_Wot-If_Trust,_South_Africa_11.jpg" },
    { where: "À propos, santé sexuelle et reproductive", file: "/images/site/apropos-sante.jpg", author: "USAID in Africa", license: "Domaine public", source: "https://commons.wikimedia.org/wiki/File:USAID_in_Madagascar_-_Family_Planning_Law_Passes_Another_Step_(31396118411).jpg" },
    { where: "À propos, soins et bien-être", file: "/images/site/apropos-soins.jpg", author: "USAID in Africa", license: "Domaine public", source: "https://commons.wikimedia.org/wiki/File:USAID_in_Madagascar_YALI_Participant_Who_Started_a_Health_Center_(30996683283).jpg" },
    { where: "Services", file: "/images/site/services.jpg", author: "Staff Sgt. Catessa Palone, U.S. Army", license: "Domaine public", source: "https://commons.wikimedia.org/wiki/File:US,_Ghana_work_together_in_ICU_care_during_AL26_MEDREX_(9669667).jpg" },
    { where: "Contraception, ouverture", file: "/images/site/contraception-hero.jpg", author: "DFID, UK Department for International Development", license: "CC BY 2.0", source: "https://commons.wikimedia.org/wiki/File:The_time_is_now_%E2%80%93_mums_waiting_for_family_planning_services_(7513648798).jpg" },
    { where: "Contraception, ouverture (petite photo)", file: "/images/site/contraception-detail.jpg", author: "Sunshine Fionah Komusana", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:B.A_Odongo,_The_Chosen.jpg" },
    { where: "Mon dashboard, ma contraception", file: "/images/site/contraception-dashboard.jpg", author: "Magoba.oscar", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Young_Women_Entrepreneurs_Who_Started_a_Tour_Agency_With_Only_8_dollars_in_August_2017.jpg" },
    { where: "Fiche implant contraceptif", file: "/images/contraception/implant.jpg", author: "Vera de Kok", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Implanon_01.jpg" },
    { where: "Fiche DIU au cuivre", file: "/images/contraception/diu-cuivre.jpg", author: "CooperSurgical", license: "CC BY 4.0", source: "https://commons.wikimedia.org/wiki/File:Paragard_IUD_-_DPLA_-_a864afd454989e551ed75d92aa14b186.jpg" },
    { where: "Fiche DIU hormonal", file: "/images/contraception/diu-hormonal.jpg", author: "Hic et nunc", license: "Domaine public", source: "https://commons.wikimedia.org/wiki/File:Mirena_IntraUterine_System.jpg" },
    { where: "Fiche injectable", file: "/images/contraception/injectable.jpg", author: "Ciell", license: "CC BY-SA 2.5", source: "https://commons.wikimedia.org/wiki/File:Prikpil.JPG" },
    { where: "Fiche pilule combinée", file: "/images/contraception/pilule-combinee.jpg", author: "Béria Lima de Rodríguez", license: "CC BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:Combined_oral_contraceptive_pill_(3).JPG" },
    { where: "Fiche patch contraceptif", file: "/images/contraception/patch.jpg", author: "James Heilman, MD", license: "CC BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:BirthControlPatch.JPG" },
    { where: "Fiche anneau vaginal", file: "/images/contraception/anneau.jpg", author: "Sakky", license: "Domaine public", source: "https://commons.wikimedia.org/wiki/File:NuvaRing_in_hand.jpg" },
    { where: "Fiche préservatif masculin", file: "/images/contraception/preservatif-masculin.jpg", author: "Tomhannen", license: "Domaine public", source: "https://commons.wikimedia.org/wiki/File:Condom_unrolled_durex.jpg" },
    { where: "Fiche préservatif féminin", file: "/images/contraception/preservatif-feminin.jpg", author: "Anka Grzywacz", license: "Domaine public", source: "https://commons.wikimedia.org/wiki/File:Female_condom.jpg" },
    { where: "Fiche pilule de contraception d’urgence", file: "/images/contraception/contraception-urgence.jpg", author: "Anka Grzywacz", license: "CC BY 2.5", source: "https://commons.wikimedia.org/wiki/File:Emergency_contraceptive.jpg" },
    { where: "Fiche méthode des jours fixes", file: "/images/contraception/methode-jours-fixes.jpg", author: "Dellex", license: "CC BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:Geburtenkontrollkette.jpg" },
    { where: "Fiche méthode de l’allaitement maternel", file: "/images/contraception/mama.jpg", author: "Allison Shigo", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Healing_Hands_of_Joy-Making_Motherhood_Safer_in_Ethiopia.jpg" },
];

export default function CreditsPhotos() {
    return (
        <>
            <Head><title>Crédits photos · E.doto family</title></Head>
            <main className="min-h-screen bg-[#F9F8F6]">
                <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:py-16">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-[#C2185B]">Mentions</p>
                    <h1 className="mt-2 font-serif text-4xl text-[#1A1814]">Crédits photos</h1>
                    <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[#57524B]">
                        Photos libres de droits utilisées sur E.doto family, avec leur auteur et leur licence. Merci à leurs auteurs.
                    </p>
                    <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {CREDITS.map((c) => (
                            <li key={c.file} className="flex gap-4 rounded-2xl border border-[#E9E5DF] bg-white p-3">
                                <img src={c.file} alt="" loading="lazy" className="h-20 w-24 shrink-0 rounded-xl object-cover" />
                                <div className="min-w-0 text-sm">
                                    <p className="font-medium text-[#1A1814]">{c.where}</p>
                                    <p className="mt-0.5 text-[#57524B]">{c.author} · {c.license}</p>
                                    <a href={c.source} target="_blank" rel="noopener noreferrer" className="mt-0.5 inline-block text-[13px] text-[#C2185B] hover:underline">Voir la source (Wikimedia Commons)</a>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>
            </main>
        </>
    );
}
