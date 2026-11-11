import type { LucideIcon } from "lucide-react";
import {
    Bot,
    Brain,
    Building2,
    Calculator,
    CalendarCheck,
    Camera,
    Car,
    Dumbbell,
    Globe,
    GraduationCap,
    Heart,
    Hotel,
    MapPin,
    PawPrint,
    QrCode,
    Salad,
    Scale,
    Scissors,
    Search,
    ShieldCheck,
    ShoppingBag,
    Smile,
    Sparkles,
    Stethoscope,
    UtensilsCrossed,
} from "lucide-react";

type Localized = { tr: string; en: string };

export interface WebService {
    icon: LucideIcon;
    title: Localized;
    description: Localized;
}

export interface Sector {
    icon: LucideIcon;
    label: Localized;
}

export interface ProcessStep {
    title: Localized;
    description: Localized;
}

/** What I offer to businesses, shown on the projects page. */
export const webServices: WebService[] = [
    {
        icon: Globe,
        title: { tr: "Mesleğinize özel web sitesi", en: "A website made for your trade" },
        description: {
            tr: "Avukat, diş hekimi, diyetisyen, berber… Her meslek için müşterinize güven veren, mobil uyumlu ve hızlı açılan siteler.",
            en: "Lawyers, dentists, dietitians, barbers… Fast, mobile-friendly sites that make your clients trust you at first glance.",
        },
    },
    {
        icon: Search,
        title: { tr: "SEO ile Google'da üst sıralar", en: "SEO to rank higher on Google" },
        description: {
            tr: "\"Antalya diş hekimi\" gibi aramalarda öne çıkmanız için teknik SEO, yerel SEO ve içerik düzenlemesi.",
            en: "Technical SEO, local SEO and content work so you show up when people search for your service in your city.",
        },
    },
    {
        icon: MapPin,
        title: { tr: "Google Haritalar & İşletme Profili", en: "Google Maps & Business Profile" },
        description: {
            tr: "Google İşletme Profilinizi kurup düzenliyorum: haritada bulunun, yol tarifi alınsın, yorumlarınız görünsün.",
            en: "I set up and polish your Google Business Profile so customers find you on the map, get directions and see your reviews.",
        },
    },
    {
        icon: Bot,
        title: { tr: "Yapay zeka asistanı", en: "AI assistant" },
        description: {
            tr: "Sitenize 7/24 soruları yanıtlayan, randevu ve teklif taleplerini toplayan yapay zeka sohbet asistanı.",
            en: "An AI chat assistant on your site that answers questions 24/7 and collects booking and quote requests.",
        },
    },
    {
        icon: CalendarCheck,
        title: { tr: "Online randevu & rezervasyon", en: "Online booking & reservations" },
        description: {
            tr: "Müşterileriniz telefonu beklemeden randevu alsın. Berber, klinik, diyetisyen ve restoranlar için ideal.",
            en: "Let customers book without calling. Ideal for barbers, clinics, dietitians and restaurants.",
        },
    },
    {
        icon: QrCode,
        title: { tr: "Restoranlara dijital & QR menü", en: "Digital & QR menus for restaurants" },
        description: {
            tr: "Masadaki QR kodla açılan, fotoğraflı, çok dilli ve fiyatları anında güncellenebilen menüler.",
            en: "Photo-rich, multilingual menus that open from a table QR code, with prices you can update instantly.",
        },
    },
    {
        icon: Heart,
        title: { tr: "Düğün & nişan davetiyeleri", en: "Wedding & engagement invitations" },
        description: {
            tr: "Fotoğraflı, müzikli, konum ve katılım (LCV) formlu, linkle paylaşılan dijital davetiye siteleri.",
            en: "Shareable invitation sites with photos, music, a map and an RSVP form.",
        },
    },
    {
        icon: ShoppingBag,
        title: { tr: "E-ticaret & online satış", en: "E-commerce & online sales" },
        description: {
            tr: "Ürünlerinizi internetten satın: ürün kataloğu, sepet, online ödeme ve sipariş takibi.",
            en: "Sell online with a product catalogue, cart, online payments and order tracking.",
        },
    },
    {
        icon: ShieldCheck,
        title: { tr: "Güvenlik, bakım & destek", en: "Security, upkeep & support" },
        description: {
            tr: "Siber güvenlik geçmişimle sitenizi koruyorum: SSL, yedekleme, güncellemeler ve yayından sonra da destek.",
            en: "With my cyber security background I keep your site safe: SSL, backups, updates and support after launch.",
        },
    },
];

/** Who it's for. Not exhaustive — the point is "any trade". */
export const sectors: Sector[] = [
    { icon: Scale, label: { tr: "Hukuk büroları", en: "Law firms" } },
    { icon: Smile, label: { tr: "Diş hekimleri", en: "Dentists" } },
    { icon: Salad, label: { tr: "Diyetisyenler", en: "Dietitians" } },
    { icon: Scissors, label: { tr: "Berber & kuaförler", en: "Barbers & salons" } },
    { icon: UtensilsCrossed, label: { tr: "Restoran & kafeler", en: "Restaurants & cafés" } },
    { icon: Stethoscope, label: { tr: "Klinik & doktorlar", en: "Clinics & doctors" } },
    { icon: Building2, label: { tr: "Emlak & inşaat", en: "Real estate & construction" } },
    { icon: Brain, label: { tr: "Psikolog & danışmanlar", en: "Therapists & consultants" } },
    { icon: Dumbbell, label: { tr: "Spor salonları", en: "Gyms & trainers" } },
    { icon: Sparkles, label: { tr: "Güzellik merkezleri", en: "Beauty centres" } },
    { icon: Hotel, label: { tr: "Otel & pansiyonlar", en: "Hotels & guesthouses" } },
    { icon: Camera, label: { tr: "Fotoğrafçılar", en: "Photographers" } },
    { icon: Calculator, label: { tr: "Mali müşavirler", en: "Accountants" } },
    { icon: Car, label: { tr: "Oto galeri & servis", en: "Car dealers & garages" } },
    { icon: GraduationCap, label: { tr: "Kurs & eğitim", en: "Courses & tutoring" } },
    { icon: PawPrint, label: { tr: "Veteriner klinikleri", en: "Vet clinics" } },
];

export const processSteps: ProcessStep[] = [
    {
        title: { tr: "Tanışalım", en: "We talk" },
        description: {
            tr: "Bir telefonla işinizi ve ihtiyaçlarınızı konuşuyoruz, size özel teklif hazırlıyorum.",
            en: "One phone call to understand your business and needs, then a tailored quote.",
        },
    },
    {
        title: { tr: "Tasarım", en: "Design" },
        description: {
            tr: "Markanıza özel tasarımı birlikte şekillendiriyoruz; onayınız olmadan ilerlemiyorum.",
            en: "We shape a design around your brand together; nothing moves on without your approval.",
        },
    },
    {
        title: { tr: "Geliştirme", en: "Build" },
        description: {
            tr: "Siteyi hızlı, mobil uyumlu ve güvenli şekilde kodluyor, içerikleri yerleştiriyorum.",
            en: "I build the site fast, mobile-friendly and secure, and put your content in place.",
        },
    },
    {
        title: { tr: "Yayın & SEO", en: "Launch & SEO" },
        description: {
            tr: "Alan adı, Google kaydı ve SEO ayarlarıyla yayına alıyorum; sonrasında da destek veriyorum.",
            en: "Domain, Google indexing and SEO set up at launch, with support afterwards.",
        },
    },
];
