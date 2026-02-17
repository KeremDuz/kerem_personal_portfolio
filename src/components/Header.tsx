"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Github, Linkedin, Instagram, Menu, X } from "lucide-react";

const socialLinks = [
    { icon: Github, href: "https://github.com/KeremDuz", label: "GitHub" },
    { icon: Linkedin, href: "https://www.linkedin.com/in/kerem-d%C3%BCz-687741236/", label: "LinkedIn" },
];

export default function Header() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
                ? "bg-dark-bg/80 backdrop-blur-xl border-b border-cyber-green/10 shadow-lg shadow-cyber-green/5"
                : "bg-transparent"
                }`}
        >
            <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                {/* Logo */}
                <motion.a
                    href="#"
                    className="flex items-center gap-1 group"
                    whileHover={{ scale: 1.02 }}
                >
                    <span className="text-cyber-green font-mono text-lg font-semibold">
                        {">"}{" "}
                    </span>
                    <span className="font-mono text-lg font-semibold text-gray-100 group-hover:text-cyber-green transition-colors duration-300">
                        Kerem_Duz
                    </span>
                    <span className="w-2.5 h-5 bg-cyber-green ml-1 animate-blink" />
                </motion.a>

                {/* Desktop Social Icons */}
                <div className="hidden md:flex items-center gap-4">
                    {socialLinks.map((link) => (
                        <motion.a
                            key={link.label}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={link.label}
                            className="text-gray-400 hover:text-cyber-green transition-colors duration-300 p-2 rounded-lg hover:bg-cyber-green/5"
                            whileHover={{ scale: 1.15, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <link.icon size={20} strokeWidth={1.5} />
                        </motion.a>
                    ))}
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden text-gray-400 hover:text-cyber-green transition-colors"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Toggle menu"
                >
                    {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </nav>

            {/* Mobile Menu */}
            {mobileOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="md:hidden bg-dark-bg/95 backdrop-blur-xl border-b border-cyber-green/10 px-6 py-4"
                >
                    <div className="flex justify-center gap-6">
                        {socialLinks.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={link.label}
                                className="text-gray-400 hover:text-cyber-green transition-colors duration-300 p-3"
                            >
                                <link.icon size={22} strokeWidth={1.5} />
                            </a>
                        ))}
                    </div>
                </motion.div>
            )}
        </motion.header>
    );
}
