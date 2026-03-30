"use client";

import { motion } from "framer-motion";
import { Terminal, MapPin, Shield, Coffee } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { aboutAPI } from "@/lib/api";

export default function About() {
    const t = useTranslations("About");
    const [aboutData, setAboutData] = useState<any>(null);

    useEffect(() => {
        aboutAPI.get()
            .then(data => {
                if (data && data.terminal_title) {
                    setAboutData(data);
                }
            })
            .catch(() => {});
    }, []);

    const values = {
        terminal_title: aboutData?.terminal_title || t("terminal_title"),
        p1_1: aboutData?.p1_1 || t("p1_1"),
        p1_2: aboutData?.p1_2 || t("p1_2"),
        p1_3: aboutData?.p1_3 || t("p1_3"),
        p2: aboutData?.p2 || t("p2"),
        p3: aboutData?.p3 || t("p3"),
        focusLabel: aboutData?.focusLabel || t("focusLabel"),
        focusValue: aboutData?.focusValue || t("focusValue"),
        expertiseLabel: aboutData?.expertiseLabel || t("expertiseLabel"),
        expertiseValue: aboutData?.expertiseValue || "Network Security, Pentest",
        locationLabel: aboutData?.locationLabel || t("locationLabel"),
        locationValue: aboutData?.locationValue || t("locationValue"),
        fuelLabel: aboutData?.fuelLabel || t("fuelLabel"),
        fuelValue: aboutData?.fuelValue || t("fuelValue"),
    };
    return (
        <section id="about" className="relative py-24 md:py-32">
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
                    <h2 className="section-title text-gray-100">{t("title")}</h2>
                </motion.div>

                <div className="grid md:grid-cols-5 gap-8 items-start">
                    {/* Left — Terminal-style bio */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="md:col-span-3 glass-card p-6 md:p-8"
                    >
                        {/* Terminal header */}
                        <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-800">
                            <div className="w-3 h-3 rounded-full bg-red-500/70" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                            <div className="w-3 h-3 rounded-full bg-green-500/70" />
                            <span className="ml-3 font-mono text-xs text-gray-600">
                                {values.terminal_title}
                            </span>
                        </div>

                        <div className="space-y-4 font-mono text-sm leading-relaxed">
                            <p className="text-gray-300">
                                <span className="text-cyber-green">{">"}</span> {values.p1_1}
                                <span className="text-cyber-green font-semibold">{values.p1_2}</span>{values.p1_3}
                            </p>
                            <p className="text-gray-400">
                                <span className="text-cyber-green">{">"}</span> {values.p2}
                            </p>
                            <p className="text-gray-400">
                                <span className="text-cyber-green">{">"}</span> {values.p3}
                            </p>
                            <p className="text-gray-500 mt-4">
                                <span className="text-cyber-green animate-blink">█</span>
                            </p>
                        </div>
                    </motion.div>

                    {/* Right — Quick facts */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="md:col-span-2 space-y-4"
                    >
                        {[
                            {
                                icon: Terminal,
                                label: values.focusLabel,
                                value: values.focusValue,
                                color: "#00ff41",
                            },
                            {
                                icon: Shield,
                                label: values.expertiseLabel,
                                value: values.expertiseValue,
                                color: "#00f3ff",
                            },
                            {
                                icon: MapPin,
                                label: values.locationLabel,
                                value: values.locationValue,
                                color: "#f59e0b",
                            },
                            {
                                icon: Coffee,
                                label: values.fuelLabel,
                                value: values.fuelValue,
                                color: "#f97316",
                            },
                        ].map((item, i) => (
                            <motion.div
                                key={item.label}
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                                className="glass-card p-4 flex items-center gap-4 group"
                            >
                                <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                                    style={{
                                        backgroundColor: `${item.color}15`,
                                        border: `1px solid ${item.color}25`,
                                    }}
                                >
                                    <item.icon
                                        size={18}
                                        style={{ color: item.color }}
                                        strokeWidth={1.5}
                                    />
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs font-mono uppercase tracking-wider">
                                        {item.label}
                                    </p>
                                    <p className="text-gray-200 text-sm font-medium">
                                        {item.value}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section >
    );
}
