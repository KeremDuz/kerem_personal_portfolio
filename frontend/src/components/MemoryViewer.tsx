"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { TravelPin } from "@/data/travelData";
import { analyticsAPI } from "@/lib/api";

interface MemoryViewerProps {
    pin: TravelPin;
    onClose: () => void;
}

const IMAGE_DURATION = 4.5; // seconds per image

export default function MemoryViewer({ pin, onClose }: MemoryViewerProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [direction, setDirection] = useState(1);
    const [imageLoaded, setImageLoaded] = useState(false);
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

    const getAdaptivePreloadCount = useCallback(() => {
        if (typeof navigator === "undefined") return 2;

        const connection = (navigator as any).connection;
        const isSaveData = Boolean(connection?.saveData);
        const effectiveType = connection?.effectiveType as string | undefined;
        const isSlowNetwork = effectiveType === "slow-2g" || effectiveType === "2g";

        if (isSaveData || isSlowNetwork) return 1;
        return 3;
    }, []);

    // Preload next images for smoother navigation (adaptive + idle strategy)
    useEffect(() => {
        const preloadCount = getAdaptivePreloadCount();

        const preloadTask = () => {
            for (let i = 1; i <= preloadCount; i++) {
                const nextIndex = (currentIndex + i) % media.length;
                const item = media[nextIndex];

                if (item.type === "image") {
                    const img = new Image();
                    img.src = item.src;
                }
            }
        };

        if (typeof window !== "undefined" && "requestIdleCallback" in window) {
            const idleId = (window as any).requestIdleCallback(preloadTask);
            return () => {
                if ("cancelIdleCallback" in window) {
                    (window as any).cancelIdleCallback(idleId);
                }
            };
        }

        const timeoutId = setTimeout(preloadTask, 120);
        return () => clearTimeout(timeoutId);
    }, [currentIndex, media, getAdaptivePreloadCount]);

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
    }, [currentIndex, isAutoPlaying, current.type]);

    const navigateTo = useCallback(
        (index: number, dir: number) => {
            setDirection(dir);
            setImageLoaded(false);
            setCurrentIndex(index);
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
            className="fixed inset-0 z-[2000] bg-black"
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
                                    loading="eager"
                                    decoding="async"
                                    fetchPriority="high"
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
                                onEnded={handleVideoEnded}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Close button */}
            <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                onClick={onClose}
                aria-label="Fotoğrafı kapat"
                className="fixed top-4 right-4 md:top-6 md:right-6 w-14 h-14 rounded-full bg-black/70 backdrop-blur-xl border border-white/25 flex items-center justify-center text-white hover:bg-black/80 transition-all group z-[2001] shadow-2xl shadow-black/50"
            >
                <X size={22} strokeWidth={2.5} className="group-hover:rotate-90 transition-transform duration-300" />
            </motion.button>

            {/* Side navigation arrows */}
            {media.length > 1 && (
                <>
                    <button
                        onClick={goPrev}
                        className="fixed left-4 md:left-8 top-1/2 -translate-y-1/2 z-[2001] w-12 h-12 md:w-14 md:h-14 rounded-full bg-black/65 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/80 hover:text-white hover:bg-black/80 transition-all"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                        onClick={goNext}
                        className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 z-[2001] w-12 h-12 md:w-14 md:h-14 rounded-full bg-black/65 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/80 hover:text-white hover:bg-black/80 transition-all"
                    >
                        <ChevronRight size={24} />
                    </button>
                </>
            )}

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
