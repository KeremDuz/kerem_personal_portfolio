import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.keremduz.com";

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date();

    // Each entry declares its translation, so Google treats the two locales as
    // one page in two languages instead of duplicate content.
    const languages = {
        tr: `${siteUrl}/tr`,
        en: `${siteUrl}/en`,
        "x-default": `${siteUrl}/tr`,
    };

    return [
        {
            url: `${siteUrl}/tr`,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 1,
            alternates: { languages },
        },
        {
            url: `${siteUrl}/en`,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.9,
            alternates: { languages },
        },
    ];
}