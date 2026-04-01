"use client";

import { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
    const [isEnabled, setIsEnabled] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const cursorRef = useRef<HTMLDivElement>(null);
    const dotRef = useRef<HTMLDivElement>(null);
    const xRef = useRef(0);
    const yRef = useRef(0);
    const isHoveringRef = useRef(false);
    const isClickingRef = useRef(false);
    const isVisibleRef = useRef(false);
    const animationFrameRef = useRef<number | null>(null);

    useEffect(() => {
        if (window.matchMedia("(pointer: coarse)").matches) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        setIsEnabled(true);
    }, []);

    useEffect(() => {
        if (!isEnabled) return;

        const renderCursor = () => {
            animationFrameRef.current = null;

            if (!cursorRef.current || !dotRef.current) return;

            cursorRef.current.style.transform = `translate3d(${xRef.current}px, ${yRef.current}px, 0) translate(-50%, -50%) scale(${isClickingRef.current ? 0.7 : 1})`;
            dotRef.current.style.width = isHoveringRef.current ? "8px" : "6px";
            dotRef.current.style.height = isHoveringRef.current ? "8px" : "6px";
        };

        const scheduleRender = () => {
            if (animationFrameRef.current !== null) return;
            animationFrameRef.current = requestAnimationFrame(renderCursor);
        };

        const handlePointerMove = (e: PointerEvent) => {
            xRef.current = e.clientX;
            yRef.current = e.clientY;
            if (!isVisibleRef.current) {
                isVisibleRef.current = true;
                setIsVisible(true);
            }
            scheduleRender();
        };

        const handlePointerDown = () => {
            isClickingRef.current = true;
            scheduleRender();
        };

        const handlePointerUp = () => {
            isClickingRef.current = false;
            scheduleRender();
        };

        const handleMouseLeave = () => {
            isVisibleRef.current = false;
            setIsVisible(false);
        };

        const handleMouseEnter = () => {
            if (!isVisibleRef.current) {
                isVisibleRef.current = true;
                setIsVisible(true);
            }
            scheduleRender();
        };

        const handleElementHover = (e: PointerEvent) => {
            const target = e.target as HTMLElement;
            const isLink =
                target.closest("a") ||
                target.closest("button") ||
                target.closest("[role=button]") ||
                target.closest(".cursor-pointer") ||
                target.tagName === "A" ||
                target.tagName === "BUTTON";
            const nextHovering = !!isLink;
            if (nextHovering !== isHoveringRef.current) {
                isHoveringRef.current = nextHovering;
                scheduleRender();
            }
        };

        document.addEventListener("pointermove", handlePointerMove, { passive: true });
        document.addEventListener("pointerover", handleElementHover, { passive: true });
        document.addEventListener("pointerdown", handlePointerDown, { passive: true });
        document.addEventListener("pointerup", handlePointerUp, { passive: true });
        document.addEventListener("mouseleave", handleMouseLeave);
        document.addEventListener("mouseenter", handleMouseEnter);

        document.documentElement.classList.add("custom-cursor-enabled");
        const style = document.createElement("style");
        style.id = "custom-cursor-style";
        style.textContent = `
            html.custom-cursor-enabled,
            html.custom-cursor-enabled * {
                cursor: none !important;
            }
        `;
        document.head.appendChild(style);

        return () => {
            document.removeEventListener("pointermove", handlePointerMove);
            document.removeEventListener("pointerover", handleElementHover);
            document.removeEventListener("pointerdown", handlePointerDown);
            document.removeEventListener("pointerup", handlePointerUp);
            document.removeEventListener("mouseleave", handleMouseLeave);
            document.removeEventListener("mouseenter", handleMouseEnter);
            document.documentElement.classList.remove("custom-cursor-enabled");
            const existingStyle = document.getElementById("custom-cursor-style");
            if (existingStyle) existingStyle.remove();
            if (animationFrameRef.current !== null) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
        };
    }, [isEnabled]);

    if (!isEnabled || !isVisible) return null;

    return (
        <div
            ref={cursorRef}
            className="fixed pointer-events-none z-[9999] mix-blend-difference"
            style={{
                left: 0,
                top: 0,
                transform: "translate3d(0, 0, 0)",
                willChange: "transform",
            }}
        >
            <div
                ref={dotRef}
                className="rounded-full"
                style={{
                    width: 6,
                    height: 6,
                    backgroundColor: "#00ff41",
                    boxShadow: "0 0 6px rgba(0,255,65,0.8), 0 0 12px rgba(0,255,65,0.4)",
                    transition: "width 0.2s, height 0.2s",
                }}
            />
        </div>
    );
}
