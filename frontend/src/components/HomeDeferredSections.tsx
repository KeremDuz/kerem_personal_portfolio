import Timeline from "@/components/Timeline";
import Certificates from "@/components/Certificates";
import Blog from "@/components/Blog";
import PhotoGallery from "@/components/PhotoGallery";
import TravelGlobeSection from "@/components/TravelGlobeSection";
import Footer from "@/components/Footer";
import type {
    BlogPost,
    Certificate,
    TimelineItem,
    Travel,
} from "@/lib/api";

type HomeDeferredSectionsProps = {
    initialTimelines?: TimelineItem[];
    initialCertificates?: Certificate[];
    initialBlogs?: BlogPost[];
    initialTravels?: Travel[];
};

export default function HomeDeferredSections({
    initialTimelines = [],
    initialCertificates = [],
    initialBlogs = [],
    initialTravels = [],
}: HomeDeferredSectionsProps) {
    return (
        <>
            <Timeline initialTimelines={initialTimelines} />
            <Certificates initialCertificates={initialCertificates} />
            <Blog initialBlogs={initialBlogs} />
            <PhotoGallery />
            <TravelGlobeSection initialTravels={initialTravels} />
            <Footer />
        </>
    );
}
