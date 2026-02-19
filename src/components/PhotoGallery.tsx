"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, MapPin } from "lucide-react";

interface GalleryPhoto {
    src: string;
    caption: string;
    location: string;
    aspect: "portrait" | "landscape" | "square";
}

import Image from "next/image";
import travelData from "@/data/travelData";

export default function PhotoGallery() {
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>([]);

    // Load random photos on mount
    useEffect(() => {
        const allPhotos: GalleryPhoto[] = [];

        travelData.forEach((pin) => {
            pin.media.forEach((item) => {
                if (item.type === "image") {
                    allPhotos.push({
                        src: item.src,
                        caption: pin.description, // Use pin description as fallback or generic caption
                        location: pin.label,
                        aspect: "landscape", // Defaulting to landscape as we don't know dimensions
                    });
                }
            });
        });

        // Shuffle
        const shuffled = allPhotos.sort(() => 0.5 - Math.random());
        // Take top 9
        setGalleryPhotos(shuffled.slice(0, 9));
    }, []);

    const openLightbox = (index: number) => setLightboxIndex(index);
    const closeLightbox = () => setLightboxIndex(null);

    const goNext = useCallback(() => {
        setLightboxIndex((prev) => (prev !== null ? (prev + 1) % galleryPhotos.length : 0));
    }, [galleryPhotos.length]);

    const goPrev = useCallback(() => {
        setLightboxIndex((prev) =>
            prev !== null ? (prev - 1 + galleryPhotos.length) % galleryPhotos.length : 0
        );
    }, [galleryPhotos.length]);

    return (
        <section id="gallery" className="relative py-24 md:py-32">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-travel-amber/15 to-transparent" />

            <div className="max-w-6xl mx-auto px-6">
                {/* Section Title */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="mb-14 text-center"
                >
                    <span className="font-mono text-sm text-travel-amber/50 tracking-wider uppercase block mb-3">
                        {"// gallery.render()"}
                    </span>
                    <h2 className="section-title">
                        <span className="text-gray-100">Fotoğraf</span>{" "}
                        <span className="text-travel-amber">Galerisi</span>
                    </h2>
                    <p className="text-gray-400 mt-4 max-w-xl mx-auto">
                        Dünya üzerindeki yolculuklardan kareler
                    </p>
                </motion.div>

                {/* Optimized Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {galleryPhotos.map((photo, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.08 }}
                            className="cursor-pointer group relative overflow-hidden rounded-xl aspect-[4/3] bg-white/5"
                            onClick={() => openLightbox(index)}
                        >
                            <Image
                                src={photo.src}
                                alt={photo.caption}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                            />

                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                                <div className="absolute bottom-0 left-0 right-0 p-4">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <MapPin size={12} className="text-travel-amber" />
                                        <span className="font-mono text-xs text-travel-amber">
                                            {photo.location}
                                        </span>
                                    </div>
                                    <p className="text-white text-sm line-clamp-1">{photo.caption}</p>
                                </div>
                            </div>

                            {/* Neon border on hover */}
                            <div className="absolute inset-0 border border-transparent group-hover:border-travel-amber/30 rounded-xl transition-all duration-300 pointer-events-none z-20" />
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {lightboxIndex !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center"
                        onClick={closeLightbox}
                    >
                        {/* Close button */}
                        <button
                            onClick={closeLightbox}
                            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white z-10"
                        >
                            <X size={20} />
                        </button>

                        {/* Navigation */}
                        <button
                            onClick={(e) => { e.stopPropagation(); goPrev(); }}
                            className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white z-10"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); goNext(); }}
                            className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white z-10"
                        >
                            <ChevronRight size={24} />
                        </button>

                        {/* Image */}
                        <motion.div
                            key={lightboxIndex}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3 }}
                            className="max-w-5xl max-h-[85vh] px-16"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={galleryPhotos[lightboxIndex].src}
                                alt={galleryPhotos[lightboxIndex].caption}
                                className="max-w-full max-h-[75vh] object-contain rounded-lg mx-auto"
                            />
                            <div className="text-center mt-4">
                                <div className="flex items-center justify-center gap-2 mb-1">
                                    <MapPin size={14} className="text-travel-amber" />
                                    <span className="font-mono text-sm text-travel-amber">
                                        {galleryPhotos[lightboxIndex].location}
                                    </span>
                                </div>
                                <p className="text-gray-300 text-sm">
                                    {galleryPhotos[lightboxIndex].caption}
                                </p>
                                <span className="text-gray-600 text-xs font-mono mt-1 block">
                                    {lightboxIndex + 1} / {galleryPhotos.length}
                                </span>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
