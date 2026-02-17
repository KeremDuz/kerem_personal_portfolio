"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin } from "lucide-react";
import type { TravelPin } from "@/data/travelData";
import MemoryViewer from "./MemoryViewer";

interface TravelGlobeProps {
    data: TravelPin[];
}

export default function TravelGlobe({ data }: TravelGlobeProps) {
    const globeContainerRef = useRef<HTMLDivElement>(null);
    const globeRef = useRef<any>(null);
    const [GlobeModule, setGlobeModule] = useState<any>(null);
    const [selectedPin, setSelectedPin] = useState<TravelPin | null>(null);
    const [hoveredPin, setHoveredPin] = useState<TravelPin | null>(null);
    const [dimensions, setDimensions] = useState({ width: 600, height: 600 });
    const [isReady, setIsReady] = useState(false);

    // Dynamic import of react-globe.gl (client only)
    useEffect(() => {
        import("react-globe.gl").then((mod) => {
            setGlobeModule(() => mod.default);
        });
    }, []);

    // Calculate responsive dimensions
    useEffect(() => {
        const updateSize = () => {
            if (globeContainerRef.current) {
                const w = globeContainerRef.current.clientWidth;
                // Use full width and taller height to prevent clipping
                setDimensions({ width: w, height: 800 });
            }
        };
        updateSize();
        window.addEventListener("resize", updateSize);
        return () => window.removeEventListener("resize", updateSize);
    }, []);

    // Globe ready handler
    const handleGlobeReady = useCallback(() => {
        setIsReady(true);
        if (globeRef.current) {
            const controls = globeRef.current.controls();
            if (controls) {
                controls.autoRotate = true;
                controls.autoRotateSpeed = 0.5;
                controls.enableZoom = true;
            }
            globeRef.current.pointOfView(
                { lat: 39.93, lng: 32.85, altitude: 2.5 },
                1000
            );
        }
    }, []);

    const MemoizedGlobe = useMemo(() => {
        if (!GlobeModule) return null;
        const Globe = GlobeModule;

        return (
            <Globe
                ref={globeRef}
                width={dimensions.width}
                height={dimensions.height}
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
                bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                backgroundImageUrl=""
                backgroundColor="rgba(0,0,0,0)"
                atmosphereColor="#63b3ed"
                atmosphereAltitude={0.18}
                pointsData={data}
                pointLat={(d: TravelPin) => d.lat}
                pointLng={(d: TravelPin) => d.lng}
                pointColor={(d: TravelPin) => d.color}
                pointAltitude={0.08}
                pointRadius={0.7}
                pointsMerge={false}
                onPointClick={(point: TravelPin) => {
                    setSelectedPin(point);
                    if (globeRef.current) {
                        globeRef.current.pointOfView(
                            { lat: point.lat, lng: point.lng, altitude: 1.5 },
                            800
                        );
                    }
                }}
                onPointHover={(point: TravelPin | null) => {
                    setHoveredPin(point);
                    if (globeContainerRef.current) {
                        globeContainerRef.current.style.cursor = point ? "pointer" : "grab";
                    }
                }}
                htmlElementsData={data}
                htmlLat={(d: TravelPin) => d.lat}
                htmlLng={(d: TravelPin) => d.lng}
                htmlAltitude={0.1}
                htmlElement={(d: TravelPin) => {
                    const el = document.createElement("div");
                    el.className = "globe-label";
                    el.style.cssText = `
                        font-family: 'JetBrains Mono', monospace;
                        font-size: 10px;
                        color: ${d.color};
                        text-shadow: 0 0 6px ${d.color}80;
                        pointer-events: none;
                        white-space: nowrap;
                        transform: translate(-50%, -100%);
                        padding: 2px 6px;
                        background: rgba(10, 10, 10, 0.7);
                        border-radius: 4px;
                        border: 1px solid ${d.color}40;
                    `;
                    el.textContent = d.label;
                    return el;
                }}
                onGlobeReady={handleGlobeReady}
            />
        );
    }, [GlobeModule, dimensions, data, handleGlobeReady]);

    if (!GlobeModule) {
        return (
            <div className="flex items-center justify-center h-[500px]">
                <div className="font-mono text-cyber-green/50 text-sm animate-pulse">
                    {">"} Loading globe module...
                </div>
            </div>
        );
    }

    return (
        <div className="relative" ref={globeContainerRef}>
            {/* Globe */}
            <div className="flex justify-center items-center">
                <div className="relative">
                    {MemoizedGlobe}
                </div>
            </div>

            {/* Hover tooltip */}
            <AnimatePresence>
                {hoveredPin && !selectedPin && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20"
                    >
                        <div className="glass-card px-4 py-2 flex items-center gap-2">
                            <MapPin size={14} style={{ color: hoveredPin.color }} />
                            <span className="font-mono text-sm text-gray-200">
                                {hoveredPin.label}
                            </span>
                            <span className="text-gray-500 text-xs">
                                — Tıkla ve anıları yaşa
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Full-screen Immersive Memory Viewer */}
            <AnimatePresence>
                {selectedPin && (
                    <MemoryViewer
                        pin={selectedPin}
                        onClose={() => setSelectedPin(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
