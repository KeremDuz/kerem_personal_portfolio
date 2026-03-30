"use client";

import { motion } from "framer-motion";
import { GraduationCap, Briefcase, Award, Calendar } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { timelineAPI } from "@/lib/api";

interface TimelineItem {
    year: string;
    title: string;
    subtitle: string;
    description: string;
    type: "education" | "work" | "certification";
    tags?: string[];
}

const timelineData: TimelineItem[] = [
    {
        year: "2026",
        title: "Stajyer",
        subtitle: "S4E",
        description:
            "Şirket bünyesinde staj deneyimi.",
        type: "work",
        tags: ["Staj", "Siber Güvenlik"],
    },
    {
        year: "2022 — Devam",
        title: "Bilgisayar Mühendisliği",
        subtitle: "Akdeniz Üniversitesi",
        description:
            "Bilgisayar Mühendisliği lisans programı. Ağ güvenliği, yazılım geliştirme ve sistem yönetimi üzerine odaklanma.",
        type: "education",
        tags: ["C/C++", "Java", "Data Structures", "Algorithms"],
    },
    {
        year: "2022",
        title: "12. Sınıf (2. Dönem)",
        subtitle: "Açık Öğretim Lisesi",
        description:
            "Lise eğitimimin son dönemini Açık Öğretim Lisesi'nde tamamladım.",
        type: "education",
    },
    {
        year: "2021",
        title: "12. Sınıf (1. Dönem)",
        subtitle: "Gelibolu Amerikan Kültür Koleji",
        description:
            "Lise son sınıf eğitiminin ilk dönemi.",
        type: "education",
    },
    {
        year: "2019 — 2021",
        title: "10. ve 11. Sınıf",
        subtitle: "Hayat Koleji",
        description:
            "Lise eğitimimin orta dönemi.",
        type: "education",
    },
    {
        year: "2018 — 2019",
        title: "9. Sınıf",
        subtitle: "Kars Harakani Anadolu Lisesi",
        description:
            "Lise eğitimime Kars'ta başladım.",
        type: "education",
    },
];

export default function Timeline() {
    const t = useTranslations("Timeline");
    const [timelines, setTimelines] = useState<any[]>(timelineData);

    useEffect(() => {
        timelineAPI.getAll()
            .then(data => {
                if (data && data.length > 0) {
                    setTimelines(data);
                }
            })
            .catch(() => {});
    }, []);

    const typeConfig: Record<string, any> = {
        education: { icon: GraduationCap, color: "#00ff41", label: t("education") },
        work: { icon: Briefcase, color: "#00f3ff", label: t("work") },
        certification: { icon: Award, color: "#f59e0b", label: t("certification") },
    };

    const localizedTimelineData = timelines.map((item, index) => ({
        ...item,
        title: item._id ? item.title : t(`items.${index}.title`),
        subtitle: item._id ? item.subtitle : t(`items.${index}.subtitle`),
        description: item._id ? item.description : t(`items.${index}.desc`),
    }));

    return (
        <section id="timeline" className="relative py-24 md:py-32">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyber-blue/15 to-transparent" />

            <div className="max-w-4xl mx-auto px-6">
                {/* Section Title */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="mb-16 text-center"
                >
                    <span lang="en" className="font-mono text-sm text-cyber-blue/50 tracking-wider uppercase block mb-3">
                        {t("tag")}
                    </span>
                    <h2 className="section-title">
                        <span className="text-gray-100">{t("title1")}</span>{" "}
                        <span className="text-gradient-cyber">{t("title2")}</span>{" "}
                        <span className="text-gray-100">{t("title3")}</span>
                    </h2>
                </motion.div>

                {/* Timeline */}
                <div className="relative">
                    {/* Vertical line */}
                    <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-cyber-green/30 via-cyber-blue/20 to-transparent md:-translate-x-px" />

                    <div className="space-y-12">
                        {localizedTimelineData.map((item, index) => {
                            const config = typeConfig[item.type];
                            const Icon = config.icon;
                            const isLeft = index % 2 === 0;

                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    className={`relative flex items-start gap-6 ${isLeft ? "md:flex-row" : "md:flex-row-reverse"
                                        }`}
                                >
                                    {/* Dot on line */}
                                    <div className="absolute left-6 md:left-1/2 w-3 h-3 rounded-full border-2 -translate-x-1/2 z-10 mt-6"
                                        style={{
                                            borderColor: config.color,
                                            backgroundColor: "#0a0a0a",
                                            boxShadow: `0 0 8px ${config.color}50`,
                                        }}
                                    />

                                    {/* Spacer for mobile */}
                                    <div className="w-12 shrink-0 md:hidden" />

                                    {/* Card */}
                                    <div className={`flex-1 ${isLeft ? "md:pr-12" : "md:pl-12"} md:w-1/2`}>
                                        <div className="glass-card p-5 group">
                                            {/* Header */}
                                            <div className="flex items-center gap-3 mb-3">
                                                <div
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                                                    style={{
                                                        backgroundColor: `${config.color}15`,
                                                        border: `1px solid ${config.color}25`,
                                                    }}
                                                >
                                                    <Icon size={16} style={{ color: config.color }} strokeWidth={1.5} />
                                                </div>
                                                <div>
                                                    <span
                                                        className="text-[10px] font-mono uppercase tracking-widest"
                                                        style={{ color: config.color }}
                                                    >
                                                        {config.label}
                                                    </span>
                                                </div>
                                                <div className="ml-auto flex items-center gap-1.5 text-gray-600">
                                                    <Calendar size={12} />
                                                    <span className="font-mono text-xs">{item.year}</span>
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <h3 className="font-mono font-semibold text-gray-100 mb-1 group-hover:text-cyber-green transition-colors">
                                                {item.title}
                                            </h3>
                                            <p className="text-sm text-gray-500 mb-2">{item.subtitle}</p>
                                            <p className="text-sm text-gray-400 leading-relaxed mb-3">
                                                {item.description}
                                            </p>

                                            {/* Tags */}
                                            {item.tags && (
                                                <div className="flex flex-wrap gap-1.5">
                                                    {item.tags.map((tag: string) => (
                                                        <span
                                                            key={tag}
                                                            className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-dark-surface/80 border border-gray-800 text-gray-500"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Empty space for alternating layout */}
                                    <div className="hidden md:block flex-1 md:w-1/2" />
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
