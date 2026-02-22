"use client";

import Image from "next/image";

import { motion } from "framer-motion";
import { Award, ExternalLink, Shield, Code, Globe } from "lucide-react";
import { useTranslations } from "next-intl";

interface Certificate {
    title: string;
    issuer: string;
    date: string;
    color: string;
    icon: "shield" | "code" | "globe" | "award";
    image?: string;
    link?: string;
}

const certificates: Certificate[] = [
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

    const localizedCertificates = certificates.map((cert, index) => ({
        ...cert,
        title: t(`items.${index}.title`),
        issuer: t(`items.${index}.issuer`),
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
                        const Icon = iconMap[cert.icon];
                        return (
                            <motion.div
                                key={cert.title}
                                initial={{ opacity: 0, y: 25, rotateX: 10 }}
                                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.08 }}
                                className="glass-card p-5 group relative overflow-hidden"
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
        </section>
    );
}
