"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useDragControls } from "framer-motion";
import { ArrowUp, Square, X, SquarePen, Globe2, AlertCircle, RotateCcw } from "lucide-react";
import { useChatAI } from "../../context/ChatAIContext";
import useChatStream, { MAX_QUESTION_CHARS } from "./useChatStream";
import { chatStrings } from "./chatStrings";
import RichText from "./RichText";
import ActionCards from "./ActionCards";
import AIOrb from "./AIOrb";

const LANGS = [
    { code: "fr", label: "FR" },
    { code: "en", label: "EN" },
    { code: "fon", label: "FON" },
];

const spring = { type: "spring", stiffness: 260, damping: 32, mass: 0.9 };

function useIsDesktop() {
    const [desktop, setDesktop] = useState(false);
    useEffect(() => {
        const mq = window.matchMedia("(min-width: 768px)");
        const update = () => setDesktop(mq.matches);
        update();
        mq.addEventListener("change", update);
        return () => mq.removeEventListener("change", update);
    }, []);
    return desktop;
}

function LangSwitch({ lang, setLang, t }) {
    return (
        <div className="relative flex items-center rounded-full bg-slate-100/80 p-0.5 ring-1 ring-slate-200/70">
            <Globe2 size={13} className="ml-2 mr-1 text-slate-400" />
            {LANGS.map((l) => (
                <button key={l.code} onClick={() => setLang(l.code)}
                    className={`relative rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide transition-colors ${lang === l.code ? "text-slate-900" : "text-slate-400 hover:text-slate-600"}`}
                    aria-pressed={lang === l.code}
                    title={l.code === "fon" ? t.langBeta : undefined}>
                    {lang === l.code && (
                        <motion.span layoutId="ai-lang-pill" transition={spring}
                            className="absolute inset-0 rounded-full bg-white shadow-sm ring-1 ring-slate-200" />
                    )}
                    <span className="relative">
                        {l.label}
                        {l.code === "fon" && <sup className="ml-0.5 text-[8px] text-pink-500">β</sup>}
                    </span>
                </button>
            ))}
        </div>
    );
}

function TypingDots({ t }) {
    return (
        <div className="flex items-center gap-2 py-2" aria-label={t.thinking}>
            <span className="text-sm text-slate-400">{t.thinking}</span>
            <span className="flex gap-1">
                {[0, 1, 2].map((i) => (
                    <motion.span key={i} className="h-1.5 w-1.5 rounded-full bg-gradient-to-br from-[#FF6EA9] to-[#4AB3F4]"
                        animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }} />
                ))}
            </span>
        </div>
    );
}

function Welcome({ t, onPick }) {
    return (
        <motion.div initial="hidden" animate="show"
            variants={{ show: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } } }}
            className="flex min-h-full flex-col items-center justify-center px-2 py-10 text-center">
            <motion.div variants={{ hidden: { opacity: 0, scale: 0.8 }, show: { opacity: 1, scale: 1 } }} transition={spring}
                className="relative">
                <div className="absolute inset-0 -z-10 scale-150 rounded-full bg-gradient-to-br from-pink-200/60 to-sky-200/60 blur-2xl" />
                <AIOrb size={64} />
            </motion.div>
            <motion.h3 variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
                className="mt-6 text-xl font-semibold tracking-tight text-slate-900">{t.hello}</motion.h3>
            <motion.p variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
                className="mt-2 max-w-xs text-sm leading-6 text-slate-500">{t.intro}</motion.p>
            <div className="mt-8 grid w-full max-w-sm gap-2.5">
                {t.suggestions.map((s) => (
                    <motion.button key={s} onClick={() => onPick(s)}
                        variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                        whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}
                        className="rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 text-left text-sm text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)] backdrop-blur transition-colors hover:border-pink-200 hover:bg-white hover:text-slate-900">
                        {s}
                    </motion.button>
                ))}
            </div>
        </motion.div>
    );
}

function Message({ m, t, isLast, onRetry }) {
    if (m.role === "user") {
        return (
            <motion.div initial={{ opacity: 0, y: 12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={spring}
                className="flex justify-end">
                <div className="max-w-[85%] whitespace-pre-wrap break-words rounded-3xl rounded-br-lg bg-gradient-to-br from-[#FF6EA9] to-[#ec4899] px-4 py-2.5 text-[15px] leading-6 text-white shadow-[0_8px_24px_-12px_rgba(236,72,153,0.8)]">
                    {m.content}
                </div>
            </motion.div>
        );
    }
    const streaming = m.status === "streaming";
    const empty = !m.content && !m.actions?.length;
    return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="flex gap-3">
            <div className="pt-0.5"><AIOrb size={28} active={streaming} /></div>
            <div className="min-w-0 flex-1">
                {m.notice === "fon_unavailable" && (
                    <p className="mb-2 inline-block rounded-lg bg-amber-50 px-2.5 py-1 text-xs text-amber-700 ring-1 ring-amber-100">{t.fonNotice}</p>
                )}
                {streaming && empty && <TypingDots t={t} />}
                {m.content && (
                    <div className="relative">
                        <RichText text={m.content} />
                        {streaming && (
                            <motion.span className="ml-0.5 inline-block h-4 w-[3px] translate-y-0.5 rounded-full bg-pink-400"
                                animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 0.9, repeat: Infinity }} />
                        )}
                    </div>
                )}
                <ActionCards actions={m.actions} t={t} />
                {m.sources?.length > 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{t.sources}</span>
                        {m.sources.map((s) => {
                            let host = s.url;
                            try { host = new URL(s.url).hostname.replace(/^www\./, ""); } catch { /* url brute */ }
                            return (
                                <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" title={s.title}
                                    className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600 transition hover:bg-pink-50 hover:text-pink-600">
                                    {host}
                                </a>
                            );
                        })}
                    </motion.div>
                )}
                {m.status === "stopped" && <p className="text-sm italic text-slate-400">{t.stopped}</p>}
                {m.status === "error" && (
                    <div className="mt-1 flex flex-wrap items-center gap-2 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-100">
                        <AlertCircle size={16} className="shrink-0" />
                        <span className="flex-1">{m.error}</span>
                        {isLast && (
                            <button onClick={onRetry} className="inline-flex items-center gap-1 font-semibold hover:text-rose-800">
                                <RotateCcw size={14} /> {t.retry}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
}

function Composer({ t, onSend, onStop, isStreaming, autoFocus }) {
    const [value, setValue] = useState("");
    const ref = useRef(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = `${Math.min(el.scrollHeight, 132)}px`;
    }, [value]);

    useEffect(() => {
        if (autoFocus) ref.current?.focus({ preventScroll: true });
    }, [autoFocus]);

    const submit = () => {
        if (!value.trim() || isStreaming) return;
        onSend(value);
        setValue("");
    };
    const left = MAX_QUESTION_CHARS - value.length;

    return (
        <div className="relative rounded-[26px] border border-slate-200/80 bg-white p-1.5 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.18)] transition focus-within:border-pink-200 focus-within:shadow-[0_8px_30px_-10px_rgba(255,110,169,0.35)]">
            <div className="flex items-end gap-2">
                <textarea
                    ref={ref}
                    rows={1}
                    value={value}
                    maxLength={MAX_QUESTION_CHARS}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                            e.preventDefault();
                            submit();
                        }
                    }}
                    placeholder={t.placeholder}
                    aria-label={t.placeholder}
                    className="max-h-[132px] flex-1 resize-none bg-transparent px-3 py-2.5 text-[16px] leading-6 text-slate-800 placeholder:text-slate-400 focus:outline-none md:text-[15px]"
                />
                <AnimatePresence mode="popLayout" initial={false}>
                    {isStreaming ? (
                        <motion.button key="stop" onClick={onStop} aria-label={t.stop}
                            initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }}
                            className="mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white transition hover:bg-slate-700">
                            <Square size={14} fill="currentColor" />
                        </motion.button>
                    ) : (
                        <motion.button key="send" onClick={submit} aria-label={t.send} disabled={!value.trim()}
                            initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }}
                            whileTap={{ scale: 0.9 }}
                            className="mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FF6EA9] to-[#ec4899] text-white shadow-[0_6px_16px_-6px_rgba(236,72,153,0.9)] transition disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 disabled:shadow-none">
                            <ArrowUp size={18} strokeWidth={2.4} />
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>
            {value.length > MAX_QUESTION_CHARS * 0.7 && (
                <span className={`absolute -top-6 right-3 text-[11px] font-medium ${left < 20 ? "text-rose-500" : "text-slate-400"}`}>
                    {value.length}/{MAX_QUESTION_CHARS}
                </span>
            )}
        </div>
    );
}

export default function ChatAIDrawer() {
    const { isOpen, closeChat } = useChatAI();
    const { messages, lang, setLang, isStreaming, send, stop, reset } = useChatStream();
    const t = chatStrings(lang);
    const desktop = useIsDesktop();
    const dragControls = useDragControls();
    const scrollRef = useRef(null);
    const stickRef = useRef(true);

    // Échap pour fermer ; défilement de la page bloqué sous le chat.
    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e) => e.key === "Escape" && closeChat();
        window.addEventListener("keydown", onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = prev;
        };
    }, [isOpen, closeChat]);

    // Suit le bas de la conversation, sauf si l'utilisateur remonte lire.
    useEffect(() => {
        const el = scrollRef.current;
        if (el && stickRef.current) el.scrollTo({ top: el.scrollHeight, behavior: isStreaming ? "auto" : "smooth" });
    }, [messages, isStreaming]);

    const onScroll = () => {
        const el = scrollRef.current;
        if (el) stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    };

    const handleSend = (text) => {
        stickRef.current = true;
        send(text);
    };

    const retryLast = () => {
        const lastUser = [...messages].reverse().find((m) => m.role === "user");
        if (lastUser) handleSend(lastUser.content);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div key="ai-backdrop"
                        className="fixed inset-0 z-[60] bg-slate-900/25 backdrop-blur-[3px]"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={closeChat} />

                    <motion.aside key="ai-panel"
                        role="dialog" aria-modal="true" aria-label={t.title}
                        className="fixed inset-y-0 right-0 z-[61] flex w-full flex-col overflow-hidden bg-white md:w-[460px] md:rounded-l-[28px] md:shadow-[-24px_0_60px_-20px_rgba(15,23,42,0.35)]"
                        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                        transition={spring}
                        drag={desktop ? false : "x"} dragControls={dragControls} dragListener={false}
                        dragConstraints={{ left: 0, right: 0 }} dragElastic={{ left: 0, right: 0.6 }}
                        onDragEnd={(_, info) => { if (info.offset.x > 110 || info.velocity.x > 600) closeChat(); }}>

                        {/* Fond : halos très doux aux couleurs de la marque */}
                        <div className="pointer-events-none absolute inset-0 -z-0 overflow-hidden">
                            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-pink-200/35 blur-3xl" />
                            <div className="absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-sky-200/30 blur-3xl" />
                        </div>

                        {/* En-tête (zone de glissement vers la droite pour fermer sur mobile) */}
                        <header onPointerDown={(e) => !desktop && dragControls.start(e)}
                            className="relative z-10 flex items-center gap-3 border-b border-slate-100/80 bg-white/70 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-xl touch-pan-y">
                            <AIOrb size={40} active={isStreaming} />
                            <div className="min-w-0 flex-1">
                                <h2 className="bg-gradient-to-r from-slate-900 via-slate-800 to-pink-600 bg-clip-text text-[17px] font-semibold tracking-tight text-transparent">
                                    {t.title}
                                </h2>
                                <p className="flex items-center gap-1.5 truncate text-[11px] text-slate-400">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_0_3px_rgba(52,211,153,0.2)]" />
                                    {t.subtitle}
                                </p>
                            </div>
                            {messages.length > 0 && (
                                <motion.button onClick={reset} aria-label={t.newChat} title={t.newChat}
                                    whileTap={{ scale: 0.9 }} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                                    className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-800">
                                    <SquarePen size={18} />
                                </motion.button>
                            )}
                            <motion.button onClick={closeChat} aria-label={t.close} whileTap={{ scale: 0.9 }} whileHover={{ rotate: 90 }}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900">
                                <X size={18} />
                            </motion.button>
                        </header>

                        <div className="relative z-10 flex justify-center border-b border-slate-100/60 bg-white/50 py-2 backdrop-blur">
                            <LangSwitch lang={lang} setLang={setLang} t={t} />
                        </div>

                        {/* Conversation */}
                        <div ref={scrollRef} onScroll={onScroll}
                            className="relative z-10 flex-1 overflow-y-auto overscroll-contain px-4 py-5 [scrollbar-width:thin]">
                            {messages.length === 0 ? (
                                <Welcome t={t} onPick={handleSend} />
                            ) : (
                                <div className="mx-auto max-w-2xl space-y-6">
                                    {messages.map((m, i) => (
                                        <Message key={m.id} m={m} t={t} isLast={i === messages.length - 1} onRetry={retryLast} />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Saisie */}
                        <div className="relative z-10 bg-gradient-to-t from-white via-white to-white/0 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
                            <Composer t={t} onSend={handleSend} onStop={stop} isStreaming={isStreaming} autoFocus={desktop} />
                            <p className="mt-2 text-center text-[11px] text-slate-400">{t.disclaimer}</p>
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}
