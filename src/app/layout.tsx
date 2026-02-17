import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Kerem Düz | Cyber Security & World Traveler",
    description:
        "Personal portfolio of Kerem Düz — Computer Engineering Student, Cyber Security Enthusiast, and World Traveler. Explore projects, skills, and travel memories.",
    keywords: [
        "Kerem Düz",
        "Cyber Security",
        "Computer Engineering",
        "Portfolio",
        "Travel",
        "Developer",
    ],
    openGraph: {
        title: "Kerem Düz | Cyber Security & World Traveler",
        description:
            "Computer Engineering Student, Cyber Security Enthusiast, and World Traveler.",
        type: "website",
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="tr" className="dark" suppressHydrationWarning>
            <body className="bg-dark-bg text-gray-200 font-sans antialiased" suppressHydrationWarning>
                {children}
            </body>
        </html>
    );
}
