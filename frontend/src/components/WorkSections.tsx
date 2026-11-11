"use client";

import { motion } from "framer-motion";
import { ArrowDown, ArrowLeft, Check, MessageCircle, Phone } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { analyticsAPI } from "@/lib/api";
import { PHONE_DISPLAY, telHref, whatsappHref } from "@/lib/contact";
import { processSteps, sectors, webServices } from "@/data/webServices";
import SectionHeading from "./SectionHeading";

/** Sales sections of the /projects page: what I build for businesses and how
 *  to reach me. Every call to action is a phone call or a WhatsApp message. */

function useLang(): "tr" | "en" {
    return useLocale() === "en" ? "en" : "tr";
}

export function CallButton({ size = "md", label }: { size?: "md" | "lg"; label?: string }) {
    const t = useTranslations("ProjectsPage");
    return (
        <a
            href={telHref}
            onClick={() => analyticsAPI.track("contact_call", PHONE_DISPLAY)}
            className={`inline-flex items-center gap-2.5 rounded-xl bg-cyber-green font-semibold text-dark-bg shadow-lg shadow-cyber-green/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-cyber-green/40 ${size === "lg" ? "px-5 py-3.5 text-[15px] md:px-6 md:py-4 md:text-lg" : "px-5 py-3 text-sm"}`}
        >
            <Phone size={size === "lg" ? 20 : 16} strokeWidth={2.2} />
            <span className="whitespace-nowrap">
                {label ?? t("callNow")} <span className="font-mono">· {PHONE_DISPLAY}</span>
            </span>
        </a>
    );
}

function WhatsAppButton() {
    const t = useTranslations("ProjectsPage");
    return (
        <a
            href={whatsappHref(t("whatsappMessage"))}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => analyticsAPI.track("contact_whatsapp", PHONE_DISPLAY)}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-gray-200 transition-colors hover:border-cyber-green/40 hover:text-cyber-green"
        >
            <MessageCircle size={16} strokeWidth={2} />
            {t("whatsapp")}
        </a>
    );
}

export function WorkHero() {
    const t = useTranslations("ProjectsPage");
    const highlights = [t("highlight1"), t("highlight2"), t("highlight3")];

    return (
        <section className="relative overflow-hidden pt-32 pb-16 md:pt-40 md:pb-20">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[780px] -translate-x-1/2 rounded-full bg-cyber-green/10 blur-[120px]"
            />
            <div className="relative mx-auto max-w-4xl px-6">
                <Link
                    href="/"
                    className="mb-8 inline-flex items-center gap-1.5 font-mono text-xs text-gray-500 transition-colors hover:text-cyber-green"
                >
                    <ArrowLeft size={14} />
                    {t("back")}
                </Link>

                <p className="mb-3 font-mono text-sm text-cyber-green/60">{t("tag")}</p>
                <h1 className="text-4xl font-bold leading-tight text-gray-100 md:text-6xl">
                    {t("title1")} <span className="text-gradient-cyber">{t("title2")}</span> {t("title3")}
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-relaxed text-gray-400 md:text-lg">
                    {t("desc")}
                </p>

                <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
                    {highlights.map((item) => (
                        <li key={item} className="flex items-center gap-2 text-sm text-gray-300">
                            <Check size={16} className="text-cyber-green" strokeWidth={2.5} />
                            {item}
                        </li>
                    ))}
                </ul>

                <div className="mt-9 flex flex-wrap items-center gap-3">
                    <CallButton />
                    <WhatsAppButton />
                    <a
                        href="#websites"
                        className="inline-flex items-center gap-1.5 px-2 py-3 font-mono text-xs text-gray-500 transition-colors hover:text-cyber-green"
                    >
                        {t("seeWork")}
                        <ArrowDown size={13} />
                    </a>
                </div>
            </div>
        </section>
    );
}

export function ServicesSection() {
    const t = useTranslations("ProjectsPage");
    const lang = useLang();

    return (
        <section id="services" className="relative py-20 md:py-24">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyber-green/20 to-transparent" />
            <div className="mx-auto max-w-6xl px-6">
                <SectionHeading
                    eyebrow={t("servicesTag")}
                    title={
                        <>
                            {t("servicesTitle1")} <span className="text-gradient-cyber">{t("servicesTitle2")}</span>
                        </>
                    }
                    description={t("servicesDesc")}
                />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {webServices.map((service, index) => (
                        <motion.div
                            key={service.title.en}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-40px" }}
                            transition={{ duration: 0.4, delay: (index % 3) * 0.06 }}
                            className="glass-card group p-6 transition-colors duration-300 hover:border-cyber-green/30"
                        >
                            <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-cyber-green/20 bg-cyber-green/10 transition-colors group-hover:border-cyber-green/45">
                                <service.icon size={20} className="text-cyber-green" strokeWidth={1.6} />
                            </span>
                            <h3 className="font-display text-base font-semibold text-gray-100">
                                {service.title[lang]}
                            </h3>
                            <p className="mt-2 text-[13px] leading-6 text-gray-400">{service.description[lang]}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export function SectorsSection() {
    const t = useTranslations("ProjectsPage");
    const lang = useLang();

    return (
        <section id="sectors" className="relative py-20 md:py-24">
            <div className="mx-auto max-w-5xl px-6">
                <SectionHeading
                    eyebrow={t("sectorsTag")}
                    title={
                        <>
                            {t("sectorsTitle1")} <span className="text-gradient-cyber">{t("sectorsTitle2")}</span>
                        </>
                    }
                    description={t("sectorsDesc")}
                />
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {sectors.map((sector) => (
                        <div
                            key={sector.label.en}
                            className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3.5 transition-colors hover:border-cyber-green/30 hover:bg-cyber-green/[0.04]"
                        >
                            <sector.icon size={18} className="shrink-0 text-cyber-green/80" strokeWidth={1.6} />
                            <span className="text-sm text-gray-300">{sector.label[lang]}</span>
                        </div>
                    ))}
                </div>
                <p className="mt-6 text-center text-sm text-gray-500">{t("sectorsMore")}</p>
            </div>
        </section>
    );
}

export function ProcessSection() {
    const t = useTranslations("ProjectsPage");
    const lang = useLang();

    return (
        <section id="process" className="relative py-20 md:py-24">
            <div className="mx-auto max-w-5xl px-6">
                <SectionHeading
                    eyebrow={t("processTag")}
                    title={
                        <>
                            {t("processTitle1")} <span className="text-gradient-cyber">{t("processTitle2")}</span>
                        </>
                    }
                />
                <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {processSteps.map((step, index) => (
                        <li key={step.title.en} className="glass-card relative p-6">
                            <span className="font-mono text-3xl font-bold text-cyber-green/25">
                                {String(index + 1).padStart(2, "0")}
                            </span>
                            <h3 className="mt-2 font-display text-base font-semibold text-gray-100">
                                {step.title[lang]}
                            </h3>
                            <p className="mt-2 text-[13px] leading-6 text-gray-400">{step.description[lang]}</p>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
}

export function CallBand() {
    const t = useTranslations("ProjectsPage");

    return (
        <section className="relative py-16 md:py-20">
            <div className="mx-auto max-w-4xl px-6">
                <div className="relative overflow-hidden rounded-2xl border border-cyber-green/25 bg-gradient-to-br from-cyber-green/[0.12] via-dark-card to-dark-card px-5 py-8 text-center md:p-12">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyber-green/15 blur-3xl"
                    />
                    <h2 className="relative text-2xl font-bold text-gray-100 md:text-4xl">{t("ctaTitle")}</h2>
                    <p className="relative mx-auto mt-3 max-w-xl text-sm text-gray-400 md:text-base">{t("ctaDesc")}</p>
                    <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
                        <CallButton size="lg" />
                        <WhatsAppButton />
                    </div>
                </div>
            </div>
        </section>
    );
}

/** Phones only: a call button that stays in reach while scrolling. */
export function FloatingCallButton() {
    const t = useTranslations("ProjectsPage");
    return (
        <a
            href={telHref}
            onClick={() => analyticsAPI.track("contact_call", PHONE_DISPLAY)}
            aria-label={`${t("callNow")} ${PHONE_DISPLAY}`}
            className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-cyber-green text-dark-bg shadow-xl shadow-cyber-green/30 md:hidden"
        >
            <Phone size={22} strokeWidth={2.2} />
        </a>
    );
}
