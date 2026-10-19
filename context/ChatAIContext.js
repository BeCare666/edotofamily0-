"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

// Ouverture du chat « Assistant SSR » depuis n'importe quel déclencheur
// (bouton flottant, option « Parler à un conseiller SSR » du drawer d'accueil).
// 19/10/2026 : le bouton flottant ouvre d'abord un choix « Assistant virtuel » ou « Prendre rendez-vous »
// (téléconsultation en visio ou par appel).
const ChatAIContext = createContext({
    isOpen: false,
    openChat: () => {},
    closeChat: () => {},
    choiceOpen: false,
    openChoice: () => {},
    closeChoice: () => {},
    bookingOpen: false,
    openBooking: () => {},
    closeBooking: () => {},
});

export function ChatAIProvider({ children }) {
    const [isOpen, setIsOpen] = useState(false);
    const [choiceOpen, setChoiceOpen] = useState(false);
    const [bookingOpen, setBookingOpen] = useState(false);
    const openChat = useCallback(() => { setChoiceOpen(false); setIsOpen(true); }, []);
    const closeChat = useCallback(() => setIsOpen(false), []);
    const openChoice = useCallback(() => setChoiceOpen(true), []);
    const closeChoice = useCallback(() => setChoiceOpen(false), []);
    const openBooking = useCallback(() => { setChoiceOpen(false); setIsOpen(false); setBookingOpen(true); }, []);
    const closeBooking = useCallback(() => setBookingOpen(false), []);
    const value = useMemo(
        () => ({ isOpen, openChat, closeChat, choiceOpen, openChoice, closeChoice, bookingOpen, openBooking, closeBooking }),
        [isOpen, openChat, closeChat, choiceOpen, openChoice, closeChoice, bookingOpen, openBooking, closeBooking],
    );
    return <ChatAIContext.Provider value={value}>{children}</ChatAIContext.Provider>;
}

export const useChatAI = () => useContext(ChatAIContext);
