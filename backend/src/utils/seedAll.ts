import dotenv from "dotenv";
import path from "path";
import mongoose from "mongoose";
import Travel from "../models/Travel";
import Project from "../models/Project";
import Certificate from "../models/Certificate";
import Blog from "../models/Blog";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

// ─── Travel Data (from travelData.ts) ───────────────
const travelData = [
    {
        lat: 48.21, lng: 16.37, label: "Viyana", country: "Avusturya",
        description: "Mart 2025",
        image: "/travel/viyana/IMG-20250304-WA0057.webp",
        color: "#ef4444",
        order: 0,
        media: [
            { type: "image", src: "/travel/viyana/IMG-20250304-WA0057.webp" },
            { type: "image", src: "/travel/viyana/IMG-20250304-WA0082.webp" },
            { type: "image", src: "/travel/viyana/IMG-20250304-WA0221.webp" },
            { type: "image", src: "/travel/viyana/IMG-20250304-WA0241.webp" },
            { type: "image", src: "/travel/viyana/IMG-20250304-WA0282.webp" },
            { type: "image", src: "/travel/viyana/IMG-20250304-WA0330.webp" },
            { type: "image", src: "/travel/viyana/IMG-20250304-WA0400.webp" },
            { type: "image", src: "/travel/viyana/IMG-20250304-WA0451.webp" },
            { type: "image", src: "/travel/viyana/IMG-20250304-WA0453.webp" },
            { type: "image", src: "/travel/viyana/IMG20250304114842.webp" },
            { type: "video", src: "/travel/viyana/VID20250304114719.webm" },
        ],
    },
    {
        lat: 47.5, lng: 19.04, label: "Budapeşte", country: "Macaristan",
        description: "Ağustos 2024",
        image: "/travel/budapest/IMG20240806201952.webp",
        color: "#ef4444",
        order: 1,
        media: [
            { type: "image", src: "/travel/budapest/IMG20240806125131.webp" },
            { type: "image", src: "/travel/budapest/IMG20240806201952.webp" },
            { type: "image", src: "/travel/budapest/IMG20240806205645.webp" },
            { type: "image", src: "/travel/budapest/IMG20240807193804.webp" },
            { type: "image", src: "/travel/budapest/IMG20240807204550.webp" },
            { type: "image", src: "/travel/budapest/IMG20240807205044.webp" },
            { type: "image", src: "/travel/budapest/IMG20240807212357.webp" },
            { type: "image", src: "/travel/budapest/IMG_20240807_224037.webp" },
            { type: "image", src: "/travel/budapest/IMG20240808092359.webp" },
            { type: "image", src: "/travel/budapest/IMG20240808093509.webp" },
            { type: "image", src: "/travel/budapest/IMG20240808104418.webp" },
            { type: "image", src: "/travel/budapest/IMG20240808105931.webp" },
            { type: "image", src: "/travel/budapest/IMG20240808121400.webp" },
            { type: "image", src: "/travel/budapest/IMG20240808124812.webp" },
            { type: "image", src: "/travel/budapest/IMG20240808162310.webp" },
            { type: "video", src: "/travel/budapest/VID20240808162526.webm" },
            { type: "image", src: "/travel/budapest/IMG20240811141012.webp" },
            { type: "image", src: "/travel/budapest/IMG20240811163739.webp" },
            { type: "image", src: "/travel/budapest/IMG-20240816-WA0085.webp" },
        ],
    },
    {
        lat: 47.52, lng: 19.08, label: "Budapeşte", country: "Macaristan",
        description: "Şubat 2025",
        image: "/travel/budapest2/IMG20250226201047.webp",
        color: "#f43f5e",
        order: 2,
        media: [
            { type: "image", src: "/travel/budapest2/IMG-20250225-WA0028.webp" },
            { type: "image", src: "/travel/budapest2/IMG-20250226-WA0009.webp" },
            { type: "image", src: "/travel/budapest2/IMG-20250226-WA0014.webp" },
            { type: "image", src: "/travel/budapest2/IMG-20250226-WA0033.webp" },
            { type: "image", src: "/travel/budapest2/IMG-20250226-WA0050.webp" },
            { type: "image", src: "/travel/budapest2/IMG-20250226-WA0072.webp" },
            { type: "image", src: "/travel/budapest2/IMG-20250226-WA0075.webp" },
            { type: "image", src: "/travel/budapest2/IMG-20250226-WA0087.webp" },
            { type: "image", src: "/travel/budapest2/IMG20250226201047.webp" },
            { type: "image", src: "/travel/budapest2/IMG20250226210429.webp" },
            { type: "image", src: "/travel/budapest2/IMG-20250227-WA0009.webp" },
            { type: "image", src: "/travel/budapest2/IMG-20250227-WA0011.webp" },
            { type: "video", src: "/travel/budapest2/VID20250227001352.webm" },
            { type: "image", src: "/travel/budapest2/IMG20250227182404.webp" },
            { type: "image", src: "/travel/budapest2/IMG-20250228-WA0007.webp" },
            { type: "image", src: "/travel/budapest2/IMG-20250228-WA0016.webp" },
            { type: "image", src: "/travel/budapest2/IMG20250228095520.webp" },
            { type: "image", src: "/travel/budapest2/IMG-20250301-WA0006.webp" },
            { type: "image", src: "/travel/budapest2/IMG-20250301-WA0026.webp" },
            { type: "image", src: "/travel/budapest2/IMG-20250301-WA0037.webp" },
            { type: "image", src: "/travel/budapest2/IMG-20250301-WA0041.webp" },
            { type: "image", src: "/travel/budapest2/IMG-20250301-WA0045.webp" },
            { type: "image", src: "/travel/budapest2/IMG-20250301-WA0048.webp" },
            { type: "image", src: "/travel/budapest2/IMG-20250301-WA0051.webp" },
            { type: "image", src: "/travel/budapest2/PXL_20250301_200914150.webp" },
            { type: "image", src: "/travel/budapest2/PXL_20250301_201609836.webp" },
            { type: "image", src: "/travel/budapest2/PXL_20250301_202113536.webp" },
            { type: "image", src: "/travel/budapest2/PXL_20250302_134425014.webp" },
            { type: "image", src: "/travel/budapest2/PXL_20250302_161228473.webp" },
            { type: "image", src: "/travel/budapest2/IMG_0574.webp" },
            { type: "image", src: "/travel/budapest2/IMG_0578.webp" },
            { type: "video", src: "/travel/budapest2/IMG_1253.webm" },
            { type: "image", src: "/travel/budapest2/IMG_1308.webp" },
            { type: "image", src: "/travel/budapest2/IMG_1313.webp" },
            { type: "image", src: "/travel/budapest2/IMG_2886.webp" },
            { type: "image", src: "/travel/budapest2/IMG_2908.webp" },
            { type: "image", src: "/travel/budapest2/IMG_2932.webp" },
            { type: "image", src: "/travel/budapest2/IMG_3005.webp" },
            { type: "image", src: "/travel/budapest2/IMG_3089.webp" },
        ],
    },
    {
        lat: 47.81, lng: 20.59, label: "Mezőkövesd", country: "Macaristan",
        description: "Ağustos 2024", image: "/travel/budapest/IMG20240811100426.webp",
        color: "#e11d48", order: 3,
        media: [
            { type: "image", src: "/travel/budapest/IMG20240811100426.webp" },
            { type: "video", src: "/travel/budapest/VID_20240812235018.webm" },
            { type: "image", src: "/travel/budapest/IMG20240813204102.webp" },
            { type: "video", src: "/travel/budapest/VID20240813222207.webm" },
            { type: "image", src: "/travel/budapest/IMG-20240810-WA0013.webp" },
            { type: "image", src: "/travel/budapest/IMG-20240812-WA0058.webp" },
            { type: "image", src: "/travel/budapest/IMG-20240813-WA0009.webp" },
            { type: "image", src: "/travel/budapest/IMG-20240813-WA0013.webp" },
            { type: "image", src: "/travel/budapest/IMG-20240814-WA0049.webp" },
            { type: "image", src: "/travel/budapest/IMG-20240815-WA0026.webp" },
            { type: "image", src: "/travel/budapest/IMG-20240815-WA0038.webp" },
            { type: "image", src: "/travel/budapest/IMG-20240815-WA0103.webp" },
            { type: "image", src: "/travel/budapest/IMG-20240815-WA0119.webp" },
            { type: "image", src: "/travel/budapest/IMG-20240815-WA0133.webp" },
            { type: "image", src: "/travel/budapest/IMG-20240819-WA0042.webp" },
            { type: "image", src: "/travel/budapest/IMG-20240820-WA0062.webp" },
            { type: "image", src: "/travel/budapest/IMG-20240820-WA0063.webp" },
            { type: "image", src: "/travel/budapest/IMG-20240824-WA0021.webp" },
        ],
    },
    {
        lat: 48.15, lng: 17.11, label: "Bratislava", country: "Slovakya",
        description: "Mart 2025", image: "/travel/bratislava/IMG-20250303-WA0880.webp",
        color: "#3b82f6", order: 4,
        media: [
            { type: "image", src: "/travel/bratislava/IMG-20250303-WA0019.webp" },
            { type: "image", src: "/travel/bratislava/IMG-20250303-WA0460.webp" },
            { type: "image", src: "/travel/bratislava/IMG-20250303-WA0477.webp" },
            { type: "image", src: "/travel/bratislava/IMG-20250303-WA0554.webp" },
            { type: "image", src: "/travel/bratislava/IMG-20250303-WA0558.webp" },
            { type: "image", src: "/travel/bratislava/IMG-20250303-WA0567.webp" },
            { type: "image", src: "/travel/bratislava/IMG-20250303-WA0743.webp" },
            { type: "image", src: "/travel/bratislava/IMG-20250303-WA0757.webp" },
            { type: "image", src: "/travel/bratislava/IMG-20250303-WA0797.webp" },
            { type: "image", src: "/travel/bratislava/IMG-20250303-WA0799.webp" },
            { type: "image", src: "/travel/bratislava/IMG-20250303-WA0828.webp" },
            { type: "image", src: "/travel/bratislava/IMG-20250303-WA0874.webp" },
            { type: "image", src: "/travel/bratislava/IMG-20250303-WA0877.webp" },
            { type: "image", src: "/travel/bratislava/IMG-20250303-WA0880.webp" },
            { type: "image", src: "/travel/bratislava/IMG-20250303-WA0896.webp" },
            { type: "image", src: "/travel/bratislava/IMG-20250303-WA0921.webp" },
            { type: "image", src: "/travel/bratislava/IMG-20250303-WA0922.webp" },
            { type: "image", src: "/travel/bratislava/IMG-20250303-WA0924.webp" },
            { type: "image", src: "/travel/bratislava/IMG-20250303-WA0927.webp" },
            { type: "image", src: "/travel/bratislava/IMG-20250303-WA0948.webp" },
            { type: "image", src: "/travel/bratislava/IMG-20250303-WA0954.webp" },
            { type: "image", src: "/travel/bratislava/IMG-20250303-WA0989.webp" },
        ],
    },
    {
        lat: 40.4093, lng: 49.8671, label: "Bakü", country: "Azerbaycan",
        description: "Kasım 2025", image: "/travel/baku/IMG-20251123-WA0050.webp",
        color: "#06b6d4", order: 5,
        media: [
            { type: "image", src: "/travel/baku/IMG-20251123-WA0050.webp" },
            { type: "image", src: "/travel/baku/IMG-20251123-WA0093.webp" },
            { type: "image", src: "/travel/baku/IMG-20251123-WA0102.webp" },
            { type: "image", src: "/travel/baku/IMG-20251124-WA0020.webp" },
            { type: "image", src: "/travel/baku/IMG-20251124-WA0079.webp" },
            { type: "image", src: "/travel/baku/IMG-20251126-WA0029.webp" },
            { type: "image", src: "/travel/baku/IMG-20251127-WA0047.webp" },
            { type: "image", src: "/travel/baku/IMG-20251129-WA0057.webp" },
            { type: "image", src: "/travel/baku/IMG-20251129-WA0066.webp" },
            { type: "image", src: "/travel/baku/IMG_20251123_144449.webp" },
            { type: "image", src: "/travel/baku/IMG_20251123_154502.webp" },
            { type: "image", src: "/travel/baku/IMG_20251123_162149.webp" },
            { type: "image", src: "/travel/baku/IMG_20251123_162445.webp" },
            { type: "image", src: "/travel/baku/IMG_20251123_162908.webp" },
            { type: "image", src: "/travel/baku/IMG_20251123_172247.webp" },
            { type: "image", src: "/travel/baku/IMG_20251123_173543.webp" },
            { type: "image", src: "/travel/baku/IMG_20251123_200123_207.webp" },
            { type: "image", src: "/travel/baku/IMG_20251124_142910.webp" },
            { type: "image", src: "/travel/baku/IMG_20251124_144656.webp" },
            { type: "image", src: "/travel/baku/IMG_20251124_145152.webp" },
            { type: "image", src: "/travel/baku/IMG_20251124_223250.webp" },
            { type: "image", src: "/travel/baku/IMG_20251126_211110.webp" },
            { type: "image", src: "/travel/baku/IMG_20251127_134832.webp" },
            { type: "image", src: "/travel/baku/IMG_20251127_135257.webp" },
            { type: "image", src: "/travel/baku/IMG_20251127_140007.webp" },
            { type: "image", src: "/travel/baku/IMG_20251127_140205.webp" },
            { type: "image", src: "/travel/baku/IMG_20251127_141556_3.webp" },
            { type: "image", src: "/travel/baku/IMG_20251128_140541.webp" },
            { type: "image", src: "/travel/baku/IMG_20251128_141154.webp" },
            { type: "video", src: "/travel/baku/VID-20251129-WA0028.webm" },
            { type: "video", src: "/travel/baku/VID_20251123_112937.webm" },
        ],
    },
    {
        lat: 49.1951, lng: 16.6068, label: "Brno", country: "Çek Cumhuriyeti",
        description: "Eylül 2025", image: "/travel/brno/IMG-20250915-WA0005.webp",
        color: "#f97316", order: 6,
        media: [
            { type: "video", src: "/travel/brno/Adsız tasarım(2).webm" },
            { type: "image", src: "/travel/brno/IMG-20250915-WA0005.webp" },
            { type: "image", src: "/travel/brno/IMG-20250915-WA0020.webp" },
            { type: "image", src: "/travel/brno/IMG-20250915-WA0024.webp" },
            { type: "image", src: "/travel/brno/IMG_20250915_100738.webp" },
            { type: "image", src: "/travel/brno/IMG_20250915_100803.webp" },
            { type: "image", src: "/travel/brno/IMG_20250915_101023.webp" },
            { type: "image", src: "/travel/brno/IMG_20250915_112959.webp" },
            { type: "image", src: "/travel/brno/IMG_20250915_150130.webp" },
            { type: "image", src: "/travel/brno/IMG_20250915_160945.webp" },
            { type: "video", src: "/travel/brno/VID_20250915_100121.webm" },
        ],
    },
    {
        lat: 40.0969, lng: 49.3892, label: "Gobustan", country: "Azerbaycan",
        description: "Kasım 2025", image: "/travel/gobustan/IMG-20251125-WA0086.webp",
        color: "#a8a29e", order: 7,
        media: [
            { type: "image", src: "/travel/gobustan/IMG-20251125-WA0086.webp" },
            { type: "image", src: "/travel/gobustan/IMG_20251125_114110.webp" },
            { type: "image", src: "/travel/gobustan/IMG_20251125_132202.webp" },
            { type: "image", src: "/travel/gobustan/IMG_20251125_132321.webp" },
            { type: "image", src: "/travel/gobustan/IMG_20251125_132526.webp" },
        ],
    },
    {
        lat: 50.0755, lng: 14.4378, label: "Prag", country: "Çek Cumhuriyeti",
        description: "Eylül 2025", image: "/travel/prag/IMG_20250910_114906.webp",
        color: "#8b5cf6", order: 8,
        media: [
            { type: "image", src: "/travel/prag/IMG_20250910_114906.webp" },
            { type: "image", src: "/travel/prag/IMG_20250910_115659.webp" },
            { type: "image", src: "/travel/prag/IMG_20250910_120401.webp" },
            { type: "image", src: "/travel/prag/IMG_20250910_122044.webp" },
            { type: "image", src: "/travel/prag/IMG_20250910_131252.webp" },
            { type: "image", src: "/travel/prag/IMG_20250910_131419.webp" },
            { type: "image", src: "/travel/prag/IMG_20250911_072700_152.webp" },
            { type: "image", src: "/travel/prag/IMG_20250918_132831.webp" },
            { type: "image", src: "/travel/prag/IMG_20250918_133053.webp" },
            { type: "image", src: "/travel/prag/IMG_20250918_142422.webp" },
            { type: "image", src: "/travel/prag/IMG_20250918_143449.webp" },
            { type: "image", src: "/travel/prag/IMG_20250918_152827.webp" },
            { type: "image", src: "/travel/prag/IMG_20250918_153825.webp" },
            { type: "image", src: "/travel/prag/IMG_20250918_160531.webp" },
            { type: "image", src: "/travel/prag/IMG_20250918_162848.webp" },
            { type: "image", src: "/travel/prag/IMG_20250918_170422.webp" },
            { type: "image", src: "/travel/prag/IMG_20250918_171223.webp" },
            { type: "image", src: "/travel/prag/IMG_20250918_172533.webp" },
            { type: "image", src: "/travel/prag/IMG_20250918_201553.webp" },
            { type: "image", src: "/travel/prag/IMG_20250918_202052.webp" },
            { type: "image", src: "/travel/prag/IMG_20250918_203340.webp" },
        ],
    },
    {
        lat: 49.9716, lng: 16.3934, label: "Ústí nad Orlicí", country: "Çek Cumhuriyeti",
        description: "Eylül 2025", image: "/travel/usti_nad_orlici/IMG-20250911-WA0005.webp",
        color: "#22c55e", order: 9,
        media: [
            { type: "video", src: "/travel/usti_nad_orlici/Adsız tasarım(2).webm" },
            { type: "image", src: "/travel/usti_nad_orlici/IMG-20250911-WA0005.webp" },
            { type: "image", src: "/travel/usti_nad_orlici/IMG-20250911-WA0014.webp" },
            { type: "image", src: "/travel/usti_nad_orlici/IMG-20250911-WA0019.webp" },
            { type: "image", src: "/travel/usti_nad_orlici/IMG-20250911-WA0060.webp" },
            { type: "image", src: "/travel/usti_nad_orlici/IMG-20250911-WA0061.webp" },
            { type: "image", src: "/travel/usti_nad_orlici/IMG-20250911-WA0063.webp" },
            { type: "image", src: "/travel/usti_nad_orlici/IMG-20250911-WA0099.webp" },
            { type: "image", src: "/travel/usti_nad_orlici/IMG-20250912-WA0020.webp" },
            { type: "image", src: "/travel/usti_nad_orlici/IMG-20250912-WA0029.webp" },
            { type: "image", src: "/travel/usti_nad_orlici/IMG-20250912-WA0051.webp" },
            { type: "image", src: "/travel/usti_nad_orlici/IMG-20250913-WA0009.webp" },
            { type: "image", src: "/travel/usti_nad_orlici/IMG-20250913-WA0015.webp" },
            { type: "image", src: "/travel/usti_nad_orlici/IMG-20250913-WA0018.webp" },
            { type: "image", src: "/travel/usti_nad_orlici/IMG-20250913-WA0020.webp" },
            { type: "image", src: "/travel/usti_nad_orlici/IMG-20250913-WA0029.webp" },
            { type: "image", src: "/travel/usti_nad_orlici/IMG-20250913-WA0035.webp" },
            { type: "image", src: "/travel/usti_nad_orlici/IMG-20250913-WA0040.webp" },
            { type: "image", src: "/travel/usti_nad_orlici/IMG-20250913-WA0041.webp" },
            { type: "image", src: "/travel/usti_nad_orlici/IMG-20250913-WA0042.webp" },
            { type: "image", src: "/travel/usti_nad_orlici/IMG-20250913-WA0047.webp" },
            { type: "image", src: "/travel/usti_nad_orlici/IMG-20250916-WA0017.webp" },
            { type: "image", src: "/travel/usti_nad_orlici/IMG-20250916-WA0018.webp" },
            { type: "image", src: "/travel/usti_nad_orlici/IMG-20250916-WA0020.webp" },
            { type: "image", src: "/travel/usti_nad_orlici/IMG_20250910_174928.webp" },
            { type: "image", src: "/travel/usti_nad_orlici/IMG_20250911_141511.webp" },
            { type: "image", src: "/travel/usti_nad_orlici/IMG_20250911_143648.webp" },
            { type: "image", src: "/travel/usti_nad_orlici/IMG_20250911_143810.webp" },
            { type: "image", src: "/travel/usti_nad_orlici/IMG_20250911_145624.webp" },
            { type: "image", src: "/travel/usti_nad_orlici/IMG_20250911_165310.webp" },
            { type: "image", src: "/travel/usti_nad_orlici/IMG_20250912_142846.webp" },
            { type: "image", src: "/travel/usti_nad_orlici/IMG_20250913_143521.webp" },
            { type: "image", src: "/travel/usti_nad_orlici/IMG_20250913_150211.webp" },
            { type: "image", src: "/travel/usti_nad_orlici/IMG_20250913_151120.webp" },
            { type: "image", src: "/travel/usti_nad_orlici/IMG_20250914_114120.webp" },
            { type: "video", src: "/travel/usti_nad_orlici/VID_20250913_142419.webm" },
            { type: "video", src: "/travel/usti_nad_orlici/VID_20250916_221154.webm" },
            { type: "video", src: "/travel/usti_nad_orlici/VID_20250916_223334.webm" },
        ],
    },
];

// ─── Projects Data ──────────────────────────────────
const projectsData = [
    { title: "WiFi & Bluetooth Jammer", description: "ESP32 mikrodenetleyicisi ile 2.4GHz WiFi ve Bluetooth frekanslarını analiz eden çift modlu cihaz. Arduino IDE ve C++ ile geliştirildi.", tags: ["ESP32", "C++", "Arduino", "IoT Security"], icon: "wifi", link: "#", order: 0 },
    { title: "WiFi Deauthenticator", description: "ESP8266 ile WiFi trafiğini izleyen ve güvenlik açıklarını test eden (Packet Monitoring/Deauth) sistem.", tags: ["ESP8266", "Network Security", "C++", "Packet Sniffing"], icon: "shield", link: "#", order: 1 },
    { title: "E-Ticaret Sitesi", description: "Angular ve Spring Boot tabanlı kapsamlı alışveriş sitesi. JWT ile güvenli giriş, ürün ve sepet yönetimi özellikleri.", tags: ["Angular", "Spring Boot", "Java", "JWT"], icon: "globe", link: "#", order: 2 },
    { title: "Kitap Envanter Sistemi", description: "Java tabanlı stok takip otomasyonu. Observer, Composite ve Strategy gibi Tasarım Kalıpları (Design Patterns) kullanılarak geliştirildi.", tags: ["Java", "Design Patterns", "OOP", "Automation"], icon: "database", link: "#", order: 3 },
    { title: "File Upload Detector", description: "Web sitelerinde file upload noktalarını tespit eden ve potansiyel güvenlik açıklarını analiz eden Python aracı.", tags: ["Python", "Web Security", "Vulnerability Scanning"], icon: "lock", link: "#", order: 4 },
    { title: "Portfolio Website", description: "Bu web sitesi! Next.js, Tailwind CSS ve Three.js ile geliştirilmiş, siber güvenlik temalı kişisel portfolyo.", tags: ["Next.js", "React", "TypeScript", "Three.js"], icon: "code", link: "#", order: 5 },
];

// ─── Certificates Data ──────────────────────────────
const certificatesData = [
    { title: "Cyber Heroes 2.0 Czechia", issuer: "Cyber Heroes", date: "2025", color: "#EC4899", icon: "award", image: "/certificates/cyber-heroes-2-0-czechia.jpg", order: 0 },
    { title: "Cyber Heroes 2.0 Azerbaijan", issuer: "Cyber Heroes", date: "2025", color: "#8B5CF6", icon: "award", image: "/certificates/cyber-heroes-2-0-azerbaijan.jpg", order: 1 },
    { title: "Red Hat System Administration", issuer: "Red Hat", date: "2025", color: "#EF4444", icon: "code", image: "/certificates/red-hat-system-administration.jpg", order: 2 },
    { title: "Sızma Testi Eğitimi", issuer: "BG-Tek", date: "2024", color: "#6366F1", icon: "shield", image: "/certificates/sizma-testi-egitimi-bg-tek.jpg", order: 3 },
    { title: "Beyaz Şapkalı Hacker ve Temel Linux Eğitimi", issuer: "BTK Akademi", date: "2023", color: "#3B82F6", icon: "shield", image: "/certificates/beyaz-sapkali-hacker-ve-temel-linux-egitimi.jpg", order: 4 },
    { title: "Zararlı Yazılım Analizi ve Tersine Mühendislik", issuer: "Siber Güvenlik", date: "2024", color: "#14B8A6", icon: "code", image: "/certificates/zararli-yazilim-analizi-ve-tersine-muhendislik.jpg", order: 5 },
    { title: "Algorithm Of Social Entrepreneurship", issuer: "Erasmus+", date: "2025", color: "#10B981", icon: "globe", image: "/certificates/algorithm-of-social-entrepreneurship.jpg", order: 6 },
    { title: "Speak Up,Make a Difference, Stop The Bullying", issuer: "Erasmus+", date: "2024", color: "#10B981", icon: "globe", image: "/certificates/speak-up-make-a-difference.jpg", order: 7 },
    { title: "Liderlik Eğitimi", issuer: "Kişisel Gelişim", date: "2020", color: "#F59E0B", icon: "award", image: "/certificates/liderlik-egitimi.jpg", order: 8 },
];

// ─── Blog Data ──────────────────────────────────────
const blogsData = [
    {
        title: "FUD: Behavioral and Structural File Upload Detection",
        excerpt: "Intelligent Identification of File Upload Interfaces in Modern Web Architectures. A hybrid, behavioral-driven approach to automatically identify file upload functionalities.",
        content: "",
        date: "Feb 2026",
        category: "security",
        readTime: "15 min",
        tags: ["FUD", "Behavioral Analysis", "Web Security", "Research"],
        link: "#",
    },
];

// ─── Seed All Data ──────────────────────────────────
async function seedAll() {
    try {
        const mongoURI = process.env.MONGODB_URI;
        if (!mongoURI) {
            console.error("❌ MONGODB_URI tanımlanmamış.");
            process.exit(1);
        }

        await mongoose.connect(mongoURI);
        console.log("✅ MongoDB'ye bağlanıldı.");

        // Clear existing data
        await Promise.all([
            Travel.deleteMany({}),
            Project.deleteMany({}),
            Certificate.deleteMany({}),
            Blog.deleteMany({}),
        ]);
        console.log("🗑️  Eski veriler temizlendi.");

        // Seed all
        const [travels, projects, certs, blogs] = await Promise.all([
            Travel.insertMany(travelData),
            Project.insertMany(projectsData),
            Certificate.insertMany(certificatesData),
            Blog.insertMany(blogsData),
        ]);

        console.log(`✅ ${travels.length} seyahat noktası eklendi.`);
        console.log(`✅ ${projects.length} proje eklendi.`);
        console.log(`✅ ${certs.length} sertifika eklendi.`);
        console.log(`✅ ${blogs.length} blog yazısı eklendi.`);

        await mongoose.disconnect();
        console.log("✅ Tamamlandı!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Seed hatası:", error);
        process.exit(1);
    }
}

seedAll();
