"use client";

import { useState, useEffect, useRef } from "react";
import { Github, Linkedin, Instagram, Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "./LanguageSwitcher";

const socialLinks = [
    { icon: Github, href: "https://github.com/KeremDuz", label: "GitHub" },
    { icon: Linkedin, href: "https://www.linkedin.com/in/kerem-d%C3%BCz-687741236/", label: "LinkedIn" },
    { icon: Instagram, href: "https://www.instagram.com/kerem_plain?igsh=MWs4bzJwYXJoYWc3eg==", label: "Instagram" },
];

// Section ids in document order, paired with their Navigation message key.
const navLinks = [
    { id: "about", key: "about" },
    { id: "timeline", key: "experience" },
    { id: "projects", key: "projects" },
    { id: "travel", key: "travel" },
    { id: "blog", key: "blog" },
] as const;

export default function Header() {
    const t = useTranslations("Navigation");
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [activeId, setActiveId] = useState<string>("");
    const activeRef = useRef("");

    useEffect(() => {
        let ticking = false;

        const update = () => {
            ticking = false;

            const nextScrolled = window.scrollY > 40;
            setScrolled((prev) => (prev === nextScrolled ? prev : nextScrolled));

            // Scroll spy: the active section is the last one whose top has
            // passed the header. Cheaper and steadier than IntersectionObserver
            // here, because the deferred sections mount at different times.
            const line = window.innerHeight * 0.35;
            let current = "";
            for (const link of navLinks) {
                const el = document.getElementById(link.id);
                if (el && el.getBoundingClientRect().top <= line) current = link.id;
            }
            if (current !== activeRef.current) {
                activeRef.current = current;
                setActiveId(current);
            }
        };

        const onScroll = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(update);
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        update();

        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Lock body scroll while the mobile sheet is open.
    useEffect(() => {
        if (!mobileOpen) return;
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = previous;
        };
    }, [mobileOpen]);

    return (
        <header
            className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${scrolled
                ? "border-b border-white/5 bg-dark-bg/75 backdrop-blur-xl"
                : "border-b border-transparent bg-transparent"
                }`}
        >
            <nav className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
                <a href="#hero" className="group flex shrink-0 items-center gap-1">
                    <span className="font-mono text-lg font-semibold text-cyber-green">{">"}</span>
                    <span className="font-mono text-lg font-semibold text-gray-100 transition-colors duration-300 group-hover:text-cyber-green">
                        Kerem_DÜZ
                    </span>
                    <span className="ml-1 h-5 w-2 animate-blink bg-cyber-green" />
                </a>

                {/* Desktop nav — a pill rail that highlights the section in view */}
                <div className="hidden items-center gap-1 rounded-full border border-white/5 bg-white/[0.02] p-1 backdrop-blur-md lg:flex">
                    {navLinks.map((link) => {
                        const isActive = activeId === link.id;
                        return (
                            <a
                                key={link.id}
                                href={`#${link.id}`}
                                aria-current={isActive ? "true" : undefined}
                                className={`relative rounded-full px-3.5 py-1.5 font-mono text-xs transition-colors duration-300 ${isActive ? "text-dark-bg" : "text-gray-400 hover:text-gray-100"
                                    }`}
                            >
                                {isActive && (
                                    <span className="absolute inset-0 rounded-full bg-cyber-green" aria-hidden="true" />
                                )}
                                <span className="relative">{t(link.key)}</span>
                            </a>
                        );
                    })}
                </div>

                <div className="hidden shrink-0 items-center gap-1 md:flex">
                    {socialLinks.map((link) => (
                        <a
                            key={link.label}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={link.label}
                            className="rounded-lg p-2 text-gray-500 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/5 hover:text-cyber-green"
                        >
                            <link.icon size={18} strokeWidth={1.5} />
                        </a>
                    ))}
                    <div className="ml-2 border-l border-white/10 pl-3">
                        <LanguageSwitcher />
                    </div>
                </div>

                <button
                    className="rounded-lg p-2 text-gray-300 transition-colors hover:text-cyber-green md:hidden"
                    onClick={() => setMobileOpen((open) => !open)}
                    aria-expanded={mobileOpen}
                    aria-label="Menu"
                >
                    {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </nav>

            {mobileOpen && (
                <div className="border-t border-white/5 bg-dark-bg/95 px-6 py-6 backdrop-blur-xl md:hidden">
                    <div className="flex flex-col gap-1">
                        {navLinks.map((link) => (
                            <a
                                key={link.id}
                                href={`#${link.id}`}
                                onClick={() => setMobileOpen(false)}
                                className={`rounded-lg px-3 py-2.5 font-mono text-sm transition-colors ${activeId === link.id
                                    ? "bg-cyber-green/10 text-cyber-green"
                                    : "text-gray-400 hover:bg-white/5 hover:text-gray-100"
                                    }`}
                            >
                                {t(link.key)}
                            </a>
                        ))}
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-5">
                        <div className="flex gap-2">
                            {socialLinks.map((link) => (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={link.label}
                                    className="rounded-lg p-2.5 text-gray-400 transition-colors hover:text-cyber-green"
                                >
                                    <link.icon size={20} strokeWidth={1.5} />
                                </a>
                            ))}
                        </div>
                        <LanguageSwitcher />
                    </div>
                </div>
            )}
        </header>
    );
}
