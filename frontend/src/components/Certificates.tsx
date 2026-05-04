"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

import { motion, AnimatePresence } from "framer-motion";
import { Award, ExternalLink, Shield, Code, Globe, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { certificateAPI } from "@/lib/api";

interface Certificate {
    title: string;
    issuer: string;
    date: string;
    color: string;
    icon: "shield" | "code" | "globe" | "award";
    image?: string;
    link?: string;
}

const staticCertificates: Certificate[] = [
    {
        title: "Cyber Heroes 2.0 Czechia",
        issuer: "Cyber Heroes",
        date: "2025",
        color: "#EC4899",
        icon: "award",
        image: "/certificates/cyber-heroes-2-0-czechia.jpg",
    },
    {
        title: "Cyber Heroes 2.0 Azerbaijan",
        issuer: "Cyber Heroes",
        date: "2025",
        color: "#8B5CF6",
        icon: "award",
        image: "/certificates/cyber-heroes-2-0-azerbaijan.jpg",
    },
    {
        title: "Red Hat System Administration",
        issuer: "Red Hat",
        date: "2025",
        color: "#EF4444",
        icon: "code",
        image: "/certificates/red-hat-system-administration.jpg",
    },
    {
        title: "Sızma Testi Eğitimi",
        issuer: "BG-Tek",
        date: "2024",
        color: "#6366F1",
        icon: "shield",
        image: "/certificates/sizma-testi-egitimi-bg-tek.jpg",
    },
    {
        title: "Beyaz Şapkalı Hacker ve Temel Linux Eğitimi",
        issuer: "BTK Akademi",
        date: "2023",
        color: "#3B82F6",
        icon: "shield",
        image: "/certificates/beyaz-sapkali-hacker-ve-temel-linux-egitimi.jpg",
    },
    {
        title: "Zararlı Yazılım Analizi ve Tersine Mühendislik",
        issuer: "Siber Güvenlik",
        date: "2024",
        color: "#14B8A6",
        icon: "code",
        image: "/certificates/zararli-yazilim-analizi-ve-tersine-muhendislik.jpg",
    },
    {
        title: "Algorithm Of Social Entrepreneurship",
        issuer: "Erasmus+",
        date: "2025",
        color: "#10B981",
        icon: "globe",
        image: "/certificates/algorithm-of-social-entrepreneurship.jpg",
    },
    {
        title: "Speak Up,Make a Difference, Stop The Bullying",
        issuer: "Erasmus+",
        date: "2024",
        color: "#10B981",
        icon: "globe",
        image: "/certificates/speak-up-make-a-difference.jpg",
    },
    {
        title: "Liderlik Eğitimi",
        issuer: "Kişisel Gelişim",
        date: "2020",
        color: "#F59E0B",
        icon: "award",
        image: "/certificates/liderlik-egitimi.jpg",
    },
];

const iconMap = {
    shield: Shield,
    code: Code,
    globe: Globe,
    award: Award,
};

export default function Certificates() {
    const t = useTranslations("Certificates");
    const [certificates, setCertificates] = useState<Certificate[]>(staticCertificates);
    const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);

    useEffect(() => {
        certificateAPI.getAll()
            .then((data) => {
                if (data && data.length > 0) {
                    setCertificates(data.map((c: any) => ({
                        ...c,
                        _id: c._id
                    })));
                }
            })
            .catch(() => { });
    }, []);

    useEffect(() => {
        if (!selectedCertificate?.image) return;

        const scrollY = window.scrollY;
        const previousBodyStyles = {
            position: document.body.style.position,
            top: document.body.style.top,
            width: document.body.style.width,
            overflow: document.body.style.overflow,
            overscrollBehavior: document.body.style.overscrollBehavior,
        };

        document.body.style.position = "fixed";
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = "100%";
        document.body.style.overflow = "hidden";
        document.body.style.overscrollBehavior = "none";

        const handleKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setSelectedCertificate(null);
            }
        };

        window.addEventListener("keydown", handleKey);

        return () => {
            document.body.style.position = previousBodyStyles.position;
            document.body.style.top = previousBodyStyles.top;
            document.body.style.width = previousBodyStyles.width;
            document.body.style.overflow = previousBodyStyles.overflow;
            document.body.style.overscrollBehavior = previousBodyStyles.overscrollBehavior;
            window.scrollTo(0, scrollY);
            window.removeEventListener("keydown", handleKey);
        };
    }, [selectedCertificate]);

    const localizedCertificates = certificates.map((cert: any, index) => ({
        ...cert,
        title: cert._id ? cert.title : t(`items.${index}.title`),
        issuer: cert._id ? cert.issuer : t(`items.${index}.issuer`),
    }));

    return (
        <section id="certificates" className="relative py-24 md:py-32">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyber-green/15 to-transparent" />

            <div className="max-w-6xl mx-auto px-6">
                {/* Section Title */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="mb-14 text-center"
                >
                    <span lang="en" className="font-mono text-sm text-cyber-green/50 tracking-wider uppercase block mb-3">
                        {t("tag")}
                    </span>
                    <h2 className="section-title">
                        <span className="text-gray-100">{t("title1")}</span>{" "}
                        <span className="text-cyber-green">{t("title2")}</span>{" "}
                        <span className="text-gray-100">{t("title3")}</span>
                    </h2>
                </motion.div>

                {/* Certificate Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {localizedCertificates.map((cert, index) => {
                        const Icon = iconMap[cert.icon as keyof typeof iconMap] || iconMap.award;
                        return (
                            <motion.div
                                key={cert.title}
                                initial={{ opacity: 0, y: 25, rotateX: 10 }}
                                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.08 }}
                                className={`glass-card p-5 group relative overflow-hidden ${cert.image ? "cursor-pointer" : ""}`}
                                onClick={() => {
                                    if (cert.image) {
                                        setSelectedCertificate(cert);
                                    }
                                }}
                            >
                                {/* Background glow */}
                                <div
                                    className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-2xl"
                                    style={{ backgroundColor: cert.color }}
                                />

                                {/* Certificate Image (if available) */}
                                {cert.image && (
                                    <div className="relative w-full h-40 mb-4 rounded-lg overflow-hidden border border-white/10 group-hover:border-white/20 transition-colors">
                                        <Image
                                            src={cert.image}
                                            alt={cert.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                                    </div>
                                )}

                                {/* Header */}
                                <div className="flex items-start gap-3 mb-3 relative z-10">
                                    <div
                                        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 backdrop-blur-sm"
                                        style={{
                                            backgroundColor: `${cert.color}12`,
                                            border: `1px solid ${cert.color}25`,
                                        }}
                                    >
                                        <Icon size={18} style={{ color: cert.color }} strokeWidth={1.5} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-mono text-sm font-semibold text-gray-100 group-hover:text-white transition-colors leading-snug">
                                            {cert.title}
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-0.5">{cert.issuer}</p>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-800/50 relative z-10">
                                    <span className="font-mono text-xs text-gray-600">{cert.date}</span>
                                </div>

                                {/* Corner accent */}
                                <div
                                    className="absolute top-0 right-0 w-12 h-12 opacity-5 pointer-events-none"
                                    style={{
                                        background: `linear-gradient(135deg, ${cert.color}, transparent)`,
                                    }}
                                />
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {typeof document !== "undefined" && createPortal(
                <AnimatePresence>
                    {selectedCertificate?.image && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[2147483000] h-[100dvh] w-screen overflow-hidden bg-black"
                            onClick={() => setSelectedCertificate(null)}
                        >
                            {selectedCertificate.link && selectedCertificate.link !== "#" && (
                                <button
                                    type="button"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        window.open(selectedCertificate.link, "_blank", "noopener,noreferrer");
                                    }}
                                    className="fixed left-4 top-4 z-20 inline-flex h-12 items-center gap-2 rounded-full border border-white/15 bg-black/70 px-4 font-mono text-xs text-gray-300 shadow-2xl shadow-black/50 backdrop-blur-xl transition-all hover:border-cyber-green/50 hover:bg-black/85 hover:text-white md:left-6 md:top-6"
                                >
                                    <ExternalLink size={16} strokeWidth={2} />
                                    {selectedCertificate.issuer}
                                </button>
                            )}

                            <button
                                onClick={(event) => {
                                    event.stopPropagation();
                                    setSelectedCertificate(null);
                                }}
                                aria-label="Sertifikayı kapat"
                                className="fixed right-4 top-4 z-20 flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-black/70 text-gray-300 shadow-2xl shadow-black/50 backdrop-blur-xl transition-all hover:border-cyber-green/50 hover:bg-black/85 hover:text-white md:right-6 md:top-6"
                            >
                                <X size={22} strokeWidth={2.4} />
                            </button>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.96 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.96 }}
                                transition={{ duration: 0.2 }}
                                className="absolute inset-0 p-4 pt-20 md:p-10 md:pt-20"
                                onClick={(event) => event.stopPropagation()}
                            >
                                <div className="relative h-full w-full">
                                    <Image
                                        src={selectedCertificate.image}
                                        alt={selectedCertificate.title}
                                        fill
                                        priority
                                        sizes="100vw"
                                        className="object-contain"
                                    />
                                </div>
                            </motion.div>

                            <div className="fixed bottom-4 left-1/2 z-20 max-w-[calc(100vw-32px)] -translate-x-1/2 rounded-full border border-white/15 bg-black/70 px-4 py-2 text-center shadow-2xl shadow-black/50 backdrop-blur-xl md:bottom-6">
                                <p className="font-mono text-xs text-gray-100 md:text-sm">{selectedCertificate.title}</p>
                                <p className="mt-0.5 text-xs text-gray-500">{selectedCertificate.issuer} · {selectedCertificate.date}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </section>
    );
}
