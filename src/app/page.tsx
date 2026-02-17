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
import BootSequence from "@/components/BootSequence";
import ScrollProgress from "@/components/ScrollProgress";
import CustomCursor from "@/components/CustomCursor";
import AmbientMusic from "@/components/AmbientMusic";

export default function Home() {
    return (
        <main className="min-h-screen bg-dark-bg">
            <BootSequence />
            <CustomCursor />
            <ScrollProgress />
            <AmbientMusic />
            <Header />
            <Hero />
            <About />

            <Timeline />
            <Projects />
            <Certificates />
            <Blog />
            <PhotoGallery />
            <TravelGlobeSection />
            <Footer />
        </main>
    );
}
