import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.keremduz.com";
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://antigravitywebsite.onrender.com/api";

function getOrigin(url: string): string {
    try {
        return new URL(url).origin;
    } catch {
        return "https://antigravitywebsite.onrender.com";
    }
}

const apiOrigin = getOrigin(apiUrl);

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
        <html lang="tr" className="dark" suppressHydrationWarning>
            <head>
                <link rel="preconnect" href={apiOrigin} crossOrigin="" />
                <link rel="dns-prefetch" href={apiOrigin} />
            </head>
            <body className="bg-dark-bg text-gray-200 font-sans antialiased" suppressHydrationWarning>
                {children}
            </body>
        </html>
    );
}