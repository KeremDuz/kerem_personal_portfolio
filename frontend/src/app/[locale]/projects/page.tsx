import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import ClientEffects from "@/components/ClientEffects";
import ClientWebsites from "@/components/ClientWebsites";
import Projects from "@/components/Projects";
import Footer from "@/components/Footer";
import { Link } from "@/i18n/routing";
import type { Project } from "@/lib/api";
import { fetchPublicList } from "@/lib/serverApi";

export const revalidate = 300;

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "ProjectsPage" });

    return {
        title: { absolute: t("metaTitle") },
        description: t("metaDesc"),
        alternates: {
            canonical: `/${locale}/projects`,
            languages: {
                "tr-TR": "/tr/projects",
                "en-US": "/en/projects",
                "x-default": "/tr/projects",
            },
        },
        openGraph: {
            title: t("metaTitle"),
            description: t("metaDesc"),
            url: `/${locale}/projects`,
        },
    };
}

/** Work page: client websites first (the part people hire for), then projects. */
export default async function ProjectsPage({ params }: PageProps) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations("ProjectsPage");
    const initialProjects = await fetchPublicList<Project>("/projects");

    return (
        <main className="min-h-screen bg-dark-bg">
            <ClientEffects />
            <Header />

            <section className="relative pt-32 md:pt-40">
                <div className="mx-auto max-w-4xl px-6">
                    <Link
                        href="/"
                        className="mb-8 inline-flex items-center gap-1.5 font-mono text-xs text-gray-500 transition-colors hover:text-cyber-green"
                    >
                        <ArrowLeft size={14} />
                        {t("back")}
                    </Link>

                    <p className="mb-3 font-mono text-sm text-cyber-green/60">{t("tag")}</p>
                    <h1 className="text-4xl font-bold text-gray-100 md:text-6xl">
                        {t("title1")} <span className="text-gradient-cyber">{t("title2")}</span>
                    </h1>
                    <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-400 md:text-lg">
                        {t("desc")}
                    </p>

                    <div className="mt-8 flex flex-wrap gap-2">
                        <a href="#websites" className="btn btn-primary">
                            {t("jumpWebsites")}
                        </a>
                        <a href="#projects" className="btn btn-ghost">
                            {t("jumpProjects")}
                        </a>
                    </div>
                </div>
            </section>

            <ClientWebsites />
            <Projects initialProjects={initialProjects} />
            <Footer />
        </main>
    );
}
