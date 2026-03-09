"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Shield, Code, Terminal, Wifi, Lock, Database, Globe } from "lucide-react";
import { useTranslations } from "next-intl";
import { projectAPI, analyticsAPI } from "@/lib/api";

const iconMap: Record<string, any> = {
    wifi: Wifi, shield: Shield, globe: Globe, database: Database,
    lock: Lock, code: Code, terminal: Terminal,
};

const staticProjects = [
    {
        title: "WiFi & Bluetooth Jammer",
        description:
            "ESP32 mikrodenetleyicisi ile 2.4GHz WiFi ve Bluetooth frekanslarını analiz eden çift modlu cihaz. Arduino IDE ve C++ ile geliştirildi.",
        tags: ["ESP32", "C++", "Arduino", "IoT Security"],
        icon: "wifi",
        link: "#",
    },
    {
        title: "WiFi Deauthenticator",
        description:
            "ESP8266 ile WiFi trafiğini izleyen ve güvenlik açıklarını test eden (Packet Monitoring/Deauth) sistem.",
        tags: ["ESP8266", "Network Security", "C++", "Packet Sniffing"],
        icon: "shield",
        link: "#",
    },
    {
        title: "E-Ticaret Sitesi",
        description:
            "Angular ve Spring Boot tabanlı kapsamlı alışveriş sitesi. JWT ile güvenli giriş, ürün ve sepet yönetimi özellikleri.",
        tags: ["Angular", "Spring Boot", "Java", "JWT"],
        icon: "globe",
        link: "#",
    },
    {
        title: "Kitap Envanter Sistemi",
        description:
            "Java tabanlı stok takip otomasyonu. Observer, Composite ve Strategy gibi Tasarım Kalıpları (Design Patterns) kullanılarak geliştirildi.",
        tags: ["Java", "Design Patterns", "OOP", "Automation"],
        icon: "database",
        link: "#",
    },
    {
        title: "File Upload Detector",
        description:
            "Web sitelerinde file upload noktalarını tespit eden ve potansiyel güvenlik açıklarını analiz eden Python aracı.",
        tags: ["Python", "Web Security", "Vulnerability Scanning"],
        icon: "lock",
        link: "#",
    },
    {
        title: "Portfolio Website",
        description:
            "Bu web sitesi! Next.js, Tailwind CSS ve Three.js ile geliştirilmiş, siber güvenlik temalı kişisel portfolyo.",
        tags: ["Next.js", "React", "TypeScript", "Three.js"],
        icon: "code",
        link: "#",
    },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.12,
        },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" },
    },
};

export default function Projects() {
    const t = useTranslations("Projects");
    const [projects, setProjects] = useState(staticProjects);

    useEffect(() => {
        projectAPI.getAll()
            .then((data) => {
                if (data && data.length > 0) {
                    setProjects(data.map((p: any) => ({
                        title: p.title,
                        description: p.description,
                        tags: p.tags || [],
                        icon: p.icon || "code",
                        link: p.link || "#",
                    })));
                }
            })
            .catch(() => { });
    }, []);

    const localizedProjects = projects.map((project, index) => ({
        ...project,
        IconComponent: iconMap[project.icon] || Code,
        title: t(`items.${index}.title`),
        description: t(`items.${index}.desc`),
    }));

    return (
        <section id="projects" className="relative py-24 md:py-32">
            {/* Section divider gradient */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyber-green/20 to-transparent" />

            <div className="max-w-7xl mx-auto px-6">
                {/* Section Title */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="mb-16 text-center"
                >
                    <span lang="en" className="font-mono text-sm text-cyber-green/50 tracking-wider uppercase block mb-3">
                        {t("tag")}
                    </span>
                    <h2 className="section-title">
                        <span className="text-gray-100">{t("title1")}</span>{" "}
                        <span className="text-gradient-cyber">{t("title2")}</span>{" "}
                        <span className="text-gray-100">{t("title3")}</span>
                    </h2>
                    <p className="text-gray-400 mt-4 max-w-xl mx-auto">
                        {t("desc")}
                    </p>
                </motion.div>

                {/* Cards Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {localizedProjects.map((project, index) => (
                        <motion.div
                            key={project.title}
                            variants={cardVariants}
                            className="glass-card p-6 group cursor-pointer relative overflow-hidden"
                            onClick={() => {
                                analyticsAPI.track("view_project", project.title);
                                if (project.link && project.link !== "#") {
                                    window.open(project.link, "_blank");
                                }
                            }}
                        >
                            {/* Top glow line */}
                            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyber-green/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            {/* Icon */}
                            <div className="mb-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-cyber-green/10 flex items-center justify-center border border-cyber-green/20 group-hover:border-cyber-green/40 transition-colors duration-300">
                                    <project.IconComponent
                                        size={20}
                                        className="text-cyber-green"
                                        strokeWidth={1.5}
                                    />
                                </div>
                                <motion.div
                                    className="ml-auto text-gray-500 hover:text-cyber-green transition-colors"
                                    whileHover={{ scale: 1.1 }}
                                >
                                    <ExternalLink size={16} strokeWidth={1.5} />
                                </motion.div>
                            </div>

                            {/* Title */}
                            <h3 className="font-mono text-lg font-semibold text-gray-100 mb-2 group-hover:text-cyber-green transition-colors duration-300">
                                {project.title}
                            </h3>

                            {/* Description */}
                            <p className="text-gray-400 text-sm leading-relaxed mb-4">
                                {project.description}
                            </p>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2">
                                {project.tags.map((tag) => (
                                    <span key={tag} className="badge text-[11px]">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </motion.div>


            </div>
        </section>
    );
}
