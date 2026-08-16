import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";

export const inter = Inter({
    subsets: ["latin", "latin-ext"],
    variable: "--font-inter",
    display: "swap",
});

export const spaceGrotesk = Space_Grotesk({
    subsets: ["latin", "latin-ext"],
    variable: "--font-display",
    display: "swap",
});

export const jetbrainsMono = JetBrains_Mono({
    subsets: ["latin", "latin-ext"],
    variable: "--font-mono",
    display: "swap",
});

export const fontVariables = [
    inter.variable,
    spaceGrotesk.variable,
    jetbrainsMono.variable,
].join(" ");
