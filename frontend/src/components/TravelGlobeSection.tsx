"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import staticTravelData, { mergeStaticTravelPins } from "@/data/travelData";
import type { TravelPin } from "@/data/travelData";
import MemoryViewer from "./MemoryViewer";
import { useTranslations } from "next-intl";
import { travelAPI, analyticsAPI } from "@/lib/api";
import SectionHeading from "./SectionHeading";
import { thumbnailFor } from "@/lib/media";

const TravelGlobe = dynamic(() => import("./TravelGlobe"), {
    ssr: false,
    loading: () => <div className="h-[500px]" aria-hidden="true" />,
});

type TravelGlobeSectionProps = { initialTravels?: TravelPin[] };

export default function TravelGlobeSection({ initialTravels = [] }: TravelGlobeSectionProps) {
    const t = useTranslations("Travel");
    const tCities = useTranslations("Cities");
    const [selectedPin, setSelectedPin] = useState<TravelPin | null>(null);
    const [shouldLoadGlobe, setShouldLoadGlobe] = useState(false);
    const [travelData, setTravelData] = useState<TravelPin[]>(
        initialTravels.length > 0
            ? mergeStaticTravelPins(initialTravels)
            : staticTravelData
    );

    // Fetch travel data from API, fallback to static data
    useEffect(() => {
        if (initialTravels.length > 0) return;

        travelAPI.getAll()
            .then((data) => {
                if (data && data.length > 0) {
                    setTravelData(mergeStaticTravelPins(data as TravelPin[]));
                }
            })
            .catch(() => {
                // Silently fallback to static data
            });
    }, [initialTravels.length]);

    // Adaptive prefetch: preload only a limited number of likely-needed images
    // to avoid saturating bandwidth during first render.
    useEffect(() => {
        if (!shouldLoadGlobe) return;

        const prefetchPhotos = () => {
            const connection = (navigator as any).connection;
            const isSaveData = Boolean(connection?.saveData);
            const effectiveType = connection?.effectiveType as string | undefined;
            const isSlowNetwork = effectiveType === "slow-2g" || effectiveType === "2g";

            const maxPrefetch = isSaveData || isSlowNetwork ? 3 : 10;

            const prioritizedSrcs: string[] = [];
            for (const pin of travelData) {
                const firstImage = pin.media?.find((item) => item.type === "image");
                if (firstImage?.src) {
                    // Thumbnails, not originals. Prefetching ten full-size
                    // photos here was pulling ~15 MB across the wire in
                    // parallel with the globe's own textures and bundle, which
                    // is a large part of why the globe felt slow to appear.
                    prioritizedSrcs.push(thumbnailFor(firstImage.src));
                }
                if (prioritizedSrcs.length >= maxPrefetch) {
                    break;
                }
            }

            prioritizedSrcs.forEach((src) => {
                const img = new Image();
                img.src = src;
            });
        };

        if ('requestIdleCallback' in window) {
            (window as any).requestIdleCallback(prefetchPhotos);
        } else {
            // Fallback for older browsers
            setTimeout(prefetchPhotos, 500);
        }
    }, [shouldLoadGlobe, travelData]);

    return (
        <section
            id="travel"
            className="relative py-24 md:py-32 overflow-hidden"
        >
            {/* Section divider */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-travel-amber/20 to-transparent" />

            <div className="max-w-7xl mx-auto px-6">
                {/* Entering this element is what triggers the 3D bundle to load.
                    The trigger sits ~900px early on purpose: three.js plus the
                    globe wrapper is a big chunk, and starting it only once the
                    section is on screen means staring at a loading line. */}
                <motion.div
                    viewport={{ once: true, margin: "900px 0px" }}
                    onViewportEnter={() => setShouldLoadGlobe(true)}
                >
                    <SectionHeading
                        eyebrow={t("tag")}
                        title={
                            // `World.execute(Travel_Memories)` is one long
                            // unbreakable mono string, so it needs to scale with
                            // the viewport rather than take the heading sizes.
                            <span className="block font-mono leading-tight text-[clamp(1rem,4.4vw,2.5rem)]">
                                {t("title1")}
                                <span className="text-travel-amber">{t("title2")}</span>
                                {t("title3")}
                                <span className="text-gradient-travel">{t("title4")}</span>
                                {t("title5")}
                            </span>
                        }
                        description={t("desc")}
                    />
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

                    {!shouldLoadGlobe && (
                        <div className="flex items-center justify-center h-[500px]">
                            <div className="font-mono text-cyber-green/50 text-sm animate-pulse">
                                {">"} Initializing 3D engine...
                            </div>
                        </div>
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
                            onClick={() => {
                                analyticsAPI.track("click_city", pin.label);
                                setSelectedPin(pin);
                            }}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-surface/50 border hover:border-gray-600 hover:bg-dark-surface transition-all duration-200 cursor-pointer group ${pin.status === "upcoming" ? "border-dashed border-gray-700/70" : "border-gray-800/50"}`}
                        >
                            <div
                                className="w-2.5 h-2.5 rounded-full group-hover:scale-125 transition-transform"
                                style={{ backgroundColor: pin.color }}
                            />
                            <span className="font-mono text-xs text-gray-400 group-hover:text-gray-200 transition-colors">
                                {pin._id ? pin.label : tCities(pin.label)}
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
