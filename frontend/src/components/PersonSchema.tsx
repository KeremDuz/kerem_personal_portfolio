import { routing } from "@/i18n/routing";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.keremduz.com";

const PROFILES = [
    "https://github.com/KeremDuz",
    "https://www.linkedin.com/in/kerem-d%C3%BCz-687741236/",
    "https://www.instagram.com/kerem_plain",
];

const COPY = {
    tr: {
        jobTitle: "Siber Güvenlik & Yazılım Geliştirici",
        description:
            "Bilgisayar Mühendisliği öğrencisi. Siber güvenlik, ağ güvenliği, penetrasyon testi ve yazılım geliştirme üzerine çalışıyor.",
        knowsAbout: [
            "Siber Güvenlik",
            "Ağ Güvenliği",
            "Penetrasyon Testi",
            "Zararlı Yazılım Analizi",
            "Yazılım Geliştirme",
            "Python",
            "Next.js",
            "Linux",
        ],
    },
    en: {
        jobTitle: "Cyber Security & Software Developer",
        description:
            "Computer Engineering student working in cyber security, network security, penetration testing and software development.",
        knowsAbout: [
            "Cyber Security",
            "Network Security",
            "Penetration Testing",
            "Malware Analysis",
            "Software Development",
            "Python",
            "Next.js",
            "Linux",
        ],
    },
} as const;

/**
 * Schema.org `Person` + `WebSite` markup.
 *
 * This is what lets a search for "Kerem Düz" resolve to *him* — it ties the
 * name, the job title, the photo and every social profile together as one
 * entity instead of a page that merely mentions a name. `sameAs` is the part
 * that does the linking, so it must list the real profile URLs.
 */
export default function PersonSchema({ locale }: { locale: string }) {
    const lang = (locale === "en" ? "en" : "tr") as keyof typeof COPY;
    const copy = COPY[lang];
    const pageUrl = `${siteUrl}/${lang}`;

    const person = {
        "@type": "Person",
        "@id": `${siteUrl}/#kerem-duz`,
        name: "Kerem Düz",
        // Searches are just as likely to be typed without the diacritic.
        alternateName: ["Kerem Duz", "Kerem DÜZ"],
        url: siteUrl,
        image: `${siteUrl}/og.png`,
        jobTitle: copy.jobTitle,
        description: copy.description,
        nationality: { "@type": "Country", name: "Türkiye" },
        alumniOf: {
            "@type": "CollegeOrUniversity",
            name: "Akdeniz Üniversitesi",
            sameAs: "https://www.akdeniz.edu.tr/",
        },
        knowsLanguage: ["tr", "en"],
        knowsAbout: copy.knowsAbout,
        sameAs: PROFILES,
    };

    const website = {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "Kerem Düz",
        inLanguage: routing.locales,
        publisher: { "@id": `${siteUrl}/#kerem-duz` },
    };

    const profilePage = {
        "@type": "ProfilePage",
        "@id": `${pageUrl}#page`,
        url: pageUrl,
        name: copy.jobTitle,
        inLanguage: lang === "tr" ? "tr-TR" : "en-US",
        isPartOf: { "@id": `${siteUrl}/#website` },
        about: { "@id": `${siteUrl}/#kerem-duz` },
        mainEntity: { "@id": `${siteUrl}/#kerem-duz` },
    };

    const graph = { "@context": "https://schema.org", "@graph": [person, website, profilePage] };

    return (
        <script
            type="application/ld+json"
            // Serialised from an object literal we control — no user input
            // reaches this, and `<` is escaped so it cannot close the tag.
            dangerouslySetInnerHTML={{
                __html: JSON.stringify(graph).replace(/</g, "\\u003c"),
            }}
        />
    );
}
