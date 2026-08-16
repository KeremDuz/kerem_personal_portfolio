"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { accent } from "@/lib/theme";

export default function ScrollProgress() {
    const [enabled, setEnabled] = useState(false);

    useEffect(() => {
        const disableForMobile = window.matchMedia("(pointer: coarse)").matches;
        const disableForReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        setEnabled(!(disableForMobile || disableForReducedMotion));
    }, []);

    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001,
    });

    if (!enabled) return null;

    return (
        <motion.div
            className="fixed top-0 left-0 right-0 h-[2px] z-[60] origin-left"
            style={{
                scaleX,
                background: `linear-gradient(90deg, ${accent.green} 0%, ${accent.blue} 50%, ${accent.amber} 100%)`,
                boxShadow: `0 0 12px ${accent.green}66`,
            }}
        />
    );
}
