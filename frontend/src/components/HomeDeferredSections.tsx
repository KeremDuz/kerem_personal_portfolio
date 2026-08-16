import Timeline from "@/components/Timeline";
import Projects from "@/components/Projects";
import Certificates from "@/components/Certificates";
import Blog from "@/components/Blog";
import PhotoGallery from "@/components/PhotoGallery";
import TravelGlobeSection from "@/components/TravelGlobeSection";
import Footer from "@/components/Footer";
import type {
    BlogPost,
    Certificate,
    Project,
    TimelineItem,
    Travel,
} from "@/lib/api";

type HomeDeferredSectionsProps = {
    initialProjects?: Project[];
    initialTimelines?: TimelineItem[];
    initialCertificates?: Certificate[];
    initialBlogs?: BlogPost[];
    initialTravels?: Travel[];
};

export default function HomeDeferredSections({
    initialProjects = [],
    initialTimelines = [],
    initialCertificates = [],
    initialBlogs = [],
    initialTravels = [],
}: HomeDeferredSectionsProps) {
    return (
        <>
            <div style={{ contentVisibility: "auto", containIntrinsicSize: "1000px" }}>
                <Timeline initialTimelines={initialTimelines} />
            </div>
            <div style={{ contentVisibility: "auto", containIntrinsicSize: "1000px" }}>
                <Projects initialProjects={initialProjects} />
            </div>
            <div style={{ contentVisibility: "auto", containIntrinsicSize: "1000px" }}>
                <Certificates initialCertificates={initialCertificates} />
            </div>
            <div style={{ contentVisibility: "auto", containIntrinsicSize: "1000px" }}>
                <Blog initialBlogs={initialBlogs} />
            </div>
            <div style={{ contentVisibility: "auto", containIntrinsicSize: "1000px" }}>
                <PhotoGallery />
            </div>
            <div style={{ contentVisibility: "auto", containIntrinsicSize: "1200px" }}>
                <TravelGlobeSection initialTravels={initialTravels} />
            </div>
            <Footer />
        </>
    );
}
