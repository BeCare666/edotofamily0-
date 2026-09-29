"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

// Ouverture du chat « IA Edotofamily » depuis n'importe quel déclencheur
// (bouton flottant, option « Parler à un conseiller SSR » du drawer d'accueil).
const ChatAIContext = createContext({ isOpen: false, openChat: () => {}, closeChat: () => {} });

export function ChatAIProvider({ children }) {
    const [isOpen, setIsOpen] = useState(false);
    const openChat = useCallback(() => setIsOpen(true), []);
    const closeChat = useCallback(() => setIsOpen(false), []);
    const value = useMemo(() => ({ isOpen, openChat, closeChat }), [isOpen, openChat, closeChat]);
    return <ChatAIContext.Provider value={value}>{children}</ChatAIContext.Provider>;
}

export const useChatAI = () => useContext(ChatAIContext);
