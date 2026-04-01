import type { Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.keremduz.com";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;

    return {
        alternates: {
            canonical: `/${locale}`,
            languages: {
                "tr-TR": "/tr",
                "en-US": "/en",
                "x-default": "/tr",
            },
        },
        openGraph: {
            url: `${siteUrl}/${locale}`,
            locale: locale === "tr" ? "tr_TR" : "en_US",
        },
    };
}

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
