"use client";

import { useEffect, useRef } from "react";

type Particle = {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
};

const MAX_DIST = 150;
const MAX_DIST_SQ = MAX_DIST * MAX_DIST;
const TARGET_FPS = 30;
const FRAME_MS = 1000 / TARGET_FPS;

/**
 * Ambient particle field behind the hero.
 *
 * The static grid lines live in CSS (`.grid-lines`) rather than being redrawn
 * every frame — the canvas only carries the moving parts, runs at 30fps, and
 * stops entirely when scrolled out of view or when the tab is hidden.
 */
export default function CyberGrid() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (window.matchMedia("(pointer: coarse)").matches) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d", { alpha: true });
        if (!ctx) return;

        let animationId = 0;
        let particles: Particle[] = [];
        let width = 0;
        let height = 0;
        let lastFrame = 0;
        let running = false;

        // Capping DPR keeps the fill cost sane on high-density displays without
        // a visible quality loss for 1-2px dots.
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = Math.round(width * dpr);
            canvas.height = Math.round(height * dpr);
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };

        const initParticles = () => {
            const count = Math.min(38, Math.floor((width * height) / 26000));
            particles = Array.from({ length: count }, () => ({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                size: Math.random() * 2 + 0.5,
                opacity: Math.random() * 0.5 + 0.1,
            }));
        };

        const draw = () => {
            ctx.clearRect(0, 0, width, height);

            // Connections first so dots sit on top of their own lines.
            ctx.lineWidth = 0.5;
            for (let i = 0; i < particles.length; i++) {
                const a = particles[i];
                for (let j = i + 1; j < particles.length; j++) {
                    const b = particles[j];
                    const dx = a.x - b.x;
                    const dy = a.y - b.y;
                    const distSq = dx * dx + dy * dy;
                    if (distSq >= MAX_DIST_SQ) continue;

                    const alpha = (1 - Math.sqrt(distSq) / MAX_DIST) * 0.15;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.strokeStyle = `rgba(0, 255, 65, ${alpha})`;
                    ctx.stroke();
                }
            }

            for (const p of particles) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0, 255, 65, ${p.opacity})`;
                ctx.fill();
            }
        };

        const update = (steps: number) => {
            for (const p of particles) {
                p.x += p.vx * steps;
                p.y += p.vy * steps;

                if (p.x < 0 || p.x > width) p.vx *= -1;
                if (p.y < 0 || p.y > height) p.vy *= -1;
            }
        };

        const animate = (now: number) => {
            animationId = requestAnimationFrame(animate);

            const elapsed = now - lastFrame;
            if (elapsed < FRAME_MS) return;
            lastFrame = now;

            // Scale movement by elapsed time so the drift speed stays constant
            // whether we hit 30fps or drop frames under load.
            update(Math.min(elapsed / FRAME_MS, 3));
            draw();
        };

        const start = () => {
            if (running) return;
            running = true;
            lastFrame = performance.now();
            animationId = requestAnimationFrame(animate);
        };

        const stop = () => {
            if (!running) return;
            running = false;
            cancelAnimationFrame(animationId);
        };

        resize();
        initParticles();

        let resizeTimer: ReturnType<typeof setTimeout>;
        const handleResize = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                resize();
                initParticles();
                if (!running) draw();
            }, 150);
        };

        // Only burn frames while the hero is actually on screen.
        const observer = new IntersectionObserver(
            ([entry]) => (entry.isIntersecting && !document.hidden ? start() : stop()),
            { threshold: 0 }
        );
        observer.observe(canvas);

        const handleVisibility = () => {
            if (document.hidden) stop();
            else if (canvas.getBoundingClientRect().bottom > 0) start();
        };
        document.addEventListener("visibilitychange", handleVisibility);
        window.addEventListener("resize", handleResize, { passive: true });

        return () => {
            stop();
            clearTimeout(resizeTimer);
            observer.disconnect();
            document.removeEventListener("visibilitychange", handleVisibility);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="absolute inset-0 z-0"
            style={{ pointerEvents: "none" }}
        />
    );
}
