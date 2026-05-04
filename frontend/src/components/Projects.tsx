"use client";

import { useState, useEffect, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";
import { ExternalLink, Shield, Code, Terminal, Wifi, Lock, Database, Globe, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { projectAPI, analyticsAPI } from "@/lib/api";

const VISIBLE_TAG_COUNT = 6;

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
    const [projects, setProjects] = useState<any[]>(staticProjects);
    const [selectedProject, setSelectedProject] = useState<any | null>(null);

    useEffect(() => {
        projectAPI.getAll()
            .then((data) => {
                if (data && data.length > 0) {
                    setProjects(data.map((p: any) => ({
                        _id: p._id,
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

    useEffect(() => {
        if (!selectedProject) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const handleKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setSelectedProject(null);
            }
        };

        window.addEventListener("keydown", handleKey);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", handleKey);
        };
    }, [selectedProject]);

    const localizedProjects = projects.map((project, index) => ({
        ...project,
        IconComponent: iconMap[project.icon] || Code,
        title: project._id ? project.title : t(`items.${index}.title`),
        description: project._id ? project.description : t(`items.${index}.desc`),
    }));

    const hasProjectLink = (project: any) => Boolean(project.link && project.link !== "#");

    const openProjectDetails = (project: any) => {
        analyticsAPI.track("view_project", project.title);
        setSelectedProject(project);
    };

    const openProjectLink = (event: MouseEvent, project: any) => {
        event.stopPropagation();
        analyticsAPI.track("open_project", project.title);
        window.open(project.link, "_blank", "noopener,noreferrer");
    };

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
                    {localizedProjects.map((project) => {
                        const visibleTags = project.tags.slice(0, VISIBLE_TAG_COUNT);
                        const hiddenTagCount = Math.max(project.tags.length - VISIBLE_TAG_COUNT, 0);

                        return (
                            <motion.div
                                key={project._id || project.title}
                                variants={cardVariants}
                                className="glass-card group relative flex h-full min-h-[292px] cursor-pointer flex-col overflow-hidden p-6"
                                onClick={() => openProjectDetails(project)}
                            >
                                {/* Top glow line */}
                                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyber-green/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                {/* Icon */}
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="w-10 h-10 shrink-0 rounded-lg bg-cyber-green/10 flex items-center justify-center border border-cyber-green/20 group-hover:border-cyber-green/40 transition-colors duration-300">
                                        <project.IconComponent
                                            size={20}
                                            className="text-cyber-green"
                                            strokeWidth={1.5}
                                        />
                                    </div>
                                    {hasProjectLink(project) && (
                                        <motion.button
                                            type="button"
                                            aria-label={t("visitProject")}
                                            className="ml-auto text-gray-500 hover:text-cyber-green transition-colors"
                                            whileHover={{ scale: 1.1 }}
                                            onClick={(event) => openProjectLink(event, project)}
                                        >
                                            <ExternalLink size={16} strokeWidth={1.5} />
                                        </motion.button>
                                    )}
                                </div>

                                {/* Title */}
                                <h3 className="font-mono text-lg font-semibold text-gray-100 mb-2 line-clamp-2 group-hover:text-cyber-green transition-colors duration-300">
                                    {project.title}
                                </h3>

                                {/* Description */}
                                <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-4">
                                    {project.description}
                                </p>

                                {/* Tags */}
                                <div className="mt-auto flex flex-wrap gap-2 pt-2">
                                    {visibleTags.map((tag: string) => (
                                        <span key={tag} className="badge text-[11px]">
                                            {tag}
                                        </span>
                                    ))}
                                    {hiddenTagCount > 0 && (
                                        <span className="badge text-[11px] text-cyber-green/80">
                                            +{hiddenTagCount}
                                        </span>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {typeof document !== "undefined" && createPortal(
                    <AnimatePresence>
                        {selectedProject && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-[2147483647] flex items-center justify-center bg-black/85 px-4 py-6 backdrop-blur-sm"
                                onClick={() => setSelectedProject(null)}
                            >
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.96, y: 16 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.96, y: 16 }}
                                    transition={{ duration: 0.2 }}
                                    className="relative w-full max-w-2xl max-h-[calc(100dvh-48px)] overflow-y-auto rounded-xl border border-cyber-green/25 bg-dark-card/95 p-6 shadow-2xl shadow-cyber-green/10 md:p-8"
                                    onClick={(event) => event.stopPropagation()}
                                >
                                    <button
                                        type="button"
                                        aria-label={t("closeProject")}
                                        className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/50 text-gray-200 transition-colors hover:border-cyber-green/40 hover:text-cyber-green"
                                        onClick={() => setSelectedProject(null)}
                                    >
                                        <X size={20} strokeWidth={2} />
                                    </button>

                                    <div className="mb-5 flex items-center gap-3 pr-14">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-cyber-green/30 bg-cyber-green/10">
                                            <selectedProject.IconComponent
                                                size={22}
                                                className="text-cyber-green"
                                                strokeWidth={1.5}
                                            />
                                        </div>
                                        <h3 className="font-mono text-xl font-semibold text-gray-100 md:text-2xl">
                                            {selectedProject.title}
                                        </h3>
                                    </div>

                                    <p className="text-sm leading-7 text-gray-300 md:text-base">
                                        {selectedProject.description}
                                    </p>

                                    <div className="mt-6">
                                        <p className="mb-3 font-mono text-xs uppercase tracking-wider text-cyber-green/70">
                                            {t("technologies")}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedProject.tags.map((tag: string) => (
                                                <span key={tag} className="badge text-[11px]">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {hasProjectLink(selectedProject) && (
                                        <button
                                            type="button"
                                            className="mt-7 inline-flex items-center gap-2 rounded-lg border border-cyber-green/30 bg-cyber-green/10 px-4 py-2 font-mono text-sm text-cyber-green transition-colors hover:border-cyber-green/60 hover:bg-cyber-green/15"
                                            onClick={(event) => openProjectLink(event, selectedProject)}
                                        >
                                            <ExternalLink size={16} strokeWidth={1.8} />
                                            {t("visitProject")}
                                        </button>
                                    )}
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>,
                    document.body
                )}

            </div>
        </section>
    );
}
