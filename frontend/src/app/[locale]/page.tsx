import Header from "@/components/Header";
import Hero from "@/components/Hero";
import About from "@/components/About";
import ClientEffects from "@/components/ClientEffects";
import HomeDeferredSections from "@/components/HomeDeferredSections";
import AgentAssistantWidget from "@/components/AgentAssistantWidget";
import type { Project, TimelineItem } from "@/lib/api";

export const dynamic = "force-dynamic";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://antigravitywebsite.onrender.com/api";

async function fetchPublicList<T>(endpoint: string): Promise<T[]> {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            cache: "no-store",
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

export default async function Home() {
    const [initialTimelines, initialProjects] = await Promise.all([
        fetchPublicList<TimelineItem>("/timeline"),
        fetchPublicList<Project>("/projects"),
    ]);

    return (
        <main className="min-h-screen bg-dark-bg">
            <ClientEffects />
            <Header />
            <Hero />
            <About />

            <HomeDeferredSections
                initialProjects={initialProjects}
                initialTimelines={initialTimelines}
            />
            <AgentAssistantWidget />
        </main >
    );
}
