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

    const handlePinClick = useCallback((point: TravelPin) => {
        setSelectedPin(point);
        if (globeRef.current) {
            globeRef.current.pointOfView(
                { lat: point.lat, lng: point.lng, altitude: 1.5 },
                800
            );
        }
    }, []);

    const processedData = useMemo(() => {
        const threshold = 1.8; // degrees distance (~200km max)
        const groups: TravelPin[][] = [];

        data.forEach(pin => {
            let placed = false;
            for (const group of groups) {
                const rep = group[0];
                const dist = Math.sqrt(Math.pow(rep.lat - pin.lat, 2) + Math.pow(rep.lng - pin.lng, 2));
                if (dist < threshold) {
                    group.push(pin);
                    placed = true;
                    break;
                }
            }
            if (!placed) groups.push([pin]);
        });

        const items: any[] = [];
        groups.forEach(group => {
            const count = group.length;
            // Sort group to keep consistent order (e.g. by latitude)
            group.sort((a, b) => b.lat - a.lat);

            group.forEach((pin, index) => {
                let offsetX = 0;
                let offsetY = 0;

                if (count > 1) {
                    // Offset overlaps around a radius
                    if (count === 2) {
                        if (index === 0) { offsetX = -35; offsetY = -25; }
                        else { offsetX = 35; offsetY = 25; }
                    } else if (count === 3) {
                        if (index === 0) { offsetX = 0; offsetY = -35; }
                        else if (index === 1) { offsetX = -40; offsetY = 20; }
                        else { offsetX = 40; offsetY = 20; }
                    } else {
                        const angle = (index / count) * Math.PI * 2;
                        offsetX = Math.cos(angle) * 45;
                        offsetY = Math.sin(angle) * 45;
                    }
                } else {
                    offsetX = 0;
                    offsetY = -35;
                }

                items.push({
                    ...pin,
                    offsetX,
                    offsetY,
                    isCluster: count > 1,
                    clusterIndex: index
                });
            });
        });
        return items;
    }, [data]);

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
                pointsData={processedData}
                pointLat={(d: any) => d.lat}
                pointLng={(d: any) => d.lng}
                pointColor={(d: any) => "rgba(0,0,0,0)"} // Invisible click anchor
                pointAltitude={0.08}
                pointRadius={0.7}
                pointsMerge={false}
                onPointClick={(point: any) => handlePinClick(point)}
                onPointHover={(point: any | null) => {
                    setHoveredPin(point);
                    const container = document.getElementById('travel-globe-container');
                    if (container) container.style.cursor = point ? "pointer" : "grab";
                }}
                htmlElementsData={processedData}
                htmlLat={(d: any) => d.lat}
                htmlLng={(d: any) => d.lng}
                htmlAltitude={0.01}
                htmlElement={(d: any) => {
                    const el = document.createElement("div");

                    const offsetX = d.offsetX || 0;
                    const offsetY = d.offsetY || 0;
                    const zIndex = d.isCluster ? 10 - d.clusterIndex : 10;

                    el.innerHTML = `
                        <div class="group" style="
                            position: relative; 
                            width: 0px; 
                            height: 0px; 
                            z-index: ${zIndex}; 
                            display: flex; 
                            justify-content: center; 
                            align-items: center;
                        ">
                            <!-- Leader Line via SVG (origin at 0,0, drawing to offsetX,offsetY) -->
                            <svg style="
                                position: absolute;
                                top: 0; left: 0;
                                overflow: visible;
                                pointer-events: none;
                                z-index: 1;
                            ">
                               <line 
                                 x1="0" y1="0" 
                                 x2="${offsetX}" y2="${offsetY}" 
                                 stroke="${d.color}" 
                                 stroke-width="1.5"
                                 opacity="0.8"
                               />
                            </svg>

                            <!-- Base Dot fixed at map coordinate (0,0) -->
                            <div style="
                                position: absolute;
                                width: 8px;
                                height: 8px;
                                border-radius: 50%;
                                border: 2px solid ${d.color};
                                background-color: rgba(0,0,0,0.6);
                                box-shadow: 0 0 10px ${d.color};
                                z-index: 2;
                                transform: translate(-50%, -50%);
                            " class="group-hover:scale-125 group-hover:bg-white/30 transition-all duration-300"></div>
                            
                            <!-- Label centered at offsetX, offsetY -->
                            <div style="
                                position: absolute;
                                left: ${offsetX}px;
                                top: ${offsetY}px;
                                transform: translate(-50%, -50%); /* Centered exactly at line end! */
                                font-family: 'JetBrains Mono', monospace;
                                font-size: 11px;
                                font-weight: 600;
                                color: #fff;
                                background: rgba(10, 10, 10, 0.7);
                                border: 1px solid ${d.color}50;
                                padding: 3px 8px;
                                border-radius: 4px;
                                white-space: nowrap;
                                pointer-events: auto;
                                cursor: pointer;
                                z-index: 3;
                                opacity: 0.9;
                                box-shadow: 0 4px 6px rgba(0,0,0,0.5);
                            " class="group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
                                ${d.label}
                            </div>
                            
                            <!-- Invisible Hitbox covering the dot to ensure easy hovering -->
                            <div style="
                                position: absolute;
                                top: -15px; left: -15px;
                                width: 30px; height: 30px;
                                pointer-events: auto;
                                cursor: pointer;
                                z-index: 0;
                            "></div>
                        </div>
                    `;
                    el.style.cssText = `
                        pointer-events: none;
                        transform: translate(-50%, -50%);
                    `;

                    const inner = el.firstElementChild as HTMLElement;
                    inner.onclick = (e) => {
                        e.stopPropagation();
                        handlePinClick(d);
                    };
                    inner.onmouseenter = () => {
                        setHoveredPin(d);
                        const container = document.getElementById('travel-globe-container');
                        if (container) container.style.cursor = "pointer";
                    };
                    inner.onmouseleave = () => {
                        setHoveredPin(null);
                        const container = document.getElementById('travel-globe-container');
                        if (container) container.style.cursor = "grab";
                    };

                    return el;
                }}
                onGlobeReady={handleGlobeReady}
            />
        );
    }, [GlobeModule, dimensions, processedData, handleGlobeReady, handlePinClick]);

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
        <div className="relative" ref={globeContainerRef} id="travel-globe-container">
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
