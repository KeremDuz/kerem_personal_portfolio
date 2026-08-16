"use client";

import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";

interface GalleryPhoto {
    src: string;
    caption: string;
    location: string;
    aspect: "portrait" | "landscape" | "square";
}

import Image, { getImageProps } from "next/image";
import travelData from "@/data/travelData";
import SectionHeading from "./SectionHeading";

/** More, smaller tiles keep the gallery varied without turning it into a long
 * stack. The pool favors original camera files over compressed chat exports. */
const TILE_COUNT = 20;
const COMPRESSED_EXPORT_PATTERN = /-WA\d+/i;
const EXCLUDED_GALLERY_PHOTOS = new Set([
    "/travel/baku/IMG_20251123_172247.webp",
]);

function stablePhotoScore(src: string): number {
    let hash = 2166136261;
    for (let index = 0; index < src.length; index++) {
        hash ^= src.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
}

function getQualityPhotoGroups(): GalleryPhoto[][] {
    return travelData.flatMap((pin) => {
        const images = pin.media.filter(
            (item) => item.type === "image" && !EXCLUDED_GALLERY_PHOTOS.has(item.src)
        );
        if (images.length === 0) return [];

        const originalCameraFiles = images.filter(
            (item) => !COMPRESSED_EXPORT_PATTERN.test(item.src)
        );
        const representative = images.find((item) => item.src === pin.image) ?? images[0];
        const qualityCandidates = [...originalCameraFiles, representative].filter(
            (item, index, items) => items.findIndex((candidate) => candidate.src === item.src) === index
        );

        return [qualityCandidates.map((item) => ({
            src: item.src,
            caption: item.caption || pin.description,
            location: pin.label,
            aspect: "landscape" as const,
        }))];
    });
}

function getStableGalleryPhotos(): GalleryPhoto[] {
    return getQualityPhotoGroups()
        .flat()
        .sort((left, right) => stablePhotoScore(left.src) - stablePhotoScore(right.src))
        .slice(0, TILE_COUNT);
}

function shufflePhotos<T>(items: T[]): T[] {
    const shuffled = [...items];
    for (let index = shuffled.length - 1; index > 0; index--) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
    }
    return shuffled;
}

function selectRandomGalleryPhotos(): GalleryPhoto[] {
    const groups = getQualityPhotoGroups();
    const representativeSelection = shufflePhotos(groups)
        .map((group) => shufflePhotos(group)[0])
        .filter(Boolean);
    const representativeSources = new Set(representativeSelection.map((photo) => photo.src));
    const remaining = shufflePhotos(
        groups.flat().filter((photo) => !representativeSources.has(photo.src))
    );

    return shufflePhotos([...representativeSelection, ...remaining].slice(0, TILE_COUNT));
}

export default function PhotoGallery() {
    const t = useTranslations("Gallery");
    const tCities = useTranslations("Cities");
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>(getStableGalleryPhotos);

    // Start with deterministic HTML for hydration, then choose a fresh,
    // city-balanced order on every full page load.
    useEffect(() => {
        setGalleryPhotos(selectRandomGalleryPhotos());
    }, []);

    const openLightbox = (index: number) => setLightboxIndex(index);
    const closeLightbox = () => setLightboxIndex(null);

    // Lock body scroll when lightbox is open
    useEffect(() => {
        if (lightboxIndex !== null) {
            document.body.style.overflow = "hidden";
            document.body.classList.add("media-viewer-open");
        } else {
            document.body.style.overflow = "";
            document.body.classList.remove("media-viewer-open");
        }
        return () => {
            document.body.style.overflow = "";
            document.body.classList.remove("media-viewer-open");
        };
    }, [lightboxIndex]);

    const getAdaptivePreloadCount = useCallback(() => {
        if (typeof navigator === "undefined") return 2;

        const connection = (navigator as any).connection;
        const isSaveData = Boolean(connection?.saveData);
        const effectiveType = connection?.effectiveType as string | undefined;
        const isSlowNetwork = effectiveType === "slow-2g" || effectiveType === "2g";

        if (isSaveData || isSlowNetwork) return 1;
        return 2;
    }, []);

    const goNext = useCallback(() => {
        setLightboxIndex((prev) => (prev !== null ? (prev + 1) % galleryPhotos.length : 0));
    }, [galleryPhotos.length]);

    const goPrev = useCallback(() => {
        setLightboxIndex((prev) =>
            prev !== null ? (prev - 1 + galleryPhotos.length) % galleryPhotos.length : 0
        );
    }, [galleryPhotos.length]);

    useEffect(() => {
        if (lightboxIndex === null || galleryPhotos.length === 0) return;

        const preloadCount = getAdaptivePreloadCount();
        const preloadIndexes = new Set<number>([lightboxIndex]);

        for (let i = 1; i <= preloadCount; i++) {
            preloadIndexes.add((lightboxIndex + i) % galleryPhotos.length);
        }

        preloadIndexes.forEach((index) => {
            const src = galleryPhotos[index]?.src;
            if (!src) return;

            const { props } = getImageProps({
                src,
                alt: "",
                fill: true,
                sizes: "100vw",
                quality: 92,
            });
            const img = new window.Image();
            img.src = props.src;
            img.srcset = props.srcSet ?? "";
            img.sizes = props.sizes ?? "100vw";
        });
    }, [lightboxIndex, galleryPhotos, getAdaptivePreloadCount]);

    // Keyboard navigation
    useEffect(() => {
        if (lightboxIndex === null) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeLightbox();
            if (e.key === "ArrowRight") goNext();
            if (e.key === "ArrowLeft") goPrev();
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [lightboxIndex, goNext, goPrev]);

    return (
        <section id="gallery" className="relative py-24 md:py-32">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-travel-amber/15 to-transparent" />

            {/* Wider than the text sections so the tiles get more room on a
                large screen; the heading stays on the normal measure. */}
            <div className="mx-auto max-w-7xl px-6">
                <div className="mx-auto max-w-6xl">
                    <SectionHeading
                        eyebrow={t("tag")}
                        title={
                            <>
                                {t("title1")} <span className="text-gradient-travel">{t("title2")}</span>
                            </>
                        }
                        description={t("desc")}
                    />
                </div>

                {/* Four columns on phones and five on larger screens fit twenty
                    sharp, varied photos into five/four compact rows. */}
                <div className="grid grid-cols-4 gap-2 sm:gap-3 md:grid-cols-5 lg:gap-4">
                    {galleryPhotos.map((photo, index) => (
                        <button
                            type="button"
                            key={photo.src}
                            className="group relative aspect-square overflow-hidden rounded-lg bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-travel-amber"
                            onClick={() => openLightbox(index)}
                            aria-label={`${photo.location} — ${photo.caption}`}
                        >
                            {/* A real alt, not an empty one: these are the only
                                photos on the site that image search can index,
                                and the city plus year is what makes them
                                findable. */}
                            <Image
                                src={photo.src}
                                alt={`${tCities(photo.location)} — ${photo.caption} · Kerem Düz`}
                                fill
                                quality={92}
                                sizes="(min-width: 1280px) 236px, (min-width: 768px) calc(20vw - 20px), calc(25vw - 12px)"
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                <div className="absolute inset-x-0 bottom-0 p-2">
                                    <span className="flex items-center gap-1 font-mono text-[10px] text-travel-amber">
                                        <MapPin size={10} />
                                        <span className="truncate">{tCities(photo.location)}</span>
                                    </span>
                                </div>
                            </div>

                            <div className="pointer-events-none absolute inset-0 rounded-lg border border-transparent transition-colors duration-300 group-hover:border-travel-amber/40" />
                        </button>
                    ))}
                </div>
            </div>

            {/* Lightbox rendered via Portal */}
            {typeof document !== "undefined" && createPortal(
                <AnimatePresence>
                    {lightboxIndex !== null && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 isolate w-screen h-[100dvh] z-[2147483000] bg-black"
                            onClick={closeLightbox}
                        >
                            {/* Image */}
                            <motion.div
                                key={lightboxIndex}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className="absolute inset-0"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Image
                                    src={galleryPhotos[lightboxIndex].src}
                                    alt={galleryPhotos[lightboxIndex].caption}
                                    fill
                                    preload
                                    quality={92}
                                    sizes="100vw"
                                    className="object-contain"
                                />
                            </motion.div>

                            {/* Close button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    closeLightbox();
                                }}
                                aria-label="Fotoğrafı kapat"
                                className="absolute top-4 right-4 md:top-6 md:right-6 w-14 h-14 rounded-full bg-black/70 backdrop-blur-xl border border-white/25 flex items-center justify-center text-white z-[10000] shadow-2xl shadow-black/50 hover:bg-black/80 hover:scale-105 transition-all"
                            >
                                <X size={22} strokeWidth={2.5} />
                            </button>

                            {/* Counter */}
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-black/65 border border-white/20 backdrop-blur-md text-white border-white/10 text-sm font-mono tracking-widest z-[10000] pointer-events-none">
                                {lightboxIndex + 1} / {galleryPhotos.length}
                            </div>

                            {/* Navigation */}
                            <button
                                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                                className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 rounded-full bg-black/65 border border-white/20 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-white hover:bg-black/80 z-[10000] transition-all"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); goNext(); }}
                                className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 rounded-full bg-black/65 border border-white/20 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-white hover:bg-black/80 z-[10000] transition-all"
                            >
                                <ChevronRight size={24} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </section>
    );
}
