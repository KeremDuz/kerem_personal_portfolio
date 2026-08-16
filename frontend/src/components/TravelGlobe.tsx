"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin } from "lucide-react";
import type { TravelPin } from "@/data/travelData";
import MemoryViewer from "./MemoryViewer";
import { useTranslations } from "next-intl";

interface TravelGlobeProps {
    data: TravelPin[];
}

const isUpcomingPin = (pin: TravelPin | null) =>
    Boolean(pin && (pin.status === "upcoming" || pin.media.length === 0));

/** Antalya — the home base every route is drawn from. */
const HOME = { lat: 36.8969, lng: 30.7133 };
const SINGLE_LABEL_DIRECTIONS = [
    { x: 0, y: -54 },
    { x: 62, y: -32 },
    { x: 62, y: 32 },
    { x: 0, y: 54 },
    { x: -62, y: 32 },
    { x: -62, y: -32 },
] as const;

function stableDirectionIndex(pin: TravelPin): number {
    const value = `${pin.label}:${pin.lat}:${pin.lng}`;
    let hash = 2166136261;

    for (let index = 0; index < value.length; index++) {
        hash ^= value.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }

    return (hash >>> 0) % SINGLE_LABEL_DIRECTIONS.length;
}

export default function TravelGlobe({ data }: TravelGlobeProps) {
    const t = useTranslations("Travel");
    const tCities = useTranslations("Cities");
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
            if (!globeContainerRef.current) return;
            const w = globeContainerRef.current.clientWidth;
            // Scale the canvas with the viewport instead of a fixed 800px, so
            // phones don't render a needlessly large WebGL surface.
            const h = Math.round(
                Math.min(820, Math.max(420, Math.min(w * 1.15, window.innerHeight * 0.92)))
            );
            setDimensions((prev) =>
                prev.width === w && prev.height === h ? prev : { width: w, height: h }
            );
        };

        updateSize();

        let resizeTimer: ReturnType<typeof setTimeout>;
        const onResize = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(updateSize, 150);
        };

        window.addEventListener("resize", onResize, { passive: true });
        return () => {
            clearTimeout(resizeTimer);
            window.removeEventListener("resize", onResize);
        };
    }, []);

    // Globe ready handler
    const handleGlobeReady = useCallback(() => {
        setIsReady(true);
        const globe = globeRef.current;
        if (!globe) return;

        const controls = globe.controls();
        if (controls) {
            controls.autoRotate = true;
            controls.autoRotateSpeed = 0.45;
            controls.enableZoom = true;
            // Damping makes dragging feel weighty instead of snapping.
            controls.enableDamping = true;
            controls.dampingFactor = 0.08;
            controls.minDistance = 180;
            controls.maxDistance = 620;
        }

        try {
            // High-DPI phones gain nothing visible from a 3x WebGL buffer but
            // pay for every one of those pixels.
            globe.renderer()?.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));

            // A touch of self-illumination keeps the night side from going
            // fully black, so the planet reads as a sphere from any angle.
            const material = globe.globeMaterial();
            if (material) {
                material.shininess = 14;
                material.emissive?.set?.("#0a1a2b");
                material.emissiveIntensity = 0.14;
            }
        } catch {
            // Renderer internals are best-effort polish, never load-bearing.
        }

        globe.pointOfView({ lat: 42, lng: 28, altitude: 2.4 }, 1400);
    }, []);

    // Stop rendering entirely while the globe is off screen or the tab is
    // hidden — this is the single biggest cost on the page.
    useEffect(() => {
        if (!isReady) return;
        const container = globeContainerRef.current;
        if (!container) return;

        let visible = true;

        const apply = () => {
            const globe = globeRef.current;
            if (!globe) return;
            if (visible && !document.hidden) globe.resumeAnimation?.();
            else globe.pauseAnimation?.();
        };

        const observer = new IntersectionObserver(
            ([entry]) => {
                visible = entry.isIntersecting;
                apply();
            },
            { threshold: 0 }
        );
        observer.observe(container);
        document.addEventListener("visibilitychange", apply);

        return () => {
            observer.disconnect();
            document.removeEventListener("visibilitychange", apply);
        };
    }, [isReady]);

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
        // Treat the dense Central-European route as one visual group. Every
        // label remains visible; the wider radial layout prevents stacking.
        const threshold = 6.5;
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
                        if (index === 0) { offsetX = -62; offsetY = -40; }
                        else { offsetX = 62; offsetY = 40; }
                    } else if (count === 3) {
                        if (index === 0) { offsetX = 0; offsetY = -72; }
                        else if (index === 1) { offsetX = -74; offsetY = 42; }
                        else { offsetX = 74; offsetY = 42; }
                    } else {
                        const angle = -Math.PI / 2 + (index / count) * Math.PI * 2;
                        const radius = 72 + Math.min(count, 8) * 3;
                        offsetX = Math.cos(angle) * radius * 1.2;
                        offsetY = Math.sin(angle) * radius;
                    }
                } else {
                    const direction = SINGLE_LABEL_DIRECTIONS[stableDirectionIndex(pin)];
                    offsetX = direction.x;
                    offsetY = direction.y;
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

    // Keep every front-facing city name visible. Instead of removing labels
    // when they collide, gently spread them in screen space and extend their
    // leader lines to the new position as the globe rotates.
    useEffect(() => {
        if (!isReady) return;
        const container = globeContainerRef.current;
        if (!container) return;

        let animationFrame = 0;
        let lastUpdate = 0;

        const resolveLabelPositions = (time: number) => {
            if (time - lastUpdate >= 120 && !document.hidden) {
                lastUpdate = time;
                const scene = container.querySelector<HTMLElement>(".scene-container");
                const bounds = (scene ?? container).getBoundingClientRect();

                if (bounds.bottom >= 0 && bounds.top <= window.innerHeight) {
                    const labels = Array.from(
                        container.querySelectorAll<HTMLElement>("[data-globe-label]")
                    );
                    const entries = labels.flatMap((label, index) => {
                        const anchorElement = label.parentElement;
                        if (!anchorElement) return [];

                        const rect = label.getBoundingClientRect();
                        const anchor = anchorElement.getBoundingClientRect();
                        if (rect.width === 0 || rect.height === 0) return [];

                        const baseX = Number(label.dataset.baseOffsetX || 0);
                        const baseY = Number(label.dataset.baseOffsetY || 0);

                        return [{
                            label,
                            line: anchorElement.querySelector<SVGLineElement>("line"),
                            index,
                            width: rect.width,
                            height: rect.height,
                            anchorX: anchor.left,
                            anchorY: anchor.top,
                            desiredX: anchor.left + baseX,
                            desiredY: anchor.top + baseY,
                            x: anchor.left + baseX,
                            y: anchor.top + baseY,
                        }];
                    });

                    const padding = 7;
                    for (let iteration = 0; iteration < 18; iteration++) {
                        for (let leftIndex = 0; leftIndex < entries.length; leftIndex++) {
                            for (let rightIndex = leftIndex + 1; rightIndex < entries.length; rightIndex++) {
                                const left = entries[leftIndex];
                                const right = entries[rightIndex];
                                const deltaX = right.x - left.x;
                                const deltaY = right.y - left.y;
                                const overlapX = (left.width + right.width) / 2 + padding - Math.abs(deltaX);
                                const overlapY = (left.height + right.height) / 2 + padding - Math.abs(deltaY);

                                if (overlapX <= 0 || overlapY <= 0) continue;

                                if (overlapX < overlapY) {
                                    const direction = deltaX === 0
                                        ? (left.index < right.index ? 1 : -1)
                                        : Math.sign(deltaX);
                                    const shift = overlapX / 2 + 0.5;
                                    left.x -= direction * shift;
                                    right.x += direction * shift;
                                } else {
                                    const direction = deltaY === 0
                                        ? (left.index < right.index ? 1 : -1)
                                        : Math.sign(deltaY);
                                    const shift = overlapY / 2 + 0.5;
                                    left.y -= direction * shift;
                                    right.y += direction * shift;
                                }
                            }
                        }

                        for (const entry of entries) {
                            if (iteration < 17) {
                                entry.x += (entry.desiredX - entry.x) * 0.035;
                                entry.y += (entry.desiredY - entry.y) * 0.035;
                            }

                            entry.x = Math.min(
                                bounds.right - entry.width / 2 - 8,
                                Math.max(bounds.left + entry.width / 2 + 8, entry.x)
                            );
                            entry.y = Math.min(
                                bounds.bottom - entry.height / 2 - 8,
                                Math.max(bounds.top + entry.height / 2 + 8, entry.y)
                            );
                        }
                    }

                    for (const entry of entries) {
                        const offsetX = entry.x - entry.anchorX;
                        const offsetY = entry.y - entry.anchorY;
                        entry.label.style.left = `${offsetX}px`;
                        entry.label.style.top = `${offsetY}px`;
                        entry.label.style.opacity = entry.label.matches(":hover") ? "1" : "0.92";
                        entry.label.style.pointerEvents = "auto";
                        entry.label.setAttribute("aria-hidden", "false");
                        entry.line?.setAttribute("x2", String(offsetX));
                        entry.line?.setAttribute("y2", String(offsetY));
                    }
                }
            }

            animationFrame = window.requestAnimationFrame(resolveLabelPositions);
        };

        animationFrame = window.requestAnimationFrame(resolveLabelPositions);
        return () => window.cancelAnimationFrame(animationFrame);
    }, [isReady, processedData, dimensions.width, dimensions.height]);

    // Flight paths radiating from home to every place actually visited.
    const arcsData = useMemo(
        () =>
            data
                .filter((pin) => pin.status !== "upcoming" && pin.media.length > 0)
                .map((pin) => ({
                    startLat: HOME.lat,
                    startLng: HOME.lng,
                    endLat: pin.lat,
                    endLng: pin.lng,
                    color: [`${pin.color}00`, pin.color, `${pin.color}00`],
                })),
        [data]
    );

    // Radar-style pulses under each pin; upcoming cities get a dimmer ring.
    const ringsData = useMemo(
        () =>
            data.map((pin) => ({
                lat: pin.lat,
                lng: pin.lng,
                color: pin.color,
                upcoming: pin.status === "upcoming" || pin.media.length === 0,
            })),
        [data]
    );

    const MemoizedGlobe = useMemo(() => {
        if (!GlobeModule) return null;
        const Globe = GlobeModule;

        return (
            <Globe
                ref={globeRef}
                width={dimensions.width}
                height={dimensions.height}
                // WebP at 2048px / 1024px instead of the 1.4 MB JPEG and 369 KB
                // PNG: 1.8 MB of texture down to 221 KB, with no visible
                // difference at the sizes the globe is ever drawn.
                globeImageUrl="/globe/earth-blue-marble.webp"
                bumpImageUrl="/globe/earth-topology.webp"
                backgroundImageUrl=""
                backgroundColor="rgba(0,0,0,0)"
                atmosphereColor="#5ad8e8"
                atmosphereAltitude={0.26}
                arcsData={arcsData}
                arcColor={(d: any) => d.color}
                arcAltitudeAutoScale={0.42}
                arcStroke={0.42}
                arcDashLength={0.35}
                arcDashGap={0.7}
                arcDashInitialGap={() => Math.random()}
                arcDashAnimateTime={4200}
                arcsTransitionDuration={0}
                ringsData={ringsData}
                ringLat={(d: any) => d.lat}
                ringLng={(d: any) => d.lng}
                ringColor={(d: any) => (t: number) =>
                    `${d.color}${Math.round((1 - t) * (d.upcoming ? 90 : 190))
                        .toString(16)
                        .padStart(2, "0")}`}
                ringMaxRadius={(d: any) => (d.upcoming ? 1.6 : 2.6)}
                ringPropagationSpeed={0.9}
                ringRepeatPeriod={(d: any) => (d.upcoming ? 2600 : 1700)}
                ringAltitude={0.006}
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
                    const isUpcoming = d.status === "upcoming" || d.media?.length === 0;
                    const displayLabel = d._id ? d.label : tCities(d.label);

                    // Built through the DOM API rather than an innerHTML
                    // template. `label` and `color` come from the travel API, so
                    // interpolating them into markup made this a stored-XSS sink
                    // for anyone who could write that data. textContent and
                    // style properties are never parsed as HTML.
                    const svgNs = "http://www.w3.org/2000/svg";

                    const inner = document.createElement("div");
                    inner.className = "group";
                    Object.assign(inner.style, {
                        position: "relative",
                        width: "0px",
                        height: "0px",
                        zIndex: String(zIndex),
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    });

                    // Leader line from the pin out to its label
                    const svg = document.createElementNS(svgNs, "svg");
                    Object.assign(svg.style, {
                        position: "absolute",
                        top: "0",
                        left: "0",
                        overflow: "visible",
                        pointerEvents: "none",
                        zIndex: "1",
                    });
                    const line = document.createElementNS(svgNs, "line");
                    line.setAttribute("x1", "0");
                    line.setAttribute("y1", "0");
                    line.setAttribute("x2", String(offsetX));
                    line.setAttribute("y2", String(offsetY));
                    line.setAttribute("stroke-width", "1");
                    line.setAttribute("opacity", "0.5");
                    line.style.stroke = d.color;
                    svg.appendChild(line);

                    // The dot sitting on the map coordinate itself
                    const dot = document.createElement("div");
                    dot.className = "group-hover:scale-125 group-hover:bg-white/30 transition-all duration-300";
                    Object.assign(dot.style, {
                        position: "absolute",
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        borderStyle: "solid",
                        borderWidth: "2px",
                        backgroundColor: "rgba(0,0,0,0.6)",
                        zIndex: "2",
                        transform: "translate(-50%, -50%)",
                    });
                    dot.style.borderColor = d.color;
                    dot.style.boxShadow = `0 0 10px ${d.color}`;

                    const label = document.createElement("div");
                    label.className = "group-hover:opacity-100 group-hover:scale-110 transition-all duration-300";
                    label.textContent = displayLabel;
                    label.dataset.globeLabel = "true";
                    label.dataset.baseOffsetX = String(offsetX);
                    label.dataset.baseOffsetY = String(offsetY);
                    Object.assign(label.style, {
                        position: "absolute",
                        left: `${offsetX}px`,
                        top: `${offsetY}px`,
                        transform: "translate(-50%, -50%)",
                        fontFamily: "var(--font-mono), monospace",
                        fontSize: "10px",
                        fontWeight: "600",
                        color: "#fff",
                        background: "rgba(5, 12, 20, 0.82)",
                        borderWidth: "1px",
                        borderStyle: isUpcoming ? "dashed" : "solid",
                        padding: "3px 7px",
                        borderRadius: "4px",
                        whiteSpace: "nowrap",
                        pointerEvents: "auto",
                        cursor: "pointer",
                        zIndex: "3",
                        opacity: "0.92",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.45)",
                        backdropFilter: "blur(8px)",
                        transition: "left 160ms ease, top 160ms ease, opacity 180ms ease, transform 180ms ease",
                    });
                    label.style.borderColor = `${d.color}50`;

                    // Generous invisible hitbox so the 8px dot is easy to hit
                    const hitbox = document.createElement("div");
                    Object.assign(hitbox.style, {
                        position: "absolute",
                        top: "-15px",
                        left: "-15px",
                        width: "30px",
                        height: "30px",
                        pointerEvents: "auto",
                        cursor: "pointer",
                        zIndex: "0",
                    });

                    inner.append(svg, dot, label, hitbox);
                    el.appendChild(inner);
                    el.style.pointerEvents = "none";
                    el.style.transform = "translate(-50%, -50%)";
                    inner.onclick = (e) => {
                        e.stopPropagation();
                        handlePinClick(d);
                    };
                    inner.onmouseenter = () => {
                        label.style.opacity = "1";
                        label.style.pointerEvents = "auto";
                        label.style.zIndex = "50";
                        inner.style.zIndex = "50";
                        setHoveredPin(d);
                        const container = document.getElementById('travel-globe-container');
                        if (container) container.style.cursor = "pointer";
                    };
                    inner.onmouseleave = () => {
                        label.style.opacity = "0.92";
                        label.style.zIndex = "3";
                        inner.style.zIndex = String(zIndex);
                        setHoveredPin(null);
                        const container = document.getElementById('travel-globe-container');
                        if (container) container.style.cursor = "grab";
                    };

                    return el;
                }}
                onGlobeReady={handleGlobeReady}
            />
        );
    }, [
        GlobeModule,
        dimensions,
        processedData,
        arcsData,
        ringsData,
        handleGlobeReady,
        handlePinClick,
        tCities,
    ]);

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
            {/* Deep-space backdrop behind the planet */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-0 starfield opacity-60 mask-fade-radial"
                data-globe-underlay
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyber-blue/10 blur-[90px]"
                data-globe-underlay
            />

            {/* Globe */}
            <div className="relative z-[1] flex justify-center items-center" data-globe-underlay>
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
                                {hoveredPin._id ? hoveredPin.label : tCities(hoveredPin.label)}
                            </span>
                            <span className="text-gray-500 text-xs">
                                — {isUpcomingPin(hoveredPin) ? t("comingSoonHint") : t("clickMemories")}
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
