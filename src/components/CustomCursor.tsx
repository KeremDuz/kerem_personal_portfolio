"use client";

import { useEffect, useState } from "react";

export default function CustomCursor() {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [isClicking, setIsClicking] = useState(false);

    useEffect(() => {
        // Only show custom cursor on desktop
        if (window.matchMedia("(pointer: coarse)").matches) return;

        const handleMouseMove = (e: MouseEvent) => {
            setPosition({ x: e.clientX, y: e.clientY });
            setIsVisible(true);
        };

        const handleMouseDown = () => setIsClicking(true);
        const handleMouseUp = () => setIsClicking(false);
        const handleMouseLeave = () => setIsVisible(false);
        const handleMouseEnter = () => setIsVisible(true);

        // Detect hoverable elements
        const handleElementHover = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const isLink =
                target.closest("a") ||
                target.closest("button") ||
                target.closest("[role=button]") ||
                target.closest(".cursor-pointer") ||
                target.tagName === "A" ||
                target.tagName === "BUTTON";
            setIsHovering(!!isLink);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseover", handleElementHover);
        document.addEventListener("mousedown", handleMouseDown);
        document.addEventListener("mouseup", handleMouseUp);
        document.addEventListener("mouseleave", handleMouseLeave);
        document.addEventListener("mouseenter", handleMouseEnter);

        // Add CSS to hide default cursor
        document.body.style.cursor = "none";
        const style = document.createElement("style");
        style.id = "custom-cursor-style";
        style.textContent = `
      *, *::before, *::after { cursor: none !important; }
    `;
        document.head.appendChild(style);

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseover", handleElementHover);
            document.removeEventListener("mousedown", handleMouseDown);
            document.removeEventListener("mouseup", handleMouseUp);
            document.removeEventListener("mouseleave", handleMouseLeave);
            document.removeEventListener("mouseenter", handleMouseEnter);
            document.body.style.cursor = "";
            const existingStyle = document.getElementById("custom-cursor-style");
            if (existingStyle) existingStyle.remove();
        };
    }, []);

    if (!isVisible) return null;

    return (
        /* Inner dot only */
        <div
            className="fixed pointer-events-none z-[9999] mix-blend-difference"
            style={{
                left: position.x,
                top: position.y,
                transform: `translate(-50%, -50%) scale(${isClicking ? 0.6 : 1})`,
                transition: "transform 0.1s ease",
            }}
        >
            <div
                className="rounded-full"
                style={{
                    width: isHovering ? 8 : 6,
                    height: isHovering ? 8 : 6,
                    backgroundColor: "#00ff41",
                    boxShadow: "0 0 6px rgba(0,255,65,0.8), 0 0 12px rgba(0,255,65,0.4)",
                    transition: "width 0.2s, height 0.2s",
                }}
            />
        </div>
    );
}
