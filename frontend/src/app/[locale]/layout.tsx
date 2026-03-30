import type { Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

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

import AnalyticsTracker from "@/components/AnalyticsTracker";
import { GoogleAnalytics } from "@next/third-parties/google";

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
        <>
            {process.env.NEXT_PUBLIC_GA_ID && <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />}
            <NextIntlClientProvider messages={messages}>
                <AnalyticsTracker />
                {children}
            </NextIntlClientProvider>
        </>
    );
}
