/**
 * Websites built for clients, shown under the "Websites" tab of the Projects
 * section. To add a new one: drop a 16:10 screenshot into
 * `public/websites/` and append an entry here (newest first).
 */
export interface ClientWebsite {
    name: string;
    url: string;
    /** Path under /public. */
    image: string;
    category: { tr: string; en: string };
    description: { tr: string; en: string };
}

const clientWebsites: ClientWebsite[] = [
    {
        name: "KA Emlak",
        url: "https://kaemlak.com",
        image: "/websites/kaemlak.jpg",
        category: { tr: "Gayrimenkul", en: "Real Estate" },
        description: {
            tr: "Antalya'da satılık, kiralık ve dönemlik kiralık gayrimenkul sunan KA Emlak için ilan sitesi. Bölge, tür ve fiyata göre ilan arama, ilan detayları ve tek dokunuşla arama; Türkçe/İngilizce.",
            en: "Listings site for KA Emlak, an Antalya real-estate agency for sales, rentals and short-term lets. Search by area, type and price, detailed listings and one-tap calling, in Turkish and English.",
        },
    },
    {
        name: "İshak Kahraman",
        url: "https://ishakkahraman.com.tr",
        image: "/websites/ishakkahraman.jpg",
        category: { tr: "Kişisel Marka", en: "Personal Brand" },
        description: {
            tr: "Antalya merkezli iş insanı İshak Kahraman için kişisel marka sitesi. İş hayatı, sivil toplum çalışmaları ve ATSO meslek komitesi adaylığını tek bir yerde anlatan, aday tanıtımına odaklı bir tasarım.",
            en: "Personal brand site for Antalya-based entrepreneur İshak Kahraman, presenting his business career, civil-society work and chamber-of-commerce candidacy in one place.",
        },
    },
    {
        name: "Pera Signature Invest",
        url: "https://www.perasignatureinvest.com.tr",
        image: "/websites/perasignatureinvest.jpg",
        category: { tr: "Gayrimenkul", en: "Real Estate" },
        description: {
            tr: "Antalya'da lüks gayrimenkul ve yatırım danışmanlığı yapan Pera Signature Invest için kurumsal site. Portföy, hizmetler ve randevu akışı; açık/koyu tema ve yerel SEO ile.",
            en: "Corporate site for Pera Signature Invest, a luxury real-estate and investment consultancy in Antalya. Portfolio, services and appointment flow, with light/dark themes and local SEO.",
        },
    },
];

export default clientWebsites;
