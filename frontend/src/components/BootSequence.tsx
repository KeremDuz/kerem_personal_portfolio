"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const bootLines = [
    { text: "> BIOS v4.2.0 — System Check...", delay: 0 },
    { text: "> CPU: Neural Engine x86_64 ✓", delay: 100 },
    { text: "> RAM: 32GB Quantum Memory ✓", delay: 200 },
    { text: "> GPU: RTX Holographic ✓", delay: 300 },
    { text: "> Firewall: Active ✓", delay: 400 },
    { text: "> VPN: Encrypted Tunnel ✓", delay: 500 },
    { text: "> Loading portfolio.exe...", delay: 650 },
    { text: "> Decrypting user data...", delay: 800 },
    { text: "> Establishing secure connection...", delay: 950 },
    { text: "> ACCESS GRANTED", delay: 1100, highlight: true },
    { text: "> Welcome, Kerem_Duz.", delay: 1300, highlight: true },
];

export default function BootSequence() {
    const [visibleLines, setVisibleLines] = useState<number[]>([]);
    const [booted, setBooted] = useState(false);
    const [exiting, setExiting] = useState(false);

    // Check if already booted this session
    useEffect(() => {
        if (typeof window !== "undefined") {
            const shouldSkipForPerformance =
                window.matchMedia("(pointer: coarse)").matches ||
                window.matchMedia("(prefers-reduced-motion: reduce)").matches;

            if (shouldSkipForPerformance) {
                setBooted(true);
                sessionStorage.setItem("portfolio-booted", "true");
                return;
            }

            const alreadyBooted = sessionStorage.getItem("portfolio-booted");
            if (alreadyBooted) {
                setBooted(true);
                return;
            }
        }

        const timeouts: NodeJS.Timeout[] = [];

        bootLines.forEach((line, index) => {
            const t = setTimeout(() => {
                setVisibleLines((prev) => [...prev, index]);
            }, line.delay);
            timeouts.push(t);
        });

        // Start exit after last line
        const exitTimer = setTimeout(() => {
            setExiting(true);
            sessionStorage.setItem("portfolio-booted", "true");
        }, 1800);
        timeouts.push(exitTimer);

        // Complete boot
        const bootTimer = setTimeout(() => {
            setBooted(true);
        }, 2400); // Allow exit animation to play
        timeouts.push(bootTimer);

        return () => timeouts.forEach((t) => clearTimeout(t));
    }, []);

    const skipBoot = () => {
        setExiting(true);
        sessionStorage.setItem("portfolio-booted", "true");
        setTimeout(() => setBooted(true), 500);
    };

    if (booted) return null;

    return (
        <AnimatePresence>
            {!booted && (
                <motion.div
                    initial={{ opacity: 1 }}
                    animate={{ opacity: exiting ? 0 : 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="fixed inset-0 z-[200] bg-[#0a0a0a] flex items-center justify-center cursor-pointer"
                    onClick={skipBoot}
                >
                    {/* Scanline effect */}
                    <div
                        className="absolute inset-0 pointer-events-none opacity-[0.03]"
                        style={{
                            backgroundImage:
                                "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,65,0.03) 2px, rgba(0,255,65,0.03) 4px)",
                        }}
                    />

                    {/* Flicker overlay */}
                    <motion.div
                        className="absolute inset-0 bg-cyber-green/[0.01] pointer-events-none"
                        animate={{ opacity: [0, 0.02, 0, 0.01, 0] }}
                        transition={{ duration: 0.15, repeat: Infinity }}
                    />

                    <div className="w-full max-w-xl px-8">
                        {/* Terminal header */}
                        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-800">
                            <div className="w-3 h-3 rounded-full bg-red-500/70" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                            <div className="w-3 h-3 rounded-full bg-green-500/70" />
                            <span className="ml-3 font-mono text-xs text-gray-600">
                                kerem@portfolio:~$
                            </span>
                        </div>

                        {/* Boot lines */}
                        <div className="space-y-1.5">
                            {bootLines.map((line, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={
                                        visibleLines.includes(index)
                                            ? { opacity: 1, x: 0 }
                                            : { opacity: 0, x: -10 }
                                    }
                                    transition={{ duration: 0.2, ease: "easeOut" }}
                                    className={`font-mono text-sm ${line.highlight
                                        ? "text-cyber-green font-semibold neon-text"
                                        : "text-gray-500"
                                        }`}
                                >
                                    {line.text}
                                    {index === visibleLines[visibleLines.length - 1] && (
                                        <span className="inline-block w-2 h-4 bg-cyber-green ml-1 animate-blink align-middle" />
                                    )}
                                </motion.div>
                            ))}
                        </div>

                        {/* Loading bar */}
                        <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: exiting ? 1 : visibleLines.length / bootLines.length }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="mt-6 h-[2px] bg-gradient-to-r from-cyber-green via-cyber-blue to-cyber-green origin-left rounded-full"
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
