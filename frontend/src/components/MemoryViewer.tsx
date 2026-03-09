"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, MapPin, Play, Pause } from "lucide-react";
import type { TravelPin, MediaItem } from "@/data/travelData";
import { useTranslations } from "next-intl";
import { analyticsAPI } from "@/lib/api";

interface MemoryViewerProps {
    pin: TravelPin;
    onClose: () => void;
}

const IMAGE_DURATION = 4.5; // seconds per image

export default function MemoryViewer({ pin, onClose }: MemoryViewerProps) {
    const t = useTranslations("MemoryViewer");
    const tCities = useTranslations("Cities");
    const tCountries = useTranslations("Countries");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [direction, setDirection] = useState(1);
    const [imageLoaded, setImageLoaded] = useState(false);
    // A key that increments on every navigation to force progress bar restart
    const [progressKey, setProgressKey] = useState(0);
    // Duration for the current item (images fixed, videos dynamic)
    const [currentDuration, setCurrentDuration] = useState(IMAGE_DURATION);
    const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    const media = pin.media;
    const current = media[currentIndex];

    // Analytics: View Photo
    useEffect(() => {
        analyticsAPI.track("view_photo", `${pin.label} (${currentIndex + 1}/${media.length})`);
    }, [currentIndex, pin.label, media.length]);

    // Lock body scroll
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, []);

    // Set duration for images
    useEffect(() => {
        if (current.type === "image") {
            setCurrentDuration(IMAGE_DURATION);
        }
    }, [currentIndex, current.type]);

    // Preload next images for smoother navigation (Buffer strategy)
    useEffect(() => {
        const PRELOAD_COUNT = 5; // How many future images to preload

        for (let i = 1; i <= PRELOAD_COUNT; i++) {
            const nextIndex = (currentIndex + i) % media.length;
            const item = media[nextIndex];

            if (item.type === "image") {
                const img = new Image();
                img.src = item.src;
            }
        }
    }, [currentIndex, media]);

    // Auto-play slideshow — only for images
    useEffect(() => {
        if (autoPlayRef.current) clearTimeout(autoPlayRef.current);
        if (isAutoPlaying && current.type === "image") {
            autoPlayRef.current = setTimeout(() => {
                goNext();
            }, IMAGE_DURATION * 1000);
        }
        return () => {
            if (autoPlayRef.current) clearTimeout(autoPlayRef.current);
        };
    }, [currentIndex, isAutoPlaying, current.type, progressKey]);

    const navigateTo = useCallback(
        (index: number, dir: number) => {
            setDirection(dir);
            setImageLoaded(false);
            setCurrentIndex(index);
            // Increment progressKey to force all bars to re-render instantly
            setProgressKey((k) => k + 1);
        },
        []
    );

    const goNext = useCallback(() => {
        navigateTo((currentIndex + 1) % media.length, 1);
    }, [currentIndex, media.length, navigateTo]);

    const goPrev = useCallback(() => {
        navigateTo((currentIndex - 1 + media.length) % media.length, -1);
    }, [currentIndex, media.length, navigateTo]);

    // Keyboard navigation
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowRight") goNext();
            if (e.key === "ArrowLeft") goPrev();
            if (e.key === " ") {
                e.preventDefault();
                setIsAutoPlaying((prev) => !prev);
            }
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [onClose, goNext, goPrev]);

    // Handle video metadata loaded — get real duration
    const handleVideoLoaded = useCallback(
        (e: React.SyntheticEvent<HTMLVideoElement>) => {
            const video = e.currentTarget;
            if (video.duration && isFinite(video.duration)) {
                setCurrentDuration(video.duration);
            }
        },
        []
    );

    // Handle video ended — go next
    const handleVideoEnded = useCallback(() => {
        goNext();
    }, [goNext]);

    // Slide animation variants
    const slideVariants = {
        enter: (dir: number) => ({
            x: dir > 0 ? "100%" : "-100%",
            opacity: 0,
            scale: 1.05,
        }),
        center: {
            x: 0,
            opacity: 1,
            scale: 1,
            transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] },
        },
        exit: (dir: number) => ({
            x: dir > 0 ? "-30%" : "30%",
            opacity: 0,
            scale: 0.95,
            transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
        }),
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[100] bg-black"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            {/* Full-screen media container */}
            <div className="absolute inset-0 overflow-hidden">
                <AnimatePresence initial={false} custom={direction} mode="popLayout">
                    <motion.div
                        key={currentIndex}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        className="absolute inset-0"
                    >
                        {current.type === "image" ? (
                            <>
                                {/* Blurred background fill */}
                                <div
                                    className="absolute inset-0 scale-110 blur-2xl opacity-40"
                                    style={{
                                        backgroundImage: `url(${current.src})`,
                                        backgroundSize: "cover",
                                        backgroundPosition: "center",
                                    }}
                                />
                                {/* Main image with Ken Burns effect */}
                                <motion.img
                                    src={current.src}
                                    alt={pin.label}
                                    className="absolute inset-0 w-full h-full object-contain z-[1]"
                                    onLoad={() => setImageLoaded(true)}
                                    initial={{ scale: 1 }}
                                    animate={
                                        imageLoaded
                                            ? { scale: 1.04, transition: { duration: 8, ease: "linear" } }
                                            : {}
                                    }
                                />
                            </>
                        ) : (
                            <video
                                ref={videoRef}
                                src={current.src}
                                className="absolute inset-0 w-full h-full object-contain z-[1]"
                                autoPlay
                                playsInline
                                controls={false}
                                onLoadedMetadata={handleVideoLoaded}
                                onEnded={handleVideoEnded}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Dark gradient overlays for UI readability */}
            <div className="absolute inset-0 z-[2] pointer-events-none">
                <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 h-56 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
            </div>

            {/* Top bar — location info + close */}
            <div className="absolute top-0 left-0 right-0 z-[10] p-6 md:p-8">
                <div className="flex items-start justify-between max-w-6xl mx-auto">
                    {/* Location */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <MapPin size={16} style={{ color: pin.color }} />
                            <span
                                lang="en"
                                className="font-mono text-sm tracking-wider uppercase"
                                style={{ color: pin.color }}
                            >
                                {tCountries(pin.country)}
                            </span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-white">
                            {tCities(pin.label)}
                        </h2>

                    </motion.div>

                    {/* Close button */}
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        onClick={onClose}
                        className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all group shrink-0"
                    >
                        <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                    </motion.button>
                </div>
            </div>

            {/* Side navigation arrows */}
            {media.length > 1 && (
                <>
                    <button
                        onClick={goPrev}
                        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-[10] w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/15 transition-all"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                        onClick={goNext}
                        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-[10] w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/15 transition-all"
                    >
                        <ChevronRight size={24} />
                    </button>
                </>
            )}

            {/* Bottom bar — progress + controls (no caption) */}
            <div className="absolute bottom-0 left-0 right-0 z-[10] p-6 md:p-8">
                <div className="max-w-4xl mx-auto">
                    {/* Progress bars — Instagram-style */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex-1 flex gap-1.5">
                            {media.map((item, i) => {
                                // Past items: filled. Future items: empty.
                                // Current item: animates from 0% to 100% over the duration.
                                const isPast = i < currentIndex;
                                const isCurrent = i === currentIndex;
                                const isFuture = i > currentIndex;

                                return (
                                    <button
                                        key={i}
                                        onClick={() => {
                                            navigateTo(i, i > currentIndex ? 1 : -1);
                                        }}
                                        className="flex-1 h-[3px] rounded-full overflow-hidden bg-white/20 cursor-pointer"
                                    >
                                        <motion.div
                                            key={`${progressKey}-${i}`}
                                            className="h-full rounded-full"
                                            style={{ backgroundColor: pin.color }}
                                            initial={{
                                                width: isPast ? "100%" : "0%",
                                            }}
                                            animate={{
                                                width:
                                                    isPast
                                                        ? "100%"
                                                        : isCurrent && isAutoPlaying
                                                            ? "100%"
                                                            : isCurrent && !isAutoPlaying
                                                                ? undefined // freeze where it is
                                                                : "0%",
                                            }}
                                            transition={
                                                isCurrent && isAutoPlaying
                                                    ? {
                                                        duration: currentDuration,
                                                        ease: "linear",
                                                    }
                                                    : { duration: 0 }
                                            }
                                        />
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Controls row */}
                    <div className="flex items-center justify-between">
                        {/* Counter */}
                        <span className="font-mono text-sm text-white/50">
                            {String(currentIndex + 1).padStart(2, "0")} / {String(media.length).padStart(2, "0")}
                        </span>

                        {/* Play/Pause */}
                        <button
                            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm font-mono"
                        >
                            {isAutoPlaying ? (
                                <>
                                    <Pause size={14} /> {t("pause")}
                                </>
                            ) : (
                                <>
                                    <Play size={14} /> {t("play")}
                                </>
                            )}
                        </button>

                        {/* Coords */}
                        <span className="font-mono text-sm text-white/30">
                            [{pin.lat.toFixed(2)}, {pin.lng.toFixed(2)}]
                        </span>
                    </div>
                </div>
            </div>

            {/* Touch swipe areas (invisible, for mobile UX) */}
            <div
                className="absolute left-0 top-0 bottom-0 w-1/4 z-[5] cursor-w-resize"
                onClick={goPrev}
            />
            <div
                className="absolute right-0 top-0 bottom-0 w-1/4 z-[5] cursor-e-resize"
                onClick={goNext}
            />
        </motion.div>
    );
}
