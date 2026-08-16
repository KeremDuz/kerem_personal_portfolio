"use client";

import { motion } from "framer-motion";
import { GraduationCap, Briefcase, Award, ArrowLeftRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { timelineAPI, type TimelineItem as ApiTimelineItem } from "@/lib/api";
import SectionHeading from "./SectionHeading";
import { accent } from "@/lib/theme";

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
        year: "Haziran — Ağustos 2026",
        title: "Siber Güvenlik Stajyeri",
        subtitle: "Anex Tour",
        description: "Siber güvenlik ekibinde stajyer olarak görev aldım.",
        type: "work",
        tags: ["Siber Güvenlik", "Staj"],
    },
    {
        year: "Şubat — Haziran 2026",
        title: "Siber Güvenlik Ürün Satışı",
        subtitle: "S4E",
        description: "Siber güvenlik ürünlerinin satış süreçlerinde görev aldım.",
        type: "work",
        tags: ["Siber Güvenlik", "Ürün Satışı"],
    },
    {
        year: "Ocak — Şubat 2026",
        title: "Siber Güvenlik Stajyeri",
        subtitle: "S4E",
        description: "Siber güvenlik alanında stajyer olarak görev aldım.",
        type: "work",
        tags: ["Siber Güvenlik", "Staj"],
    },
    {
        year: "2026 Dönemi",
        title: "Topluluk Başkanı",
        subtitle: "Akdeniz Siber Güvenlik Topluluğu",
        description: "2026 döneminde topluluğun başkanlık görevini üstlendim.",
        type: "work",
        tags: ["Liderlik", "Siber Güvenlik", "Topluluk"],
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
];

type TimelineProps = {
    initialTimelines?: ApiTimelineItem[];
};

export default function Timeline({ initialTimelines = [] }: TimelineProps) {
    const t = useTranslations("Timeline");
    const [timelines, setTimelines] = useState<any[]>(
        initialTimelines.length > 0 ? initialTimelines : timelineData
    );

    useEffect(() => {
        timelineAPI
            .getAll()
            .then((data) => {
                if (data && data.length > 0) setTimelines(data);
            })
            .catch(() => { });
    }, []);

    const typeConfig: Record<string, any> = {
        education: { icon: GraduationCap, color: accent.green, label: t("education") },
        work: { icon: Briefcase, color: accent.blue, label: t("work") },
        certification: { icon: Award, color: accent.amber, label: t("certification") },
    };

    const items = timelines.map((item, index) => ({
        ...item,
        title: item._id ? item.title : t(`items.${index}.title`),
        subtitle: item._id ? item.subtitle : t(`items.${index}.subtitle`),
        description: item._id ? item.description : t(`items.${index}.desc`),
    }));

    return (
        <section id="timeline" className="relative py-24 md:py-32">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyber-blue/15 to-transparent" />

            <div className="mx-auto max-w-6xl px-6">
                <SectionHeading
                    eyebrow={t("tag")}
                    title={
                        <>
                            {t("title1")} <span className="text-gradient-cyber">{t("title2")}</span>{" "}
                            {t("title3")}
                        </>
                    }
                />

                <div className="mb-3 flex items-center gap-2 text-gray-600 md:hidden">
                    <ArrowLeftRight size={14} strokeWidth={1.6} aria-hidden="true" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em]">
                        {t("swipeHint")}
                    </span>
                </div>

                {/* Compact horizontal summaries on phones; concise grid cards on larger screens. */}
                <div className="-mx-6 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-6 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:grid md:snap-none md:grid-cols-2 md:gap-4 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-3">
                    {items.map((item, index) => {
                        const config = typeConfig[item.type] ?? typeConfig.work;
                        const Icon = config.icon;

                        return (
                            <motion.article
                                key={item._id || `${item.title}-${index}`}
                                initial={{ opacity: 0, y: 18 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-60px" }}
                                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: index * 0.08 }}
                                className="glass-card group relative w-[74vw] max-w-[280px] shrink-0 snap-start overflow-hidden p-4 md:w-auto md:max-w-none md:shrink md:p-5"
                            >
                                {/* Colour wash keyed to the entry type */}
                                <div
                                    aria-hidden="true"
                                    className="pointer-events-none absolute -right-14 -top-14 h-36 w-36 rounded-full opacity-[0.07] blur-2xl transition-opacity duration-500 group-hover:opacity-[0.14]"
                                    style={{ backgroundColor: config.color }}
                                />

                                <div className="relative">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex min-w-0 items-center gap-2.5">
                                            <div
                                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                                                style={{
                                                    backgroundColor: `${config.color}18`,
                                                    border: `1px solid ${config.color}35`,
                                                }}
                                            >
                                                <Icon size={16} strokeWidth={1.6} style={{ color: config.color }} />
                                            </div>
                                            <span
                                                className="truncate font-mono text-[9px] uppercase tracking-[0.17em]"
                                                style={{ color: config.color }}
                                            >
                                                {config.label}
                                            </span>
                                        </div>
                                        <time className="max-w-[48%] shrink-0 text-right font-mono text-[9px] font-normal leading-[1.35] tracking-[0.02em] text-gray-500 md:text-[10px]">
                                            {item.year}
                                        </time>
                                    </div>

                                    <h3 className="mt-4 font-display text-base font-semibold leading-snug text-gray-100 md:text-[17px]">
                                        {item.title}
                                    </h3>
                                    <p
                                        className="mt-1 truncate font-mono text-xs"
                                        style={{ color: config.color }}
                                    >
                                        {item.subtitle}
                                    </p>

                                    <p className="mt-2 line-clamp-2 text-[13px] leading-5 text-gray-400 md:line-clamp-3">
                                        {item.description}
                                    </p>

                                    {item.tags && item.tags.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-1.5">
                                            {item.tags.map((tag: string, tagIndex: number) => (
                                                <span
                                                    key={tag}
                                                    className={`${tagIndex > 1 ? "hidden md:inline-flex" : "inline-flex"} rounded-md border border-white/[0.07] bg-white/[0.03] px-1.5 py-0.5 font-mono text-[9px] text-gray-500 md:px-2 md:text-[10px]`}
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                            {item.tags.length > 2 && (
                                                <span className="inline-flex rounded-md border border-white/[0.07] bg-white/[0.03] px-1.5 py-0.5 font-mono text-[9px] text-gray-600 md:hidden">
                                                    +{item.tags.length - 2}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </motion.article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
