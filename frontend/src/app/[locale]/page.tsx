import Header from "@/components/Header";
import Hero from "@/components/Hero";
import About from "@/components/About";
import ClientEffects from "@/components/ClientEffects";
import HomeDeferredSections from "@/components/HomeDeferredSections";
import type {
    AboutData,
    BlogPost,
    Certificate,
    TimelineItem,
    Travel,
} from "@/lib/api";
import { fetchPublicList, fetchPublicObject } from "@/lib/serverApi";

// Rendered once and refreshed every five minutes, rather than rebuilt on every
// request. The content only changes when the admin panel is used, and the old
// `force-dynamic` meant each crawl depended on the API being awake — a sleeping
// free-tier backend would have served Google a page with no projects on it.
export const revalidate = 300;

export default async function Home() {
    const [
        initialAbout,
        initialTimelines,
        initialCertificates,
        initialBlogs,
        initialTravels,
    ] = await Promise.all([
        fetchPublicObject<AboutData>("/about"),
        fetchPublicList<TimelineItem>("/timeline"),
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
                initialTimelines={initialTimelines}
                initialCertificates={initialCertificates}
                initialBlogs={initialBlogs}
                initialTravels={initialTravels}
            />
        </main>
    );
}
