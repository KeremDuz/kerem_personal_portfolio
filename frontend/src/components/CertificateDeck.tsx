"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type DeckCertificate = {
    title: string;
    issuer: string;
    date: string;
    color: string;
    image?: string;
    link?: string;
};

/**
 * Resting yaw. Negative rotateY swings the left edge away from the viewer and
 * the right edge toward them — the "pushed back on the left, leaning out on the
 * right" angle, applied identically to every card so the row reads as one
 * sequence rather than a scatter.
 */
const YAW = -30;
/** Yaw the card eases to under the cursor: straighter, but still angled. */
const YAW_FOCUS = -13;
/** How far from a card's centre the cursor still affects it, in px. */
const REACH = 300;
const SPRING = { stiffness: 260, damping: 26, mass: 0.5 };

type CardProps = {
    cert: DeckCertificate;
    index: number;
    total: number;
    /**
     * Viewport x of the current focus. The cursor on a mouse; the centre of the
     * scroller on touch. Both cases feed the same transform pipeline, so there
     * is exactly one code path deciding how a card is posed.
     */
    focusX: MotionValue<number>;
    scrollerRef: React.RefObject<HTMLDivElement | null>;
    onOpen: (cert: DeckCertificate) => void;
};

function Card({ cert, index, total, focusX, scrollerRef, onOpen }: CardProps) {
    const ref = useRef<HTMLButtonElement>(null);

    // Distance from the cursor to this card's resting centre.
    //
    // Deliberately `offsetLeft`/`offsetWidth` rather than
    // `getBoundingClientRect()`: those are layout metrics, untouched by the very
    // transform this value drives. Measuring the transformed box feeds the
    // magnified size back into its own input, and neighbouring cards end up
    // stealing the cursor from one another.
    const distance = useTransform(focusX, (x: number) => {
        const el = ref.current;
        const scroller = scrollerRef.current;
        if (!el || !scroller) return REACH * 2;
        const centre =
            scroller.getBoundingClientRect().left -
            scroller.scrollLeft +
            el.offsetLeft +
            el.offsetWidth / 2;
        return x - centre;
    });

    const range = [-REACH, 0, REACH];
    const scale = useSpring(useTransform(distance, range, [1, 1.14, 1], { clamp: true }), SPRING);
    const lift = useSpring(useTransform(distance, range, [0, -16, 0], { clamp: true }), SPRING);
    const rotateY = useSpring(
        useTransform(distance, range, [YAW, YAW_FOCUS, YAW], { clamp: true }),
        SPRING
    );

    // Each card leans out to the right, so the one further left overlaps its
    // neighbour — hence the descending stack order. Whatever is under the
    // cursor jumps in front of the lot.
    const restingZ = total - index;
    const zIndex = useTransform(distance, (d) => (Math.abs(d) < 120 ? total + 5 : restingZ));

    return (
        <motion.button
            ref={ref}
            type="button"
            onClick={() => onOpen(cert)}
            aria-label={`${cert.title} — ${cert.issuer}`}
            // Motion values only. Framer's declarative `animate` prop and a
            // `style` motion value fight over the same transform when they are
            // swapped at runtime, and the transform collapses to identity.
            style={{ scale, y: lift, rotateY, zIndex, transformPerspective: 1100 }}
            className="group relative -ml-6 shrink-0 snap-center rounded-2xl first:ml-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyber-green sm:-ml-8"
        >
            <div
                className="relative w-[168px] overflow-hidden rounded-xl border border-white/12 bg-dark-surface shadow-[0_30px_50px_-26px_rgb(0_0_0/0.95)] transition-colors duration-300 group-hover:border-white/30 sm:w-[196px]"
                style={{ aspectRatio: "3 / 4" }}
            >
                {cert.image && (
                    <>
                        {/* The certificates are a mix of portrait (~0.71) and
                            landscape (~1.4) scans. Cropping them all to fill one
                            card shape blew the landscape ones up about 2x and
                            left only a corner showing, so the whole document is
                            fitted instead — and a blurred copy fills the space
                            around it rather than leaving bars. Same `src` and
                            `sizes`, so it is still a single download. */}
                        <Image
                            src={cert.image}
                            alt=""
                            fill
                            sizes="196px"
                            draggable={false}
                            aria-hidden="true"
                            className="scale-110 object-cover opacity-30 blur-2xl"
                        />
                        <Image
                            src={cert.image}
                            alt=""
                            fill
                            sizes="196px"
                            draggable={false}
                            className="object-contain p-1.5"
                        />
                    </>
                )}

                {/* Shading that sells the angle: the receding left edge sits in
                    shadow, the near right edge catches light. Fades as the card
                    straightens under the cursor. */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-transparent to-white/[0.06] transition-opacity duration-300 group-hover:opacity-25" />

                <div className="absolute inset-x-0 top-0 h-[3px]" style={{ backgroundColor: cert.color, opacity: 0.8 }} />

                {/* Caption sits on its own bar so the scrim stays off the
                    certificate itself. */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/85 to-transparent p-3 pt-7 text-left">
                    <p className="line-clamp-2 font-mono text-[11px] font-semibold leading-snug text-white">
                        {cert.title}
                    </p>
                    <p className="mt-1 truncate text-[10px] text-gray-400">{cert.issuer}</p>
                </div>

                <span
                    className="absolute right-2 top-2 rounded-full px-2 py-0.5 font-mono text-[10px] backdrop-blur-sm"
                    style={{
                        color: cert.color,
                        backgroundColor: `${cert.color}1f`,
                        border: `1px solid ${cert.color}40`,
                    }}
                >
                    {cert.date}
                </span>
            </div>

            {/* Contact shadow — grounds the card so the tilt reads as depth
                rather than a flat skew. */}
            <div
                aria-hidden="true"
                className="absolute -bottom-3 left-1/2 h-4 w-[78%] -translate-x-1/2 rounded-[50%] bg-black/70 blur-md"
            />
        </motion.button>
    );
}

type CertificateDeckProps = {
    certificates: DeckCertificate[];
    onOpen: (cert: DeckCertificate) => void;
    hint: string;
    prevLabel: string;
    nextLabel: string;
};

/**
 * Certificates as a row of angled cards.
 *
 * Nine stacked cards made this the tallest section on the page — brutal on a
 * phone. Turning them into one horizontal run trades roughly 3000px of
 * vertical scrolling for a single swipe.
 */
export default function CertificateDeck({
    certificates,
    onOpen,
    hint,
    prevLabel,
    nextLabel,
}: CertificateDeckProps) {
    const scrollerRef = useRef<HTMLDivElement>(null);
    const focusX = useMotionValue(Number.POSITIVE_INFINITY);
    const pointerDrivenRef = useRef(false);
    const [edges, setEdges] = useState({ start: true, end: false });

    // Click-and-drag panning. Tracked in a ref rather than state so a drag
    // never re-renders the row mid-gesture.
    const dragRef = useRef({ active: false, startX: 0, startScroll: 0, moved: 0 });
    const [dragging, setDragging] = useState(false);

    const beginDrag = (event: React.PointerEvent<HTMLDivElement>) => {
        if (event.pointerType !== "mouse" || event.button !== 0) return;
        const scroller = scrollerRef.current;
        if (!scroller) return;
        dragRef.current = {
            active: true,
            startX: event.clientX,
            startScroll: scroller.scrollLeft,
            moved: 0,
        };
        setDragging(true);
    };

    const endDrag = () => {
        if (!dragRef.current.active) return;
        dragRef.current.active = false;
        setDragging(false);
    };

    useEffect(() => {
        const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

        const apply = () => {
            pointerDrivenRef.current = fine.matches && !reduced.matches;

            const scroller = scrollerRef.current;
            if (!scroller) return;
            if (pointerDrivenRef.current) {
                focusX.set(Number.POSITIVE_INFINITY);
            } else {
                // Without a cursor, the card in the middle of the scroller is
                // the one in focus — so the same distance maths still has
                // something to chew on, and there is only one posing code path.
                const rect = scroller.getBoundingClientRect();
                focusX.set(rect.left + rect.width / 2);
            }
        };

        apply();
        // Re-evaluated rather than read once: hybrid laptops switch between
        // touch and trackpad, and the motion preference can change mid-visit.
        fine.addEventListener("change", apply);
        reduced.addEventListener("change", apply);
        return () => {
            fine.removeEventListener("change", apply);
            reduced.removeEventListener("change", apply);
        };
    }, [focusX]);

    const syncScrollState = useCallback(() => {
        const scroller = scrollerRef.current;
        if (!scroller) return;

        const { scrollLeft, clientWidth, scrollWidth } = scroller;
        setEdges({
            start: scrollLeft <= 8,
            end: scrollLeft + clientWidth >= scrollWidth - 8,
        });

        // On touch the focus point is pinned to the middle of the scroller, so
        // whichever card you swipe into the centre is the one that steps
        // forward. Re-pinned on scroll because the element can move.
        if (!pointerDrivenRef.current) {
            const rect = scroller.getBoundingClientRect();
            focusX.set(rect.left + rect.width / 2);
        }
    }, [focusX]);

    useEffect(() => {
        const scroller = scrollerRef.current;
        if (!scroller) return;

        let ticking = false;
        const onScroll = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                ticking = false;
                syncScrollState();
            });
        };

        syncScrollState();
        scroller.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll, { passive: true });
        return () => {
            scroller.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
        };
    }, [syncScrollState, certificates.length]);

    // A pointer-up that travelled more than a few pixels was a pan, not a
    // click — otherwise every drag would end by opening a certificate.
    const handleOpen = (cert: DeckCertificate) => {
        if (dragRef.current.moved > 5) return;
        onOpen(cert);
    };

    const nudge = (direction: 1 | -1) => {
        const scroller = scrollerRef.current;
        if (!scroller) return;
        scroller.scrollBy({ left: direction * scroller.clientWidth * 0.7, behavior: "smooth" });
    };

    return (
        <div className="relative">
            {/* Edge fades, which double as "there is more this way" cues */}
            <div
                aria-hidden="true"
                className={`pointer-events-none absolute inset-y-0 left-0 z-40 w-20 bg-gradient-to-r from-dark-bg to-transparent transition-opacity duration-300 ${edges.start ? "opacity-0" : "opacity-100"}`}
            />
            <div
                aria-hidden="true"
                className={`pointer-events-none absolute inset-y-0 right-0 z-40 w-20 bg-gradient-to-l from-dark-bg to-transparent transition-opacity duration-300 ${edges.end ? "opacity-0" : "opacity-100"}`}
            />

            {/* Vertical padding rather than overflow-visible: `overflow-x: auto`
                forces overflow-y to auto as well, so a magnified card would be
                clipped without room to grow into. */}
            <div
                ref={scrollerRef}
                onPointerDown={beginDrag}
                onPointerMove={(event) => {
                    if (event.pointerType !== "mouse") return;

                    const drag = dragRef.current;
                    if (drag.active && scrollerRef.current) {
                        const delta = event.clientX - drag.startX;
                        drag.moved = Math.max(drag.moved, Math.abs(delta));
                        scrollerRef.current.scrollLeft = drag.startScroll - delta;
                    }

                    focusX.set(event.clientX);
                }}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                onPointerLeave={() => {
                    endDrag();
                    if (pointerDrivenRef.current) focusX.set(Number.POSITIVE_INFINITY);
                }}
                // Snapping fights a free drag, so it is only on for touch.
                className={`hide-scrollbar relative flex overflow-x-auto overscroll-x-contain px-10 pb-12 pt-6 sm:px-16 ${dragging ? "cursor-grabbing select-none" : "cursor-grab snap-x snap-proximity"}`}
                style={{ scrollbarWidth: "none" }}
            >
                {certificates.map((cert, index) => (
                    <Card
                        key={`${cert.title}-${index}`}
                        cert={cert}
                        index={index}
                        total={certificates.length}
                        focusX={focusX}
                        scrollerRef={scrollerRef}
                        onOpen={handleOpen}
                    />
                ))}
            </div>

            {/* Arrows for anyone without a trackpad to swipe with */}
            <div className="pointer-events-none absolute inset-y-0 left-0 right-0 z-50 hidden items-center justify-between px-1 lg:flex">
                <button
                    type="button"
                    onClick={() => nudge(-1)}
                    aria-label={prevLabel}
                    disabled={edges.start}
                    className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-dark-surface/85 text-gray-300 backdrop-blur-md transition-all hover:border-cyber-green/40 hover:text-white disabled:pointer-events-none disabled:opacity-0"
                >
                    <ChevronLeft size={18} />
                </button>
                <button
                    type="button"
                    onClick={() => nudge(1)}
                    aria-label={nextLabel}
                    disabled={edges.end}
                    className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-dark-surface/85 text-gray-300 backdrop-blur-md transition-all hover:border-cyber-green/40 hover:text-white disabled:pointer-events-none disabled:opacity-0"
                >
                    <ChevronRight size={18} />
                </button>
            </div>

            <p className="mt-1 text-center font-mono text-[11px] text-gray-600">{hint}</p>
        </div>
    );
}
