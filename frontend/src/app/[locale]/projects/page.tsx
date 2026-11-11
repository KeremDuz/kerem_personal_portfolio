import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Header from "@/components/Header";
import ClientEffects from "@/components/ClientEffects";
import ClientWebsites from "@/components/ClientWebsites";
import Projects from "@/components/Projects";
import Footer from "@/components/Footer";
import {
    CallBand,
    FloatingCallButton,
    ProcessSection,
    SectorsSection,
    ServicesSection,
    WorkHero,
} from "@/components/WorkSections";
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

/** Work page: what I build for businesses, examples, how to call me — then my own projects. */
export default async function ProjectsPage({ params }: PageProps) {
    const { locale } = await params;
    setRequestLocale(locale);
    const initialProjects = await fetchPublicList<Project>("/projects");

    return (
        <main className="min-h-screen bg-dark-bg">
            <ClientEffects />
            <Header />

            <WorkHero />
            <ServicesSection />
            <SectorsSection />
            <ClientWebsites />
            <ProcessSection />
            <CallBand />
            <Projects initialProjects={initialProjects} />
            <FloatingCallButton />
            <Footer />
        </main>
    );
}
