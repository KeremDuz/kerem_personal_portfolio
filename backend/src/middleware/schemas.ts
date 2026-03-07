import { z } from "zod";

// ─── Travel Schemas ─────────────────────────────────
const mediaItemSchema = z.object({
    type: z.enum(["image", "video"]),
    src: z.string().min(1, "Medya kaynağı zorunludur."),
    caption: z.string().optional(),
});

export const createTravelSchema = z.object({
    lat: z.number({ error: "Enlem zorunludur." }),
    lng: z.number({ error: "Boylam zorunludur." }),
    label: z.string().min(1, "Şehir adı zorunludur."),
    country: z.string().min(1, "Ülke adı zorunludur."),
    description: z.string().min(1, "Açıklama zorunludur."),
    image: z.string().min(1, "Kapak görseli zorunludur."),
    color: z.string().default("#ef4444"),
    media: z.array(mediaItemSchema).default([]),
    order: z.number().default(0),
    isActive: z.boolean().default(true),
});

export const updateTravelSchema = createTravelSchema.partial();

// ─── Project Schemas ────────────────────────────────
export const createProjectSchema = z.object({
    title: z.string().min(1, "Proje adı zorunludur."),
    description: z.string().min(1, "Açıklama zorunludur."),
    tags: z.array(z.string()).default([]),
    icon: z.enum(["shield", "code", "terminal", "wifi", "lock", "database", "globe"]).default("code"),
    link: z.string().default("#"),
    order: z.number().default(0),
    isActive: z.boolean().default(true),
});

export const updateProjectSchema = createProjectSchema.partial();

// ─── Certificate Schemas ────────────────────────────
export const createCertificateSchema = z.object({
    title: z.string().min(1, "Sertifika adı zorunludur."),
    issuer: z.string().min(1, "Kurum adı zorunludur."),
    date: z.string().min(1, "Tarih zorunludur."),
    color: z.string().default("#22c55e"),
    icon: z.enum(["shield", "code", "globe", "award"]).default("award"),
    image: z.string().optional(),
    link: z.string().optional(),
    order: z.number().default(0),
    isActive: z.boolean().default(true),
});

export const updateCertificateSchema = createCertificateSchema.partial();

// ─── Blog Schemas ───────────────────────────────────
export const createBlogSchema = z.object({
    title: z.string().min(1, "Blog başlığı zorunludur."),
    excerpt: z.string().min(1, "Özet zorunludur."),
    content: z.string().default(""),
    date: z.string().min(1, "Tarih zorunludur."),
    category: z.enum(["ctf", "security", "travel", "dev"]),
    readTime: z.string().min(1, "Okuma süresi zorunludur."),
    tags: z.array(z.string()).default([]),
    link: z.string().default("#"),
    isActive: z.boolean().default(true),
});

export const updateBlogSchema = createBlogSchema.partial();

// ─── Auth Schemas ───────────────────────────────────
export const loginSchema = z.object({
    username: z.string().min(1, "Kullanıcı adı zorunludur."),
    password: z.string().min(1, "Şifre zorunludur."),
});
