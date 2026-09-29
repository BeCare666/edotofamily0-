"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export const MAX_QUESTION_CHARS = 300;
const STORAGE_KEY = "edoto-ai-chat";
const LANG_KEY = "edoto-ai-chat-lang";
const API_URL = process.env.NEXT_PUBLIC_REST_API_ENDPOINT;

const uid = () =>
    typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

// Stockage navigateur : simple confort, jamais indispensable (navigation privée, stockage bloqué…).
function readStorage(storage, key) {
    try {
        return JSON.parse(storage.getItem(key));
    } catch {
        return null;
    }
}
function writeStorage(storage, key, value) {
    try {
        storage.setItem(key, JSON.stringify(value));
    } catch {
        /* stockage indisponible */
    }
}

// Découpe un flux SSE (« event: x\ndata: {...}\n\n ») en événements.
function parseSSE(chunk) {
    let event = "message";
    let data = "";
    for (const line of chunk.split("\n")) {
        if (line.startsWith("event:")) event = line.slice(6).trim();
        else if (line.startsWith("data:")) data += line.slice(5).trim();
    }
    try {
        return { event, data: data ? JSON.parse(data) : {} };
    } catch {
        return null;
    }
}

export default function useChatStream() {
    const [messages, setMessages] = useState([]);
    const [lang, setLangState] = useState("fr");
    const [isStreaming, setIsStreaming] = useState(false);
    const sessionIdRef = useRef(null);
    const abortRef = useRef(null);
    const hydratedRef = useRef(false);

    // Historique conservé le temps de l'onglet (confidentialité : effacé à sa fermeture).
    useEffect(() => {
        const saved = typeof window !== "undefined" ? readStorage(sessionStorage, STORAGE_KEY) : null;
        if (saved?.sessionId) sessionIdRef.current = saved.sessionId;
        if (Array.isArray(saved?.messages)) {
            setMessages(saved.messages.map((m) => (m.status === "streaming" ? { ...m, status: "done" } : m)));
        }
        const savedLang = typeof window !== "undefined" ? readStorage(localStorage, LANG_KEY) : null;
        if (["fr", "en", "fon"].includes(savedLang)) setLangState(savedLang);
        if (!sessionIdRef.current) sessionIdRef.current = uid();
        hydratedRef.current = true;
    }, []);

    useEffect(() => {
        if (!hydratedRef.current || isStreaming) return;
        writeStorage(sessionStorage, STORAGE_KEY, { sessionId: sessionIdRef.current, messages });
    }, [messages, isStreaming]);

    const setLang = useCallback((l) => {
        setLangState(l);
        writeStorage(localStorage, LANG_KEY, l);
    }, []);

    const patch = useCallback((id, fn) => {
        setMessages((prev) => prev.map((m) => (m.id === id ? fn(m) : m)));
    }, []);

    const stop = useCallback(() => abortRef.current?.abort(), []);

    const reset = useCallback(() => {
        abortRef.current?.abort();
        sessionIdRef.current = uid();
        setMessages([]);
    }, []);

    const send = useCallback(
        async (text) => {
            const question = text.trim().slice(0, MAX_QUESTION_CHARS);
            if (!question || isStreaming) return;

            const userMsg = { id: uid(), role: "user", content: question, status: "done" };
            const botId = uid();
            const botMsg = { id: botId, role: "assistant", content: "", actions: [], sources: [], status: "streaming" };

            // Historique envoyé à l'API : uniquement le texte des échanges réussis.
            const history = [...messages, userMsg]
                .filter((m) => m.status === "done" && m.content)
                .map((m) => ({ role: m.role, content: m.content }))
                .slice(-10);

            setMessages((prev) => [...prev, userMsg, botMsg]);
            setIsStreaming(true);
            const controller = new AbortController();
            abortRef.current = controller;

            try {
                const res = await fetch(`${API_URL}/ai/chat`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ sessionId: sessionIdRef.current, lang, messages: history }),
                    signal: controller.signal,
                });

                if (!res.ok || !res.body) {
                    const body = await res.json().catch(() => ({}));
                    const msg = Array.isArray(body?.message) ? body.message[0] : body?.message;
                    throw new Error(msg || "Le service est momentanément indisponible. Réessaie dans un instant.");
                }

                const reader = res.body.getReader();
                const decoder = new TextDecoder();
                let buffer = "";
                let failed = null;

                for (;;) {
                    const { value, done } = await reader.read();
                    if (done) break;
                    buffer += decoder.decode(value, { stream: true });
                    const parts = buffer.split("\n\n");
                    buffer = parts.pop();
                    for (const part of parts) {
                        const evt = parseSSE(part);
                        if (!evt) continue;
                        const { event, data } = evt;
                        if (event === "text") patch(botId, (m) => ({ ...m, content: m.content + (data.delta || "") }));
                        else if (event === "reset") patch(botId, (m) => ({ ...m, content: "" }));
                        else if (event === "meta") patch(botId, (m) => ({ ...m, notice: data.notice }));
                        else if (event === "action") patch(botId, (m) => ({ ...m, actions: [...m.actions, data] }));
                        else if (event === "sources") patch(botId, (m) => ({ ...m, sources: data.items || [] }));
                        else if (event === "error") failed = data.message;
                    }
                }
                if (failed) throw new Error(failed);
                patch(botId, (m) => ({ ...m, status: "done" }));
            } catch (err) {
                if (controller.signal.aborted) {
                    patch(botId, (m) => ({ ...m, status: m.content || m.actions.length ? "done" : "stopped" }));
                } else {
                    patch(botId, (m) => ({
                        ...m,
                        status: "error",
                        error: err?.message || "Le service est momentanément indisponible. Réessaie dans un instant.",
                    }));
                }
            } finally {
                abortRef.current = null;
                setIsStreaming(false);
            }
        },
        [isStreaming, lang, messages, patch],
    );

    return { messages, lang, setLang, isStreaming, send, stop, reset };
}
