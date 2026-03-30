import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

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
    title: "Kerem Düz",
    description: "Kerem Düz personal website",
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