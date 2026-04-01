"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const Timeline = dynamic(() => import("@/components/Timeline"), {
    ssr: false,
    loading: () => <div className="min-h-[480px]" />,
});

const Projects = dynamic(() => import("@/components/Projects"), {
    ssr: false,
    loading: () => <div className="min-h-[480px]" />,
});

const Certificates = dynamic(() => import("@/components/Certificates"), {
    ssr: false,
    loading: () => <div className="min-h-[480px]" />,
});

const Blog = dynamic(() => import("@/components/Blog"), {
    ssr: false,
    loading: () => <div className="min-h-[480px]" />,
});

const PhotoGallery = dynamic(() => import("@/components/PhotoGallery"), {
    ssr: false,
    loading: () => <div className="min-h-[520px]" />,
});

const TravelGlobeSection = dynamic(() => import("@/components/TravelGlobeSection"), {
    ssr: false,
    loading: () => <div className="min-h-[620px]" />,
});

const Footer = dynamic(() => import("@/components/Footer"), {
    ssr: false,
    loading: () => <div className="min-h-[160px]" />,
});

export default function HomeDeferredSections() {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const start = () => setReady(true);

        if ("requestIdleCallback" in window) {
            const idleId = (window as any).requestIdleCallback(start, { timeout: 1200 });
            return () => {
                if ("cancelIdleCallback" in window) {
                    (window as any).cancelIdleCallback(idleId);
                }
            };
        }

        const timeoutId = setTimeout(start, 400);
        return () => clearTimeout(timeoutId);
    }, []);

    if (!ready) {
        return <div style={{ minHeight: "1400px" }} />;
    }

    return (
        <>
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
        </>
    );
}
