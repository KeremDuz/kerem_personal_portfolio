import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "../globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

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

export default async function RootLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    if (!routing.locales.includes(locale as any)) {
        notFound();
    }

    const messages = await getMessages();

    return (
        <html lang={locale} className={`dark ${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
            <body className="bg-dark-bg text-gray-200 font-sans antialiased" suppressHydrationWarning>
                <NextIntlClientProvider messages={messages}>
                    {children}
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
