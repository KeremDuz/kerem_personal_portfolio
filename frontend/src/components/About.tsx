"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { aboutAPI, type AboutData } from "@/lib/api";
import SectionHeading from "./SectionHeading";
import ContributionGraph from "./ContributionGraph";

type AboutProps = { initialAbout?: AboutData | null };

export default function About({ initialAbout = null }: AboutProps) {
    const t = useTranslations("About");
    const [aboutData, setAboutData] = useState<AboutData | null>(initialAbout);

    useEffect(() => {
        if (initialAbout) return;

        aboutAPI
            .get()
            .then((data) => {
                if (data && data.terminal_title) setAboutData(data);
            })
            .catch(() => { });
    }, [initialAbout]);

    // The focus / expertise / location / fuel fields still exist in the admin
    // panel and the API; they are simply no longer shown here.
    const values = {
        p1_1: aboutData?.p1_1 || t("p1_1"),
        p1_2: aboutData?.p1_2 || t("p1_2"),
        p1_3: aboutData?.p1_3 || t("p1_3"),
        p2: aboutData?.p2 || t("p2"),
        p3: aboutData?.p3 || t("p3"),
    };

    return (
        <section id="about" className="relative py-24 md:py-32">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyber-green/15 to-transparent" />

            {/* Narrower than the other sections on purpose: a comfortable
                reading measure is what makes a wall of prose feel calm. */}
            <div className="mx-auto max-w-3xl px-6">
                <SectionHeading eyebrow={t("tag")} title={t("title")} />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="glass-card relative overflow-hidden p-8 md:p-12"
                >
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -left-20 -top-24 h-72 w-72 rounded-full bg-cyber-green/[0.07] blur-[80px]"
                    />

                    <div className="relative">
                        {/* Lead line, set large with a quiet rule beside it so
                            the eye has an obvious place to start. */}
                        <div className="border-l-2 border-cyber-green/40 pl-5 md:pl-6">
                            <p className="text-xl leading-[1.5] text-gray-100 md:text-[26px] md:leading-[1.45]">
                                {values.p1_1}
                                <span className="font-semibold text-gradient-cyber">{values.p1_2}</span>
                                {values.p1_3}
                            </p>
                        </div>

                        <div className="mt-8 space-y-5 text-[15px] leading-[1.75] text-gray-400 md:text-base">
                            <p>{values.p2}</p>
                            <p>{values.p3}</p>
                        </div>

                    </div>
                </motion.div>

                {/* Real activity, pulled live from GitHub — the one piece of
                    evidence here that keeps updating itself. */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                    className="mt-4"
                >
                    <ContributionGraph />
                </motion.div>
            </div>
        </section>
    );
}
