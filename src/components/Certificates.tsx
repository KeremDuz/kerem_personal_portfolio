"use client";

import { motion } from "framer-motion";
import { Award, ExternalLink, Shield, Code, Globe } from "lucide-react";

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
        date: "2024",
        color: "#EC4899",
        icon: "award",
        image: "/certificates/Cyber Heroes 2.0 Czechia.jpg",
    },
    {
        title: "Cyber Heroes 2.0 Azerbaijan",
        issuer: "Cyber Heroes",
        date: "2024",
        color: "#8B5CF6",
        icon: "award",
        image: "/certificates/Cyber Heroes 2.0 Azerbaijan.jpg",
    },
    {
        title: "Red Hat System Administration",
        issuer: "Red Hat",
        date: "2024",
        color: "#EF4444",
        icon: "code",
        image: "/certificates/Red Hat System Administration.jpg",
    },
    {
        title: "Sızma Testi Eğitimi",
        issuer: "BG-Tek",
        date: "2024",
        color: "#6366F1",
        icon: "shield",
        image: "/certificates/SızmaTestiEğitimiBG-Tek.jpg",
    },
    {
        title: "Beyaz Şapkalı Hacker ve Temel Linux Eğitimi",
        issuer: "BTK Akademi",
        date: "2024",
        color: "#3B82F6",
        icon: "shield",
        image: "/certificates/Beyaz Şapkalı Hacker ve Temel Linux Eğitimi.jpg",
    },
    {
        title: "Zararlı Yazılım Analizi ve Tersine Mühendislik",
        issuer: "Siber Güvenlik",
        date: "2024",
        color: "#14B8A6",
        icon: "code",
        image: "/certificates/Zararlı Yazılım Analizi ve Tersine Mühendislik.jpg",
    },
    {
        title: "Algorithm Of Social Entrepreneurship",
        issuer: "Erasmus+",
        date: "2024",
        color: "#10B981",
        icon: "globe",
        image: "/certificates/Algorithm Of Social Entreprenurship.jpg",
    },
    {
        title: "Liderlik Eğitimi",
        issuer: "Kişisel Gelişim",
        date: "2024",
        color: "#F59E0B",
        icon: "award",
        image: "/certificates/Liderlik Eğitimi.jpg",
    },
];

const iconMap = {
    shield: Shield,
    code: Code,
    globe: Globe,
    award: Award,
};

export default function Certificates() {
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
                    <span className="font-mono text-sm text-cyber-green/50 tracking-wider uppercase block mb-3">
                        {"// certificates.list()"}
                    </span>
                    <h2 className="section-title">
                        <span className="text-gray-100">Sertifikalar</span>{" "}
                        <span className="text-cyber-green">&</span>{" "}
                        <span className="text-gray-100">Rozetler</span>
                    </h2>
                </motion.div>

                {/* Certificate Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {certificates.map((cert, index) => {
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
                                        <img
                                            src={cert.image}
                                            alt={cert.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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
