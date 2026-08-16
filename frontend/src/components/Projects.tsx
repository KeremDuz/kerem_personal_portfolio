"use client";

import { useState, useEffect, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";
import { ArrowUpRight, ExternalLink, Shield, Code, Terminal, Wifi, Lock, Database, Globe, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { projectAPI, analyticsAPI, type Project as ApiProject } from "@/lib/api";
import SectionHeading from "./SectionHeading";

const VISIBLE_TAG_COUNT = 6;

const iconMap: Record<string, any> = {
    wifi: Wifi, shield: Shield, globe: Globe, database: Database,
    lock: Lock, code: Code, terminal: Terminal,
};

const staticProjects = [
    {
        title: "PhishCatch — AI Destekli Phishing Tespit Sistemi",
        description:
            "Flutter ve FastAPI mimarisiyle şüpheli URL ve QR kodlarını analiz ederek oltalama saldırılarını tespit eden yapay zekâ destekli güvenlik uygulaması. Python, Pandas ve Scikit-learn ile eğitilen modeller; PhishTank, URLhaus, Google Safe Browsing ve VirusTotal istihbaratıyla birlikte dinamik risk skoru ve ayrıntılı rapor üretir.",
        tags: ["Flutter", "FastAPI", "Python", "Scikit-learn", "Machine Learning", "Threat Intelligence"],
        icon: "shield",
        link: "#",
    },
    {
        title: "WiFi & Bluetooth Jammer",
        description:
            "ESP32 tabanlı, 2.4 GHz Wi-Fi ve Bluetooth frekanslarında kablosuz güvenlik analizleri gerçekleştiren çift modlu cihaz. Arduino IDE üzerinden entegre edilen C++ tabanlı açık kaynak yazılımla kontrollü test ortamları için geliştirildi.",
        tags: ["ESP32", "C++", "Arduino", "Wireless Security", "IoT Security"],
        icon: "wifi",
        link: "#",
    },
    {
        title: "WiFi Deauthenticator",
        description:
            "ESP8266 ile ortamdaki Wi-Fi trafiğini izleyen ve kontrollü laboratuvar ortamında deauthentication senaryolarıyla ağ güvenliğini test eden sistem. C++ tabanlı yazılım Arduino IDE üzerinden karta aktarıldı.",
        tags: ["ESP8266", "C++", "Arduino", "Network Security", "Packet Monitoring"],
        icon: "shield",
        link: "#",
    },
    {
        title: "File Upload Detector",
        description:
            "Web uygulamalarındaki dosya yükleme alanlarını belirleyen; statik HTML'nin yanı sıra sayfa yüklendikten sonra oluşan dinamik içeriği de analiz eden güvenlik aracı. Makine öğrenimi için elle hazırlanmış veri kümesiyle desteklendi.",
        tags: ["Python", "Web Security", "Dynamic Analysis", "Machine Learning", "Dataset"],
        icon: "lock",
        link: "#",
    },
    {
        title: "Personal Website & AI Assistant",
        description:
            "Next.js, Express.js ve FastAPI tabanlı mikroservis mimarisiyle geliştirilen siber güvenlik temalı portfolyo ve içerik yönetim platformu. JWT korumalı yönetim paneli, Three.js seyahat görselleştirmeleri, OpenAI tabanlı AI asistanı, çoklu dil, ziyaretçi analitiği, Cloudinary ve MongoDB entegrasyonlarını içerir.",
        tags: ["Next.js", "Express.js", "FastAPI", "OpenAI", "Three.js", "MongoDB", "Cloudinary", "LangChain"],
        icon: "code",
        link: "https://www.keremduz.com",
    },
    {
        title: "OrduCep — Askerî Sosyal Tesis Yönetim Platformu",
        description:
            "Angular web, Flutter mobil ve ASP.NET Core Web API (.NET 8) ile Türkiye'deki askerî misafirhane ve sosyal tesislerin keşif ve rezervasyon yönetimini sağlayan full-stack platform. EF Core ve MySQL, JWT rol yönetimi, Google Maps/Places, yönetim paneli ve Azure DevOps/Render dağıtım süreçlerini içerir.",
        tags: ["Angular", "Flutter", ".NET 8", "EF Core", "MySQL", "JWT", "Google Maps", "Azure DevOps"],
        icon: "globe",
        link: "#",
    },
    {
        title: "Akdeniz Siber Güvenlik Topluluğu Web Platformu",
        description:
            "Angular, RxJS ve Spring Boot ile topluluğun etkinlik, eğitim, proje ve ekip iş akışlarını yöneten kurumsal web platformu. Spring Security/JWT, PostgreSQL, Spring Data JPA, başvuru onay süreçleri, otomatik e-posta, dosya yükleme ve istatistik modüllerini içerir.",
        tags: ["Angular", "RxJS", "Spring Boot", "Spring Security", "PostgreSQL", "JWT", "Spring Mail"],
        icon: "globe",
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
            "Java tabanlı stok takip otomasyonu. Observer, Composite ve Strategy gibi Tasarım Kalıpları kullanılarak geliştirildi.",
        tags: ["Java", "Design Patterns", "OOP", "Automation"],
        icon: "database",
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

type ProjectsProps = {
    initialProjects?: ApiProject[];
};

function normalizeProject(project: ApiProject) {
    return {
        _id: project._id,
        title: project.title,
        description: project.description,
        tags: project.tags || [],
        icon: project.icon || "code",
        link: project.link || "#",
    };
}

export default function Projects({ initialProjects = [] }: ProjectsProps) {
    const t = useTranslations("Projects");
    const [projects, setProjects] = useState<any[]>(
        initialProjects.length > 0 ? initialProjects.map(normalizeProject) : staticProjects
    );
    const [selectedProject, setSelectedProject] = useState<any | null>(null);

    useEffect(() => {
        projectAPI.getAll()
            .then((data) => {
                if (data && data.length > 0) {
                    setProjects(data.map(normalizeProject));
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

            <div className="max-w-4xl mx-auto px-6">
                <SectionHeading
                    eyebrow={t("tag")}
                    title={
                        <>
                            {t("title1")} <span className="text-gradient-cyber">{t("title2")}</span>{" "}
                            {t("title3")}
                        </>
                    }
                    description={t("desc")}
                />

                {/* An index, not a card wall. Six 290px-tall cards stacked to
                    well over 2000px on a phone; these rows say the same thing in
                    a fraction of the height, and the detail lives in the modal. */}
                <motion.ul
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    className="glass-card divide-y divide-white/[0.06] overflow-hidden !p-0"
                >
                    {localizedProjects.map((project, index) => {
                        const visibleTags = project.tags.slice(0, VISIBLE_TAG_COUNT);

                        return (
                            <motion.li key={project._id || project.title} variants={cardVariants}>
                                <div
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => openProjectDetails(project)}
                                    onKeyDown={(event) => {
                                        if (event.key === "Enter" || event.key === " ") {
                                            event.preventDefault();
                                            openProjectDetails(project);
                                        }
                                    }}
                                    className="group relative flex cursor-pointer items-center gap-4 px-5 py-4 transition-colors duration-300 hover:bg-white/[0.03] focus-visible:bg-white/[0.03] focus-visible:outline-none md:gap-5 md:px-7 md:py-5"
                                >
                                    {/* Accent that slides in from the left edge */}
                                    <span
                                        aria-hidden="true"
                                        className="absolute inset-y-0 left-0 w-[2px] origin-top scale-y-0 bg-cyber-green transition-transform duration-300 group-hover:scale-y-100"
                                    />

                                    <span className="hidden w-6 shrink-0 font-mono text-xs text-gray-700 sm:block">
                                        {String(index + 1).padStart(2, "0")}
                                    </span>

                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-cyber-green/20 bg-cyber-green/10 transition-colors duration-300 group-hover:border-cyber-green/45">
                                        <project.IconComponent size={18} className="text-cyber-green" strokeWidth={1.5} />
                                    </span>

                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate font-display text-[15px] font-semibold text-gray-100 transition-colors duration-300 group-hover:text-cyber-green md:text-base">
                                            {project.title}
                                        </span>
                                        <span className="mt-0.5 block truncate text-[13px] text-gray-500">
                                            {project.description}
                                        </span>
                                    </span>

                                    <span className="hidden shrink-0 items-center gap-1.5 lg:flex">
                                        {visibleTags.slice(0, 3).map((tag: string) => (
                                            <span
                                                key={tag}
                                                className="rounded-md border border-white/[0.07] bg-white/[0.03] px-2 py-0.5 font-mono text-[10px] text-gray-500"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </span>

                                    {hasProjectLink(project) ? (
                                        <button
                                            type="button"
                                            aria-label={t("visitProject")}
                                            onClick={(event) => openProjectLink(event, project)}
                                            className="shrink-0 rounded-lg p-2 text-gray-600 transition-colors hover:text-cyber-green"
                                        >
                                            <ExternalLink size={15} strokeWidth={1.6} />
                                        </button>
                                    ) : (
                                        <ArrowUpRight
                                            size={16}
                                            aria-hidden="true"
                                            className="shrink-0 text-gray-700 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-cyber-green"
                                        />
                                    )}
                                </div>
                            </motion.li>
                        );
                    })}
                </motion.ul>

                {typeof document !== "undefined" && createPortal(
                    <AnimatePresence>
                        {selectedProject && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-[2147483000] flex items-center justify-center bg-black/85 px-4 py-6 backdrop-blur-sm"
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
