import Header from "@/components/Header";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Timeline from "@/components/Timeline";
import Projects from "@/components/Projects";
import Certificates from "@/components/Certificates";
import Blog from "@/components/Blog";
import PhotoGallery from "@/components/PhotoGallery";
import TravelGlobeSection from "@/components/TravelGlobeSection";
import Footer from "@/components/Footer";
import ClientEffects from "@/components/ClientEffects";

export default function Home() {
    return (
        <main className="min-h-screen bg-dark-bg">
            <ClientEffects />
            <Header />
            <Hero />
            <About />

            <div style={{ contentVisibility: "auto", containIntrinsicSize: "1000px" }}>
                <Timeline />
            </div>
            <div style={{ contentVisibility: "auto", containIntrinsicSize: "1000px" }}>
                <Projects />
            </div>
            <div style={{ contentVisibility: "auto", containIntrinsicSize: "1000px" }}>
                <Certificates />
            </div>
            <div style={{ contentVisibility: "auto", containIntrinsicSize: "1000px" }}>
                <Blog />
            </div>
            <div style={{ contentVisibility: "auto", containIntrinsicSize: "1000px" }}>
                <PhotoGallery />
            </div>
            <div style={{ contentVisibility: "auto", containIntrinsicSize: "1200px" }}>
                <TravelGlobeSection />
            </div>
            <Footer />
        </main >
    );
}
