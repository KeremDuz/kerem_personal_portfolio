"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import CyberGrid from "./CyberGrid";
import { ChevronDown } from "lucide-react";

const titles = [
    "Computer Engineering Student",
    "Cyber Security Enthusiast",
    "World Traveler",
    "Software Developer",
];

export default function Hero() {
    const [titleIndex, setTitleIndex] = useState(0);
    const [displayText, setDisplayText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [charIndex, setCharIndex] = useState(0);

    const currentTitle = titles[titleIndex];

    const typeEffect = useCallback(() => {
        if (!isDeleting) {
            // Typing
            if (charIndex < currentTitle.length) {
                setDisplayText(currentTitle.substring(0, charIndex + 1));
                setCharIndex((prev) => prev + 1);
            } else {
                // Pause at end
                setTimeout(() => setIsDeleting(true), 2000);
                return;
            }
        } else {
            // Deleting
            if (charIndex > 0) {
                setDisplayText(currentTitle.substring(0, charIndex - 1));
                setCharIndex((prev) => prev - 1);
            } else {
                setIsDeleting(false);
                setTitleIndex((prev) => (prev + 1) % titles.length);
                return;
            }
        }
    }, [charIndex, currentTitle, isDeleting]);

    useEffect(() => {
        const speed = isDeleting ? 40 : 80;
        const timer = setTimeout(typeEffect, speed);
        return () => clearTimeout(timer);
    }, [typeEffect, isDeleting]);

    return (
        <section
            id="hero"
            className="relative min-h-screen flex items-center justify-center overflow-hidden"
        >
            {/* Cyber Grid Background */}
            <CyberGrid />

            {/* Radial gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-dark-bg/50 to-dark-bg z-[1]" />

            {/* Content */}
            <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
                {/* Terminal prefix */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mb-6"
                >
                    <span className="font-mono text-sm text-cyber-green/60 tracking-widest uppercase">
                        {"// initializing portfolio..."}
                    </span>
                </motion.div>

                {/* Main Heading */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
                >
                    <span className="text-gray-100">Merhaba, Ben </span>
                    <span className="text-gradient-cyber">Kerem.</span>
                </motion.h1>

                {/* Typewriter Subtitle */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.7 }}
                    className="flex items-center justify-center gap-2 mb-10"
                >
                    <span className="text-cyber-green font-mono text-base md:text-lg">
                        {"$"}
                    </span>
                    <span className="font-mono text-lg md:text-xl text-gray-300 min-h-[1.5em]">
                        {displayText}
                        <span className="inline-block w-[3px] h-5 md:h-6 bg-cyber-green ml-0.5 animate-blink align-middle" />
                    </span>
                </motion.div>

                {/* Decorative Line */}
                <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 1.2, delay: 1 }}
                    className="w-32 h-px mx-auto bg-gradient-to-r from-transparent via-cyber-green/50 to-transparent mb-10"
                />

                {/* Tagline */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 1.2 }}
                    className="text-gray-400 font-sans text-base md:text-lg max-w-2xl mx-auto leading-relaxed"
                >
                    Kod satırları arasında güvenlik açıkları arıyor, dünya haritasında
                    yeni rotalar çiziyorum.
                </motion.p>
            </div>

            {/* Scroll indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2, duration: 1 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
            >
                <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="text-cyber-green/40"
                >
                    <ChevronDown size={28} />
                </motion.div>
            </motion.div>
        </section>
    );
}
