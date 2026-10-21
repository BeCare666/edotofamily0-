import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Clock3, HeartHandshake, Loader2, LockKeyhole, MessageCircleHeart, Minus, ShieldCheck, Stethoscope, UserRound, X } from "lucide-react";
import { api, token } from "../../components/pickup-dashboard/api";
import { useAuthContext } from "../../context/AuthContext";
import { useChatAI } from "../../context/ChatAIContext";
import { rememberRedirect } from "../../lib/roleHome";
import { AdoptionSteps, DoctorBadge, MethodVisual, StiBadge } from "../../components/contraception/ContraShared";

// Fiche d'un contraceptif (21/10/2026) : comment ça marche, comment ça se fait, avantages, inconvénients,
// critères, puis la demande d'adoption (étape 1 du parcours en 7 étapes).
const spring = { type: "spring", stiffness: 240, damping: 30 };
const SECTIONS = [
    { id: "fonctionnement", label: "Comment ça marche" },
    { id: "deroulement", label: "Comment ça se fait" },
    { id: "avantages", label: "Avantages" },
    { id: "inconvenients", label: "Inconvénients" },
    { id: "criteres", label: "Critères" },
    { id: "parcours", label: "Les 7 étapes" },
];

function Section({ id, eyebrow, title, children }) {
    return (
        <motion.section id={id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={spring}
            className="scroll-mt-40 rounded-[28px] border border-[#E9E5DF] bg-white p-6 sm:p-8">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#C2185B]">{eyebrow}</p>
            <h2 className="mt-1 font-serif text-[28px] leading-tight text-[#1A1814]">{title}</h2>
            <div className="mt-5">{children}</div>
        </motion.section>
    );
}

function Bullets({ items, tone }) {
    const Icon = tone === "minus" ? Minus : tone === "dot" ? null : Check;
    return (
        <ul className="grid gap-3 sm:grid-cols-2">
            {items.map((x) => (
                <li key={x} className="flex gap-3 rounded-2xl bg-[#F9F8F6] p-4 text-[14.5px] leading-relaxed text-[#3D3934]">
                    <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full ${tone === "minus" ? "bg-[#F5E4E4] text-[#9B2C2C]" : tone === "dot" ? "bg-[#FBEEF3]" : "bg-[#E8EFE6] text-[#3F6B45]"}`}>
                        {Icon ? <Icon size={13} /> : <span className="h-1.5 w-1.5 rounded-full bg-[#C2185B]" />}
                    </span>
                    <span>{x}</span>
                </li>
            ))}
        </ul>
    );
}

export default function MethodPage() {
    const router = useRouter();
    const { slug } = router.query;
    const { user } = useAuthContext() || {};
    const { openChat } = useChatAI();
    const [m, setM] = useState(null);
    const [error, setError] = useState("");
    const [ask, setAsk] = useState(false);
    const [note, setNote] = useState("");
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(null);
    const [formError, setFormError] = useState("");

    useEffect(() => {
        if (!slug) return;
        setM(null); setError("");
        api(`contraception/methods/${encodeURIComponent(slug)}`).then(setM).catch((e) => setError(e.message || "Fiche indisponible."));
    }, [slug]);

    useEffect(() => {
        if (!ask) return;
        const onKey = (e) => e.key === "Escape" && !sending && setAsk(false);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [ask, sending]);

    const start = () => {
        if (!token() || !user) {
            rememberRedirect(router.asPath);
            router.push("/login");
            return;
        }
        setFormError(""); setSent(null); setAsk(true);
    };

    const submit = async () => {
        setSending(true); setFormError("");
        try {
            const res = await api("contraception/me/requests", { method: "POST", body: JSON.stringify({ method_id: m.id, note: note.trim() }) });
            setSent(res);
        } catch (e) {
            if (e.status === 401) { rememberRedirect(router.asPath); router.push("/login"); return; }
            setFormError(e.message);
        } finally {
            setSending(false);
        }
    };

    if (error) {
        return (
            <main className="grid min-h-[70vh] place-items-center bg-[#F9F8F6] px-4">
                <div className="text-center">
                    <p className="font-serif text-2xl text-[#1A1814]">{error}</p>
                    <Link href="/contraception" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#C2185B]"><ArrowLeft size={16} /> Tous les contraceptifs</Link>
                </div>
            </main>
        );
    }
    if (!m) return <main className="grid min-h-[70vh] place-items-center bg-[#F9F8F6]"><Loader2 className="h-7 w-7 animate-spin text-[#C2185B]" /></main>;

    const isYouth = !user || user.role === "customer";
    const facts = [
        { icon: ShieldCheck, k: "Efficacité", v: m.efficacy },
        { icon: Clock3, k: "Durée", v: m.duration },
        { icon: HeartHandshake, k: "Infections (IST, VIH)", v: m.protects_sti ? "Protège aussi des IST et du VIH" : "Ne protège pas des IST : associer le préservatif" },
        { icon: m.requires_doctor ? Stethoscope : UserRound, k: "Accompagnement", v: m.requires_doctor ? "Rencontre avec un médecin, en visio ou par téléphone" : "Sans médecin : orientation directe vers un centre" },
    ].filter((f) => f.v);

    return (
        <>
            <Head>
                <title>{m.name} · Contraception · E.doto family</title>
                <meta name="description" content={m.summary || m.name} />
            </Head>
            <main className="min-h-screen bg-[#F9F8F6] pb-28 lg:pb-16">
                {/* Ouverture */}
                <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
                    <Link href="/contraception" className="inline-flex items-center gap-2 rounded-full border border-[#E9E5DF] bg-white px-4 py-2 text-sm text-[#57524B] transition hover:border-[#1A1814] hover:text-[#1A1814]">
                        <ArrowLeft size={15} /> Tous les contraceptifs
                    </Link>
                    <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_1.05fr] lg:items-stretch lg:gap-12">
                        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={spring}>
                            <div className="relative">
                                <MethodVisual method={m} className="aspect-[4/3] lg:aspect-auto lg:h-full lg:min-h-[460px]" rounded="rounded-[32px]" />
                                <div className="absolute left-4 top-4 flex flex-wrap gap-1.5">
                                    <DoctorBadge requires={m.requires_doctor} light />
                                    {m.protects_sti && <StiBadge />}
                                </div>
                            </div>
                            {m.image_credit && <p className="mt-2 text-[11px] text-[#A8A29A]">{m.image_credit}</p>}
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.06 }} className="flex flex-col justify-center">
                            <p className="text-[11px] uppercase tracking-[0.2em] text-[#8A837A]">{m.family}</p>
                            <h1 className="mt-2 font-serif text-[38px] leading-[1.08] text-[#1A1814] sm:text-[50px]">{m.name}</h1>
                            {m.summary && <p className="mt-4 text-[16px] leading-relaxed text-[#57524B]">{m.summary}</p>}
                            <dl className="mt-7 grid gap-3 sm:grid-cols-2">
                                {facts.map(({ icon: Icon, k, v }) => (
                                    <div key={k} className="rounded-2xl border border-[#E9E5DF] bg-white p-4">
                                        <dt className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-[#8A837A]"><Icon size={14} className="text-[#C2185B]" /> {k}</dt>
                                        <dd className="mt-1.5 text-[14px] leading-snug text-[#1A1814]">{v}</dd>
                                    </div>
                                ))}
                            </dl>
                            <div className="mt-7 hidden flex-wrap gap-3 lg:flex">
                                {isYouth && (
                                    <button onClick={start} className="inline-flex items-center gap-2 rounded-2xl bg-[#1A1814] px-6 py-4 text-sm font-semibold text-white transition hover:bg-black">
                                        Commencer l’adoption <ArrowRight size={16} />
                                    </button>
                                )}
                                <button onClick={openChat} className="inline-flex items-center gap-2 rounded-2xl border border-[#E9E5DF] bg-white px-5 py-4 text-sm font-medium text-[#1A1814] transition hover:border-[#1A1814]">
                                    <MessageCircleHeart size={16} /> Une question ? Assistant SSR
                                </button>
                            </div>
                            <p className="mt-4 flex items-center gap-2 text-xs text-[#8A837A]"><LockKeyhole size={13} /> Votre demande reste confidentielle.</p>
                        </motion.div>
                    </div>
                </section>

                {/* Sommaire */}
                <nav className="sticky top-20 z-20 mt-10 border-y border-[#E9E5DF] bg-[#F9F8F6]/90 backdrop-blur-xl" aria-label="Sommaire de la fiche">
                    <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-2.5 sm:px-6 lg:px-8">
                        {SECTIONS.map((s) => (
                            <a key={s.id} href={`#${s.id}`} className="shrink-0 rounded-full px-4 py-2 text-sm text-[#57524B] transition hover:bg-white hover:text-[#1A1814]">{s.label}</a>
                        ))}
                    </div>
                </nav>

                <div className="mx-auto grid max-w-7xl gap-5 px-4 pt-8 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                        <Section id="fonctionnement" eyebrow="Comprendre" title="Comment ça marche">
                            <p className="whitespace-pre-line text-[15px] leading-relaxed text-[#3D3934]">{m.description || "Information à venir."}</p>
                        </Section>
                        <Section id="deroulement" eyebrow="En pratique" title="Comment ça se fait">
                            <p className="whitespace-pre-line text-[15px] leading-relaxed text-[#3D3934]">{m.how_to || "Information à venir."}</p>
                        </Section>
                    </div>
                    {m.advantages?.length > 0 && <Section id="avantages" eyebrow="Les points forts" title="Avantages"><Bullets items={m.advantages} /></Section>}
                    {m.drawbacks?.length > 0 && <Section id="inconvenients" eyebrow="À savoir" title="Inconvénients"><Bullets items={m.drawbacks} tone="minus" /></Section>}
                    {m.criteria?.length > 0 && <Section id="criteres" eyebrow="Pour qui" title="Critères"><Bullets items={m.criteria} tone="dot" /></Section>}
                    <Section id="parcours" eyebrow="Votre accompagnement" title="L’adoption en 7 étapes">
                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_0.8fr]">
                            <AdoptionSteps requiresDoctor={m.requires_doctor} />
                            <div className="self-start rounded-[24px] bg-[#F9F8F6] p-6">
                                <p className="font-serif text-xl text-[#1A1814]">Prêt(e) à commencer ?</p>
                                <p className="mt-2 text-sm leading-relaxed text-[#57524B]">
                                    {m.requires_doctor
                                        ? "Après l’acceptation de votre demande, vous choisissez l’heure de votre rencontre avec un médecin, en visio ou par téléphone."
                                        : "Après l’acceptation de votre demande, vous recevez un code QR pour le centre partenaire recommandé."}
                                </p>
                                {isYouth ? (
                                    <button onClick={start} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1A1814] px-6 py-4 text-sm font-semibold text-white transition hover:bg-black">
                                        Commencer l’adoption <ArrowRight size={16} />
                                    </button>
                                ) : (
                                    <p className="mt-4 text-sm text-[#8A837A]">Les demandes se font avec un compte jeune (client) E.doto family.</p>
                                )}
                            </div>
                        </div>
                    </Section>
                    <p className="px-1 text-xs leading-relaxed text-[#8A837A]">
                        Informations issues du manuel de planification familiale de l’Organisation mondiale de la santé. Elles ne remplacent pas l’avis d’un professionnel de santé.
                    </p>
                </div>

                {/* Mobile : action toujours visible */}
                {isYouth && (
                    <div className="fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-30 px-4 md:bottom-4 lg:hidden">
                        <button onClick={start} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1A1814] py-4 text-sm font-semibold text-white shadow-[0_18px_40px_-20px_rgba(26,24,20,0.7)]">
                            Commencer l’adoption <ArrowRight size={16} />
                        </button>
                    </div>
                )}
            </main>

            {/* Demande (étape 1) */}
            <AnimatePresence>
                {ask && (
                    <>
                        <motion.div className="fixed inset-0 z-[90] bg-[#1A1814]/35 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !sending && setAsk(false)} />
                        <div className="pointer-events-none fixed inset-0 z-[91] flex items-end justify-center sm:items-center sm:p-6">
                            <motion.div
                                role="dialog"
                                aria-modal="true"
                                aria-label="Demande d’adoption"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 30 }}
                                transition={spring}
                                className="pointer-events-auto max-h-[92vh] w-full overflow-y-auto rounded-t-[28px] bg-[#F9F8F6] p-6 sm:max-w-lg sm:rounded-[28px] sm:p-8"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-[11px] uppercase tracking-[0.2em] text-[#C2185B]">Étape 1 sur 7</p>
                                        <h2 className="mt-1 font-serif text-2xl text-[#1A1814]">{sent ? "Demande envoyée" : `Adopter : ${m.name}`}</h2>
                                    </div>
                                    <button onClick={() => !sending && setAsk(false)} aria-label="Fermer" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#E9E5DF] bg-white text-[#57524B] hover:border-[#1A1814]"><X size={18} /></button>
                                </div>
                                {sent ? (
                                    <div className="mt-5">
                                        <span className="grid h-14 w-14 place-items-center rounded-full bg-[#1A1814] text-white"><Check size={26} /></span>
                                        <p className="mt-4 text-[15px] leading-relaxed text-[#3D3934]">{sent.message}</p>
                                        <button onClick={() => router.push("/mon-espace#contraception")} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1A1814] py-4 text-sm font-semibold text-white">
                                            Suivre ma demande <ArrowRight size={16} />
                                        </button>
                                    </div>
                                ) : !isYouth ? (
                                    <p className="mt-5 text-sm text-[#57524B]">Les demandes se font avec un compte jeune (client) E.doto family.</p>
                                ) : (
                                    <div className="mt-5 space-y-4">
                                        <p className="text-sm leading-relaxed text-[#57524B]">
                                            {m.requires_doctor
                                                ? "L’équipe E.doto family étudie votre demande. Une fois acceptée, vous choisirez l’heure de votre rencontre avec un médecin."
                                                : "L’équipe E.doto family étudie votre demande. Une fois acceptée, vous recevrez un code QR pour le centre partenaire."}
                                        </p>
                                        <label className="block">
                                            <span className="text-sm font-medium text-[#1A1814]">Un message pour l’équipe (facultatif)</span>
                                            <textarea value={note} onChange={(e) => setNote(e.target.value.slice(0, 600))} rows={4} placeholder="Exemple : j’aimerais une méthode discrète, de longue durée."
                                                className="mt-1.5 w-full resize-none rounded-2xl border border-[#E9E5DF] bg-white px-4 py-3 text-sm text-[#1A1814] outline-none transition focus:border-[#1A1814]" />
                                            <span className="mt-1 flex justify-between text-xs text-[#8A837A]"><span>Lu uniquement par l’équipe médicale.</span><span>{note.length}/600</span></span>
                                        </label>
                                        {formError && <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{formError}</p>}
                                        <button onClick={submit} disabled={sending} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1A1814] py-4 text-sm font-semibold text-white transition hover:bg-black disabled:opacity-50">
                                            {sending && <Loader2 size={16} className="animate-spin" />} Envoyer ma demande
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
