"use client";

import { motion } from "framer-motion";
import { Github, Linkedin, Instagram, Mail, Heart, Terminal } from "lucide-react";

const socialLinks = [
    { icon: Github, href: "https://github.com/KeremDuz", label: "GitHub" },
    { icon: Linkedin, href: "https://www.linkedin.com/in/kerem-d%C3%BCz-687741236/", label: "LinkedIn" },
    { icon: Instagram, href: "https://www.instagram.com/kerem_plain?igsh=MWs4bzJwYXJoYWc3eg==", label: "Instagram" },
    { icon: Mail, href: "mailto:keremduz0304@gmail.com", label: "Email" },
];

export default function Footer() {
    return (
        <footer className="relative py-16 md:py-20">
            {/* Top divider */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyber-green/15 to-transparent" />

            <div className="max-w-4xl mx-auto px-6 text-center">
                {/* Heading */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <span className="font-mono text-sm text-cyber-green/40 block mb-4">
                        {"// connect.init()"}
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-100 mb-3">
                        Let&apos;s{" "}
                        <span className="text-gradient-cyber">Connect</span>
                    </h2>
                    <p className="text-gray-400 max-w-md mx-auto mb-8">
                        Yeni projeler, iş birlikleri veya sadece bir merhaba için bana
                        ulaşabilirsiniz.
                    </p>
                </motion.div>

                {/* Social Links */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="flex justify-center gap-4 mb-12"
                >
                    {socialLinks.map((link) => (
                        <motion.a
                            key={link.label}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={link.label}
                            className="w-12 h-12 rounded-xl bg-dark-surface/80 border border-gray-800 flex items-center justify-center text-gray-400 hover:text-cyber-green hover:border-cyber-green/30 hover:bg-cyber-green/5 transition-all duration-300"
                            whileHover={{ scale: 1.1, y: -3 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <link.icon size={20} strokeWidth={1.5} />
                        </motion.a>
                    ))}
                </motion.div>

                {/* Terminal-style divider */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="h-px w-20 bg-gradient-to-r from-transparent to-gray-700" />
                    <Terminal size={14} className="text-gray-600" />
                    <div className="h-px w-20 bg-gradient-to-l from-transparent to-gray-700" />
                </div>

                {/* Copyright */}
                <div className="font-mono text-xs text-gray-600">
                    <p className="flex items-center justify-center gap-1.5">
                        <span>{">"}</span>
                        <span>Built with</span>
                        <Heart size={12} className="text-cyber-green/50" fill="currentColor" />
                        <span>by Kerem Düz</span>
                    </p>
                    <p className="mt-2 text-gray-700">
                        &copy; {new Date().getFullYear()} &mdash; All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
