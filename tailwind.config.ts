import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                "cyber-green": "#00ff41",
                "cyber-blue": "#00f3ff",
                "travel-amber": "#f59e0b",
                "travel-orange": "#f97316",
                "dark-bg": "#0a0a0a",
                "dark-surface": "#111827",
                "dark-card": "#1a1a2e",
            },
            fontFamily: {
                mono: ['"JetBrains Mono"', "Fira Code", "monospace"],
                sans: ["Inter", "system-ui", "sans-serif"],
            },
            animation: {
                blink: "blink 1s step-end infinite",
                glow: "glow 2s ease-in-out infinite alternate",
                "float": "float 6s ease-in-out infinite",
                "pulse-neon": "pulse-neon 2s ease-in-out infinite",
                "grid-move": "grid-move 20s linear infinite",
                "typewriter": "typewriter 3.5s steps(40) 1s forwards",
            },
            keyframes: {
                blink: {
                    "0%, 100%": { opacity: "1" },
                    "50%": { opacity: "0" },
                },
                glow: {
                    "0%": { boxShadow: "0 0 5px rgba(0, 255, 65, 0.3), 0 0 10px rgba(0, 255, 65, 0.1)" },
                    "100%": { boxShadow: "0 0 20px rgba(0, 255, 65, 0.6), 0 0 40px rgba(0, 255, 65, 0.3)" },
                },
                "float": {
                    "0%, 100%": { transform: "translateY(0px)" },
                    "50%": { transform: "translateY(-20px)" },
                },
                "pulse-neon": {
                    "0%, 100%": { opacity: "1" },
                    "50%": { opacity: "0.5" },
                },
                "grid-move": {
                    "0%": { transform: "translateY(0)" },
                    "100%": { transform: "translateY(-50%)" },
                },
                typewriter: {
                    "0%": { width: "0" },
                    "100%": { width: "100%" },
                },
            },
            backgroundImage: {
                "cyber-gradient": "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)",
            },
        },
    },
    plugins: [],
};

export default config;
