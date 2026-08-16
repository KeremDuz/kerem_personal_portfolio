import Header from "@/components/Header";
import Hero from "@/components/Hero";
import About from "@/components/About";
import ClientEffects from "@/components/ClientEffects";
import HomeDeferredSections from "@/components/HomeDeferredSections";
import type {
    AboutData,
    BlogPost,
    Certificate,
    Project,
    TimelineItem,
    Travel,
} from "@/lib/api";
import { serverApiBase } from "@/lib/config";

// Rendered once and refreshed every five minutes, rather than rebuilt on every
// request. The content only changes when the admin panel is used, and the old
// `force-dynamic` meant each crawl depended on the API being awake — a sleeping
// free-tier backend would have served Google a page with no projects on it.
export const revalidate = 300;

async function fetchPublicList<T>(endpoint: string): Promise<T[]> {
    try {
        const response = await fetch(`${serverApiBase}${endpoint}`, {
            next: { revalidate: 300 },
            signal: AbortSignal.timeout(5_000),
        });

        if (!response.ok) {
            return [];
        }

        const data = await response.json();
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}

async function fetchPublicObject<T>(endpoint: string): Promise<T | null> {
    try {
        const response = await fetch(`${serverApiBase}${endpoint}`, {
            next: { revalidate: 300 },
            signal: AbortSignal.timeout(5_000),
        });
        return response.ok ? await response.json() as T : null;
    } catch {
        return null;
    }
}

export default async function Home() {
    const [
        initialAbout,
        initialTimelines,
        initialProjects,
        initialCertificates,
        initialBlogs,
        initialTravels,
    ] = await Promise.all([
        fetchPublicObject<AboutData>("/about"),
        fetchPublicList<TimelineItem>("/timeline"),
        fetchPublicList<Project>("/projects"),
        fetchPublicList<Certificate>("/certificates"),
        fetchPublicList<BlogPost>("/blogs"),
        fetchPublicList<Travel>("/travel"),
    ]);

    return (
        <main className="min-h-screen bg-dark-bg">
            <ClientEffects />
            <Header />
            <Hero />
            <About initialAbout={initialAbout} />

            <HomeDeferredSections
                initialProjects={initialProjects}
                initialTimelines={initialTimelines}
                initialCertificates={initialCertificates}
                initialBlogs={initialBlogs}
                initialTravels={initialTravels}
            />
        </main >
    );
}
