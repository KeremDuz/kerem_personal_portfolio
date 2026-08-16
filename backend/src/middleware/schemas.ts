import { z } from "zod";

const shortText = z.string().trim().min(1).max(200);
const longText = z.string().trim().min(1).max(10_000);
const optionalUrlOrPath = z.string().trim().max(2_048).refine(
    (value) => !value || value === "#" || value.startsWith("/") || /^https?:\/\//i.test(value),
    "Geçerli bir HTTP(S) adresi veya site içi yol girin."
);
const color = z.string().regex(/^#[0-9a-f]{6}$/i, "Renk #RRGGBB biçiminde olmalıdır.");
const order = z.number().int().min(-10_000).max(10_000);
const tags = z.array(z.string().trim().min(1).max(60)).max(30);

// ─── Travel Schemas ─────────────────────────────────
const mediaItemSchema = z.object({
    type: z.enum(["image", "video"]),
    src: optionalUrlOrPath.refine(Boolean, "Medya kaynağı zorunludur."),
    caption: z.string().trim().max(500).optional(),
});

export const createTravelSchema = z.object({
    lat: z.number({ error: "Enlem zorunludur." }).min(-90).max(90),
    lng: z.number({ error: "Boylam zorunludur." }).min(-180).max(180),
    label: shortText,
    country: shortText,
    description: z.string().trim().min(1).max(2_000),
    image: optionalUrlOrPath.refine(Boolean, "Kapak görseli zorunludur."),
    color: color.default("#ef4444"),
    media: z.array(mediaItemSchema).max(500).default([]),
    order: order.default(0),
    isActive: z.boolean().default(true),
});

export const updateTravelSchema = createTravelSchema.partial().extend({
    color: color.optional(),
    media: z.array(mediaItemSchema).max(500).optional(),
    order: order.optional(),
    isActive: z.boolean().optional(),
});

// ─── Project Schemas ────────────────────────────────
export const createProjectSchema = z.object({
    title: shortText,
    description: z.string().trim().min(1).max(5_000),
    tags: tags.default([]),
    icon: z.enum(["shield", "code", "terminal", "wifi", "lock", "database", "globe"]).default("code"),
    link: optionalUrlOrPath.default("#"),
    order: order.default(0),
    isActive: z.boolean().default(true),
});

export const updateProjectSchema = createProjectSchema.partial().extend({
    tags: tags.optional(),
    icon: z.enum(["shield", "code", "terminal", "wifi", "lock", "database", "globe"]).optional(),
    link: optionalUrlOrPath.optional(),
    order: order.optional(),
    isActive: z.boolean().optional(),
});

// ─── Certificate Schemas ────────────────────────────
export const createCertificateSchema = z.object({
    title: shortText,
    issuer: shortText,
    date: z.string().trim().min(1).max(80),
    color: color.default("#22c55e"),
    icon: z.enum(["shield", "code", "globe", "award"]).default("award"),
    image: optionalUrlOrPath.optional(),
    link: optionalUrlOrPath.optional(),
    order: order.default(0),
    isActive: z.boolean().default(true),
});

export const updateCertificateSchema = createCertificateSchema.partial().extend({
    color: color.optional(),
    icon: z.enum(["shield", "code", "globe", "award"]).optional(),
    order: order.optional(),
    isActive: z.boolean().optional(),
});

// ─── Blog Schemas ───────────────────────────────────
export const createBlogSchema = z.object({
    title: shortText,
    excerpt: z.string().trim().min(1).max(1_000),
    content: z.string().trim().max(100_000).default(""),
    date: z.string().trim().min(1).max(80),
    category: z.enum(["ctf", "security", "travel", "dev"]),
    readTime: z.string().trim().min(1).max(40),
    tags: tags.default([]),
    link: optionalUrlOrPath.default("#"),
    isActive: z.boolean().default(true),
});

export const updateBlogSchema = createBlogSchema.partial().extend({
    content: z.string().trim().max(100_000).optional(),
    tags: tags.optional(),
    link: optionalUrlOrPath.optional(),
    isActive: z.boolean().optional(),
});

// ─── Timeline Schemas ───────────────────────────────
export const createTimelineSchema = z.object({
    year: z.string().trim().min(1).max(80),
    title: shortText,
    subtitle: shortText,
    description: z.string().trim().min(1).max(5_000),
    type: z.enum(["education", "work", "certification"]).default("education"),
    tags: tags.default([]),
    order: order.default(0),
    isActive: z.boolean().default(true),
});

export const updateTimelineSchema = createTimelineSchema.partial().extend({
    type: z.enum(["education", "work", "certification"]).optional(),
    tags: tags.optional(),
    order: order.optional(),
    isActive: z.boolean().optional(),
});

// ─── About Schema ───────────────────────────────────
export const aboutSchema = z.object({
    terminal_title: shortText,
    p1_1: longText,
    p1_2: longText,
    p1_3: longText,
    p2: longText,
    p3: longText,
    focusLabel: shortText,
    focusValue: shortText,
    expertiseLabel: shortText,
    expertiseValue: shortText,
    locationLabel: shortText,
    locationValue: shortText,
    fuelLabel: shortText,
    fuelValue: shortText,
});

// ─── Analytics Schema ───────────────────────────────
export const trackEventSchema = z.object({
    action: z.enum([
        "page_view",
        "click_city",
        "view_photo",
        "view_project",
        "open_project",
    ]).default("page_view"),
    details: z.string().trim().min(1).max(250).default("Anasayfa"),
});

// ─── Auth Schemas ───────────────────────────────────
export const loginSchema = z.object({
    username: z.string().trim().min(1, "Kullanıcı adı zorunludur.").max(100),
    password: z.string().min(1, "Şifre zorunludur.").max(200),
});
