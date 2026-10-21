import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Clock3, HeartHandshake, Loader2, LockKeyhole, Search, ShieldCheck, Sparkles } from "lucide-react";
import { api } from "../../components/pickup-dashboard/api";
import { AdoptionSteps, DoctorBadge, MethodVisual, STEP_TEXT, StiBadge } from "../../components/contraception/ContraShared";

// Catalogue des contraceptifs modernes (21/10/2026) : fiches de l'admin (par défaut : manuel OMS),
// deux familles (avec ou sans médecin), puis la fiche détaillée et la demande d'adoption en 7 étapes.
const spring = { type: "spring", stiffness: 240, damping: 30 };
const FILTERS = [
    { key: "all", label: "Toutes" },
    { key: "doctor", label: "Avec un médecin" },
    { key: "self", label: "Sans médecin" },
];
const GROUPS = {
    doctor: {
        title: "Avec un médecin",
        text: "Pose, prescription ou intervention par un professionnel de santé : une rencontre en visio ou par téléphone est prévue avant de choisir.",
    },
    self: {
        title: "Sans médecin",
        text: "Accessibles sans prescription : votre demande est suivie jusqu’au centre partenaire, sans rencontre obligatoire.",
    },
};

// Efficacité courte pour la carte : « Plus de 99 % », « 93 % en utilisation courante »…
const shortEfficacy = (e) => String(e || "").split(" (")[0].split(",")[0];

function MethodCard({ m, index }) {
    return (
        <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ ...spring, delay: (index % 3) * 0.05 }}>
            <Link
                href={`/contraception/${m.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-[26px] border border-[#E9E5DF] bg-white transition duration-300 hover:-translate-y-1 hover:border-[#1A1814] hover:shadow-[0_24px_50px_-30px_rgba(26,24,20,0.45)]"
            >
                <div className="relative">
                    <MethodVisual method={m} rounded="rounded-none" className="aspect-[4/3] transition-transform duration-700 group-hover:scale-[1.03]" />
                    <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                        <DoctorBadge requires={m.requires_doctor} light />
                        {m.protects_sti && <StiBadge />}
                    </div>
                </div>
                <div className="flex flex-1 flex-col p-5 sm:p-6">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-[#8A837A]">{m.family}</p>
                    <h3 className="mt-1 font-serif text-[22px] leading-tight text-[#1A1814]">{m.name}</h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#57524B]">{m.summary}</p>
                    <div className="mt-auto flex items-end justify-between gap-3 pt-5">
                        <div className="min-w-0 space-y-1 text-[12.5px] text-[#6B655D]">
                            {m.efficacy && <p className="flex items-center gap-1.5 truncate"><ShieldCheck size={13} className="shrink-0 text-[#1A1814]" /> {shortEfficacy(m.efficacy)}</p>}
                            {m.duration && <p className="flex items-center gap-1.5 truncate"><Clock3 size={13} className="shrink-0 text-[#1A1814]" /> {m.duration}</p>}
                        </div>
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#E9E5DF] text-[#1A1814] transition duration-300 group-hover:rotate-45 group-hover:border-[#1A1814] group-hover:bg-[#1A1814] group-hover:text-white">
                            <ArrowUpRight size={17} />
                        </span>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

export default function ContraceptionPage() {
    const [methods, setMethods] = useState(null);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");

    useEffect(() => {
        api("contraception/methods").then(setMethods).catch((e) => setError(e.message || "Liste indisponible pour le moment."));
    }, []);

    const counts = useMemo(() => {
        const l = methods || [];
        return { all: l.length, doctor: l.filter((m) => m.requires_doctor).length, self: l.filter((m) => !m.requires_doctor).length };
    }, [methods]);

    const visible = useMemo(() => {
        const t = search.trim().toLowerCase();
        return (methods || []).filter(
            (m) =>
                (filter === "all" || (filter === "doctor" ? m.requires_doctor : !m.requires_doctor)) &&
                (!t || [m.name, m.family, m.summary].some((x) => String(x || "").toLowerCase().includes(t))),
        );
    }, [methods, filter, search]);

    const groups = filter === "all" ? ["doctor", "self"] : [filter];

    return (
        <>
            <Head>
                <title>Contraception · E.doto family</title>
                <meta name="description" content="Les contraceptifs modernes reconnus, expliqués simplement : avantages, inconvénients, critères, et un accompagnement en 7 étapes jusqu’au centre partenaire." />
            </Head>
            <main className="min-h-screen bg-[#F9F8F6]">
                {/* Ouverture */}
                <section className="mx-auto grid max-w-7xl gap-10 px-4 pb-12 pt-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14 lg:px-8 lg:pb-16 lg:pt-14">
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={spring}>
                        <span className="inline-flex items-center gap-2 rounded-full border border-[#E9E5DF] bg-white px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-[#C2185B]">
                            <HeartHandshake size={13} /> Contraception
                        </span>
                        <h1 className="mt-5 font-serif text-[40px] leading-[1.05] text-[#1A1814] sm:text-[56px]">
                            Choisir sa contraception, en confiance.
                        </h1>
                        <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-[#57524B]">
                            Les méthodes modernes reconnues, expliquées simplement : comment elles agissent, comment elles se font, leurs avantages, leurs inconvénients et pour qui elles conviennent. Puis un accompagnement en 7 étapes, jusqu’au centre partenaire.
                        </p>
                        <ul className="mt-7 grid gap-3 sm:grid-cols-3">
                            {[
                                { icon: Sparkles, t: "Méthodes reconnues", d: "Informations du manuel OMS" },
                                { icon: HeartHandshake, t: "Accompagnement", d: "7 étapes suivies" },
                                { icon: LockKeyhole, t: "Confidentiel", d: "Votre demande reste privée" },
                            ].map(({ icon: Icon, t, d }) => (
                                <li key={t} className="rounded-2xl border border-[#E9E5DF] bg-white p-4">
                                    <Icon size={18} className="text-[#C2185B]" />
                                    <p className="mt-2 text-sm font-semibold text-[#1A1814]">{t}</p>
                                    <p className="text-[12.5px] text-[#6B655D]">{d}</p>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...spring, delay: 0.08 }} className="relative">
                        <div className="overflow-hidden rounded-[32px]">
                            <img src="/images/twopersons.avif" alt="" className="aspect-[5/4] w-full object-cover" />
                        </div>
                        <div className="absolute -bottom-6 left-4 hidden w-56 overflow-hidden rounded-[22px] border-4 border-[#F9F8F6] sm:block lg:-left-8">
                            <img src="/images/pil-.png" alt="" className="aspect-[4/3] w-full object-cover" />
                        </div>
                        <div className="absolute -top-4 right-4 rounded-2xl border border-[#E9E5DF] bg-white px-4 py-3 shadow-[0_18px_40px_-28px_rgba(26,24,20,0.5)]">
                            <p className="font-serif text-3xl leading-none text-[#1A1814]">{methods ? counts.all : "…"}</p>
                            <p className="mt-1 text-[11.5px] text-[#6B655D]">méthodes expliquées</p>
                        </div>
                    </motion.div>
                </section>

                {/* Filtres */}
                <section className="sticky top-20 z-20 border-y border-[#E9E5DF] bg-[#F9F8F6]/90 backdrop-blur-xl">
                    <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
                        <div className="flex gap-1.5 overflow-x-auto" role="tablist" aria-label="Familles de contraceptifs">
                            {FILTERS.map((f) => (
                                <button
                                    key={f.key}
                                    role="tab"
                                    aria-selected={filter === f.key}
                                    onClick={() => setFilter(f.key)}
                                    className={`relative shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${filter === f.key ? "text-white" : "text-[#57524B] hover:text-[#1A1814]"}`}
                                >
                                    {filter === f.key && <motion.span layoutId="contra-filter" transition={spring} className="absolute inset-0 rounded-full bg-[#1A1814]" />}
                                    <span className="relative">{f.label} <span className="opacity-60">{methods ? counts[f.key] : ""}</span></span>
                                </button>
                            ))}
                        </div>
                        <label className="relative sm:w-72">
                            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A837A]" />
                            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher une méthode…" className="w-full rounded-full border border-[#E9E5DF] bg-white py-2.5 pl-10 pr-4 text-sm text-[#1A1814] outline-none transition focus:border-[#1A1814]" />
                        </label>
                    </div>
                </section>

                {/* Méthodes */}
                <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                    {error ? (
                        <p className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">{error}</p>
                    ) : !methods ? (
                        <div className="grid h-72 place-items-center"><Loader2 className="h-7 w-7 animate-spin text-[#C2185B]" /></div>
                    ) : visible.length === 0 ? (
                        <p className="rounded-2xl border border-[#E9E5DF] bg-white p-10 text-center text-sm text-[#57524B]">Aucune méthode ne correspond à votre recherche.</p>
                    ) : (
                        groups.map((g) => {
                            const list = visible.filter((m) => (g === "doctor" ? m.requires_doctor : !m.requires_doctor));
                            if (!list.length) return null;
                            return (
                                <div key={g} className="mb-14 last:mb-0">
                                    <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                                        <div>
                                            <p className="text-[11px] uppercase tracking-[0.2em] text-[#C2185B]">{list.length} méthode{list.length > 1 ? "s" : ""}</p>
                                            <h2 className="mt-1 font-serif text-3xl text-[#1A1814]">{GROUPS[g].title}</h2>
                                        </div>
                                        <p className="max-w-xl text-sm leading-relaxed text-[#6B655D]">{GROUPS[g].text}</p>
                                    </div>
                                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                        {list.map((m, i) => <MethodCard key={m.id} m={m} index={i} />)}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </section>

                {/* Le parcours */}
                <section className="border-t border-[#E9E5DF] bg-white">
                    <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
                        <div>
                            <p className="text-[11px] uppercase tracking-[0.2em] text-[#C2185B]">Votre parcours</p>
                            <h2 className="mt-2 font-serif text-4xl leading-tight text-[#1A1814]">7 étapes, suivies dans votre dashboard.</h2>
                            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[#57524B]">
                                De votre demande au suivi, chaque étape est visible dans votre espace. Pour les méthodes sans médecin, la rencontre (étape 3) n’est pas nécessaire.
                            </p>
                            <p className="mt-6 text-xs leading-relaxed text-[#8A837A]">
                                Informations issues du manuel de planification familiale de l’Organisation mondiale de la santé. Elles ne remplacent pas l’avis d’un professionnel de santé.
                            </p>
                        </div>
                        <div className="rounded-[28px] border border-[#E9E5DF] bg-[#F9F8F6] p-6 sm:p-8">
                            <AdoptionSteps steps={STEP_TEXT.map((s, i) => ({ n: i + 1, label: s.title, state: "todo", date: null }))} />
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}
