"use client";

import React from "react";
import { motion, MotionProps } from "framer-motion";

// Apparition douce au défilement, commune à la page vitrine.
// (Transtypage : types de React 19 et framer-motion 10 incompatibles sans lui, comme dans l'ancien code.)
const MotionDiv = motion.div as unknown as React.FC<React.HTMLAttributes<HTMLDivElement> & MotionProps>;

export default function Reveal({ children, delay = 0, y = 24, className = "" }: { children: React.ReactNode; delay?: number; y?: number; className?: string }) {
    return (
        <MotionDiv
            initial={{ opacity: 0, y }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
            className={className}
        >
            {children}
        </MotionDiv>
    );
}

// Cadre photo : coins doux, zoom lent au survol
export function PhotoFrame({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return <div className={`group/photo relative overflow-hidden rounded-[28px] bg-[#F1ECE6] ${className}`}>{children}</div>;
}

export const photoClass = "object-cover transition-transform duration-[1600ms] ease-out group-hover/photo:scale-[1.04]";
