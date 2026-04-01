import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.keremduz.com";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
    subsets: ["latin"],
    variable: "--font-mono",
    display: "swap",
});

export const metadata: Metadata = {
    metadataBase: new URL(siteUrl),
    title: {
        default: "Kerem Düz | Cyber Security & World Traveler",
        template: "%s | Kerem Düz",
    },
    description:
        "Personal portfolio of Kerem Düz — Computer Engineering Student, Cyber Security Enthusiast, and World Traveler.",
    keywords: [
        "Kerem Düz",
        "Kerem Duz",
        "Cyber Security",
        "Computer Engineering",
        "Portfolio",
        "Travel",
        "Developer",
    ],
    openGraph: {
        type: "website",
        siteName: "Kerem Düz",
        title: "Kerem Düz | Cyber Security & World Traveler",
        description:
            "Computer Engineering Student, Cyber Security Enthusiast, and World Traveler.",
        url: siteUrl,
        locale: "tr_TR",
    },
    twitter: {
        card: "summary_large_image",
        title: "Kerem Düz | Cyber Security & World Traveler",
        description:
            "Computer Engineering Student, Cyber Security Enthusiast, and World Traveler.",
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="tr" className={`dark ${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
            <body className="bg-dark-bg text-gray-200 font-sans antialiased" suppressHydrationWarning>
                {children}
            </body>
        </html>
    );
}