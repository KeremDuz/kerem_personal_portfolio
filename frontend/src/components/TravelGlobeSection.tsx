"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import staticTravelData from "@/data/travelData";
import type { TravelPin } from "@/data/travelData";
import MemoryViewer from "./MemoryViewer";
import { useTranslations } from "next-intl";
import { travelAPI } from "@/lib/api";

// Dynamic import with no SSR for the 3D globe
const TravelGlobe = dynamic(() => import("./TravelGlobe"), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center h-[500px]">
            <div className="font-mono text-cyber-green/50 text-sm animate-pulse">
                {">"} Initializing 3D engine...
            </div>
        </div>
    ),
});

export default function TravelGlobeSection() {
    const t = useTranslations("Travel");
    const tCities = useTranslations("Cities");
    const [selectedPin, setSelectedPin] = useState<TravelPin | null>(null);
    const [shouldLoadGlobe, setShouldLoadGlobe] = useState(false);
    const [travelData, setTravelData] = useState<TravelPin[]>(staticTravelData);

    // Fetch travel data from API, fallback to static data
    useEffect(() => {
        travelAPI.getAll()
            .then((data) => {
                if (data && data.length > 0) {
                    setTravelData(data as TravelPin[]);
                }
            })
            .catch(() => {
                // Silently fallback to static data
            });
    }, []);

    // Background aggressive prefetch of all photos ONLY AFTER the globe starts loading
    // This satisfies the requirement: preload after initial page load is done, using full bandwidth.
    useEffect(() => {
        if (!shouldLoadGlobe) return;

        // Wait 3 seconds so we don't block the spinning globe initialization
        const timer = setTimeout(() => {
            const allMediaSrcs: string[] = [];
            travelData.forEach(pin => {
                pin.media?.forEach(item => {
                    if (item.type === "image") {
                        allMediaSrcs.push(item.src);
                    }
                });
            });

            // Native browser cache fetching (very fast for WebP without Next.js optimization overhead)
            allMediaSrcs.forEach(src => {
                const img = new Image();
                img.src = src;
            });
        }, 3000);

        return () => clearTimeout(timer);
    }, [shouldLoadGlobe, travelData]);

    return (
        <section
            id="travel"
            className="relative py-24 md:py-32 overflow-hidden"
        >
            {/* Section divider */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-travel-amber/20 to-transparent" />

            <div className="max-w-7xl mx-auto px-6">
                {/* Section Title */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    onViewportEnter={() => setShouldLoadGlobe(true)}
                    className="mb-12 text-center"
                >
                    <span lang="en" className="font-mono text-sm text-travel-amber/60 tracking-wider uppercase block mb-3">
                        {t("tag")}
                    </span>
                    <h2 className="section-title">
                        <span className="text-gray-100">{t("title1")}</span>
                        <span className="text-travel-amber">{t("title2")}</span>
                        <span className="text-gray-100">{t("title3")}</span>
                        <span className="text-gradient-travel">{t("title4")}</span>
                        <span className="text-gray-100">{t("title5")}</span>
                    </h2>
                    <p className="text-gray-400 mt-4 max-w-xl mx-auto">
                        {t("desc")}
                    </p>
                </motion.div>

                {/* Globe - Conditionally rendered */}
                <div className="relative min-h-[500px]">
                    {shouldLoadGlobe && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                        >
                            <TravelGlobe data={travelData} />
                        </motion.div>
                    )}
                </div>

                {/* Legend — clickable */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mt-10 flex flex-wrap justify-center gap-4"
                >
                    {travelData.map((pin, index) => (
                        <button
                            key={`${pin.label}-${index}`}
                            onClick={() => setSelectedPin(pin)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-surface/50 border border-gray-800/50 hover:border-gray-600 hover:bg-dark-surface transition-all duration-200 cursor-pointer group"
                        >
                            <div
                                className="w-2.5 h-2.5 rounded-full group-hover:scale-125 transition-transform"
                                style={{ backgroundColor: pin.color }}
                            />
                            <span className="font-mono text-xs text-gray-400 group-hover:text-gray-200 transition-colors">
                                {tCities(pin.label)}
                            </span>
                        </button>
                    ))}
                </motion.div>
            </div>

            {/* Immersive Memory Viewer from legend click */}
            <AnimatePresence>
                {selectedPin && (
                    <MemoryViewer
                        pin={selectedPin}
                        onClose={() => setSelectedPin(null)}
                    />
                )}
            </AnimatePresence>
        </section>
    );
}
