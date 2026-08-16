import type { Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { fontVariables } from "../fonts";
import "../globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.keremduz.com";
const directApiUrl = process.env.NEXT_PUBLIC_API_URL;

function getOrigin(url: string | undefined): string | null {
    if (!url) return null;
    try {
        return new URL(url).origin;
    } catch {
        return null;
    }
}

const directApiOrigin = getOrigin(directApiUrl);

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

// Per-language title and description. Previously both locales inherited the
// same English strings, so the Turkish page — the one most people searching
// "Kerem Düz" will land on — advertised itself in English.
const SEO = {
    tr: {
        title: "Kerem Düz | Siber Güvenlik & Yazılım Geliştirici",
        description:
            "Kerem Düz — Bilgisayar Mühendisliği öğrencisi, siber güvenlik ve yazılım geliştirme üzerine çalışıyor. Projeler, sertifikalar ve dünya turu.",
        alt: "Kerem Düz — Siber Güvenlik & Yazılım Geliştirici",
    },
    en: {
        title: "Kerem Düz | Cyber Security & Software Developer",
        description:
            "Kerem Düz — Computer Engineering student working in cyber security and software development. Projects, certificates and travels around the world.",
        alt: "Kerem Düz — Cyber Security & Software Developer",
    },
} as const;

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const seo = SEO[locale as keyof typeof SEO] ?? SEO.tr;

    return {
        metadataBase: new URL(siteUrl),
        title: { absolute: seo.title },
        description: seo.description,
        applicationName: "Kerem Düz",
        authors: [{ name: "Kerem Düz", url: siteUrl }],
        creator: "Kerem Düz",
        publisher: "Kerem Düz",
        keywords: [
            "Kerem Düz",
            "Kerem Duz",
            "siber güvenlik",
            "cyber security",
            "penetrasyon testi",
            "Bilgisayar Mühendisliği",
            "Akdeniz Üniversitesi",
            "yazılım geliştirici",
            "portfolio",
        ],
        ...(process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION && {
            verification: { google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION },
        }),
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                "max-image-preview": "large",
                "max-snippet": -1,
                "max-video-preview": -1,
            },
        },
        alternates: {
            canonical: `/${locale}`,
            languages: {
                "tr-TR": "/tr",
                "en-US": "/en",
                "x-default": "/tr",
            },
        },
        openGraph: {
            type: "profile",
            siteName: "Kerem Düz",
            title: seo.title,
            description: seo.description,
            url: `${siteUrl}/${locale}`,
            locale: locale === "tr" ? "tr_TR" : "en_US",
            alternateLocale: locale === "tr" ? "en_US" : "tr_TR",
            images: [{ url: "/og.png", width: 1200, height: 630, alt: seo.alt }],
        },
        twitter: {
            card: "summary_large_image",
            title: seo.title,
            description: seo.description,
            images: ["/og.png"],
        },
    };
}

import AnalyticsTracker from "@/components/AnalyticsTracker";
import PersonSchema from "@/components/PersonSchema";
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

    setRequestLocale(locale);
    const messages = await getMessages();

    return (
        <html
            lang={locale}
            data-scroll-behavior="smooth"
            className={`dark ${fontVariables}`}
            suppressHydrationWarning
        >
            <head>
                {directApiOrigin && <link rel="preconnect" href={directApiOrigin} crossOrigin="" />}
                {directApiOrigin && <link rel="dns-prefetch" href={directApiOrigin} />}
                <link
                    rel="preload"
                    as="image"
                    media="(min-width: 1024px)"
                    href="/profile/kerem-1280.webp"
                    imageSrcSet="/profile/kerem-480.webp 480w, /profile/kerem-720.webp 720w, /profile/kerem-960.webp 960w, /profile/kerem-1280.webp 1280w, /profile/kerem-1600.webp 1600w"
                    imageSizes="65vw"
                    fetchPriority="high"
                />
                <link
                    rel="preload"
                    as="image"
                    media="(max-width: 1023px)"
                    href="/profile/kerem-wide-1080.webp"
                    imageSrcSet="/profile/kerem-wide-720.webp 720w, /profile/kerem-wide-1080.webp 1080w, /profile/kerem-wide-1440.webp 1440w"
                    imageSizes="100vw"
                    fetchPriority="high"
                />
            </head>
            <body className="bg-dark-bg text-gray-200 font-sans antialiased" suppressHydrationWarning>
                <PersonSchema locale={locale} />
                {process.env.NEXT_PUBLIC_GA_ID && <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />}
                <NextIntlClientProvider messages={messages}>
                    <AnalyticsTracker />
                    {children}
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
