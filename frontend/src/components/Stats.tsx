"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Globe, Code, Shield, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";

const stats = [
    {
        icon: Globe,
        value: 5,
        suffix: "+",
        label: "Ülke Gezildi",
        color: "#f59e0b",
    },
    {
        icon: Code,
        value: 20,
        suffix: "+",
        label: "Proje Tamamlandı",
        color: "#00ff41",
    },
    {
        icon: Shield,
        value: 15,
        suffix: "+",
        label: "Güvenlik Analizi",
        color: "#00f3ff",
    },
    {
        icon: MapPin,
        value: 30,
        suffix: "+",
        label: "Anı Biriktirdi",
        color: "#f97316",
    },
];

function AnimatedCounter({
    target,
    suffix,
    inView,
}: {
    target: number;
    suffix: string;
    inView: boolean;
}) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!inView) return;
        let start = 0;
        const duration = 2000;
        const increment = target / (duration / 16);
        const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
                setCount(target);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 16);
        return () => clearInterval(timer);
    }, [inView, target]);

    return (
        <span>
            {count}
            {suffix}
        </span>
    );
}

export default function Stats() {
    const t = useTranslations("Stats");
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    const localizedStats = stats.map((stat, i) => {
        const keyMap = ["countries", "projects", "security", "memories"];
        return {
            ...stat,
            label: t(keyMap[i])
        };
    });

    return (
        <section className="relative py-20">
            {/* Divider */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyber-green/15 to-transparent" />

            <div ref={ref} className="max-w-5xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <span lang="en" className="font-mono text-sm text-cyber-green/50 tracking-wider uppercase block mb-3">
                        {t("tag")}
                    </span>
                </motion.div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {localizedStats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="glass-card p-6 text-center group hover:scale-105 transition-transform duration-300"
                        >
                            {/* Icon */}
                            <div
                                className="w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center transition-all duration-300"
                                style={{
                                    backgroundColor: `${stat.color}15`,
                                    border: `1px solid ${stat.color}30`,
                                }}
                            >
                                <stat.icon
                                    size={22}
                                    style={{ color: stat.color }}
                                    strokeWidth={1.5}
                                />
                            </div>

                            {/* Number */}
                            <div
                                className="text-3xl md:text-4xl font-bold font-mono mb-2"
                                style={{ color: stat.color }}
                            >
                                <AnimatedCounter
                                    target={stat.value}
                                    suffix={stat.suffix}
                                    inView={isInView}
                                />
                            </div>

                            {/* Label */}
                            <p className="text-gray-400 text-sm font-mono">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
