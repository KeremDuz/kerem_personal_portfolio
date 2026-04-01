import Header from "@/components/Header";
import Hero from "@/components/Hero";
import About from "@/components/About";
import ClientEffects from "@/components/ClientEffects";
import HomeDeferredSections from "@/components/HomeDeferredSections";

export default function Home() {
    return (
        <main className="min-h-screen bg-dark-bg">
            <ClientEffects />
            <Header />
            <Hero />
            <About />

            <HomeDeferredSections />
        </main >
    );
}
