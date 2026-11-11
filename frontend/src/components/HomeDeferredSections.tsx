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
            <Timeline initialTimelines={initialTimelines} />
            <Projects initialProjects={initialProjects} />
            <Certificates initialCertificates={initialCertificates} />
            <Blog initialBlogs={initialBlogs} />
            <PhotoGallery />
            <TravelGlobeSection initialTravels={initialTravels} />
            <Footer />
        </>
    );
}
