"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight, Mail } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import clientWebsites from "@/data/clientWebsites";
import { analyticsAPI } from "@/lib/api";
import SectionHeading from "./SectionHeading";

/** Client work: live websites, each a screenshot card linking to the site. */
export default function ClientWebsites() {
    const t = useTranslations("Projects");
    const locale = useLocale() === "en" ? "en" : "tr";

    return (
        <section id="websites" className="relative py-20 md:py-24">
            <div className="mx-auto max-w-4xl px-6">
                <SectionHeading
                    eyebrow={t("websitesTag")}
                    title={
                        <>
                            {t("websitesTitle1")} <span className="text-gradient-cyber">{t("websitesTitle2")}</span>
                        </>
                    }
                    description={t("websitesDesc")}
                />
                <div className="grid gap-5 sm:grid-cols-2">
                    {clientWebsites.map((site, index) => (
                        <motion.a
                            key={site.url}
                            href={site.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => analyticsAPI.track("open_website", site.name)}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-40px" }}
                            transition={{ duration: 0.45, delay: index * 0.08, ease: "easeOut" }}
                            className="glass-card group flex flex-col overflow-hidden !p-0 transition-colors duration-300 hover:border-cyber-green/30"
                        >
                            {/* Browser-chrome frame so the screenshot reads as a live site */}
                            <div className="flex items-center gap-1.5 border-b border-white/[0.06] bg-white/[0.02] px-3 py-2">
                                <span className="h-2 w-2 rounded-full bg-white/10" />
                                <span className="h-2 w-2 rounded-full bg-white/10" />
                                <span className="h-2 w-2 rounded-full bg-white/10" />
                                <span className="ml-2 truncate font-mono text-[10px] text-gray-500">
                                    {site.url.replace(/^https?:\/\/(www\.)?/, "")}
                                </span>
                            </div>
                            <div className="relative aspect-[16/10] overflow-hidden bg-white/5">
                                <Image
                                    src={site.image}
                                    alt={`${site.name} — ${site.category[locale]}`}
                                    fill
                                    sizes="(min-width: 640px) 440px, 100vw"
                                    className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                                />
                            </div>

                            <div className="flex flex-1 flex-col p-5">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="font-mono text-[10px] uppercase tracking-wider text-cyber-green/70">
                                            {site.category[locale]}
                                        </p>
                                        <h3 className="mt-1 font-display text-lg font-semibold text-gray-100 transition-colors group-hover:text-cyber-green">
                                            {site.name}
                                        </h3>
                                    </div>
                                    <ArrowUpRight
                                        size={18}
                                        aria-hidden="true"
                                        className="mt-1 shrink-0 text-gray-600 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cyber-green"
                                    />
                                </div>
                                <p className="mt-2 text-[13px] leading-6 text-gray-400">
                                    {site.description[locale]}
                                </p>
                            </div>
                        </motion.a>
                    ))}
                </div>

                <div className="glass-card mt-5 flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center md:px-7">
                    <div>
                        <p className="font-display text-base font-semibold text-gray-100">{t("websitesCtaTitle")}</p>
                        <p className="mt-1 text-[13px] text-gray-400">{t("websitesCtaDesc")}</p>
                    </div>
                    <a
                        href="mailto:keremduz0304@gmail.com"
                        onClick={() => analyticsAPI.track("website_inquiry", "mailto")}
                        className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-cyber-green/30 bg-cyber-green/10 px-4 py-2 font-mono text-sm text-cyber-green transition-colors hover:border-cyber-green/60 hover:bg-cyber-green/15"
                    >
                        <Mail size={15} strokeWidth={1.8} />
                        {t("websitesCtaButton")}
                    </a>
                </div>
            </div>
        </section>
    );
}
