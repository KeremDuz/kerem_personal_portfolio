import { browserApiBase } from "@/lib/config";

export class ApiError extends Error {
    constructor(message: string, public readonly status: number) {
        super(message);
        this.name = "ApiError";
    }
}

// ─── Shared Types ───────────────────────────────────
export interface Travel {
    _id: string;
    lat: number;
    lng: number;
    label: string;
    country: string;
    description: string;
    image: string;
    color: string;
    media: { type: "image" | "video"; src: string; caption?: string }[];
    order: number;
    isActive: boolean;
}

export interface Project {
    _id: string;
    title: string;
    description: string;
    tags: string[];
    icon: string;
    link: string;
    order: number;
    isActive: boolean;
}

export interface Certificate {
    _id: string;
    title: string;
    issuer: string;
    date: string;
    color: string;
    icon: "shield" | "code" | "globe" | "award";
    image?: string;
    link?: string;
    order: number;
    isActive: boolean;
}

export interface BlogPost {
    _id: string;
    title: string;
    excerpt: string;
    content: string;
    date: string;
    category: "ctf" | "security" | "travel" | "dev";
    readTime: string;
    tags: string[];
    link: string;
    isActive: boolean;
}

export interface Visitor {
    _id: string;
    ip: string;
    page: string;
    browser: string;
    os: string;
    device: string;
    country: string;
    visitedAt: string;
}

export interface TimelineItem {
    _id: string;
    year: string;
    title: string;
    subtitle: string;
    description: string;
    type: "education" | "work" | "certification";
    tags: string[];
    order: number;
    isActive: boolean;
}

export interface AboutData {
    _id: string;
    terminal_title: string;
    p1_1: string;
    p1_2: string;
    p1_3: string;
    p2: string;
    p3: string;
    focusLabel: string;
    focusValue: string;
    expertiseLabel: string;
    expertiseValue: string;
    locationLabel: string;
    locationValue: string;
    fuelLabel: string;
    fuelValue: string;
}

export interface VisitorStats {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    uniqueIPs: number;
    recentVisitors: Visitor[];
    topPages: { page: string; count: number }[];
    topCountries: { country: string; count: number }[];
}

export interface PaginatedVisitors {
    visitors: Visitor[];
    pagination: {
        total: number;
        page: number;
        pages: number;
    };
}

// ─── Generic Fetch ──────────────────────────────────
async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {},
    timeoutMs = 15_000
): Promise<T> {
    const headers: Record<string, string> = {
        "X-Requested-With": "XMLHttpRequest",
        ...(options.headers as Record<string, string>),
    };

    // Only set Content-Type for non-FormData bodies
    if (!(options.body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }

    const controller = new AbortController();
    const timeout = globalThis.setTimeout(() => controller.abort(), timeoutMs);
    const abortFromCaller = () => controller.abort();
    options.signal?.addEventListener("abort", abortFromCaller, { once: true });

    let res: Response;
    try {
        res = await fetch(`${browserApiBase}${endpoint}`, {
            ...options,
            headers,
            credentials: "include",
            signal: controller.signal,
        });
    } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
            throw new Error("İstek zaman aşımına uğradı. Lütfen tekrar deneyin.");
        }
        throw error;
    } finally {
        globalThis.clearTimeout(timeout);
        options.signal?.removeEventListener("abort", abortFromCaller);
    }

    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new ApiError(data.error || `HTTP ${res.status}`, res.status);
    }

    return res.json();
}

// ─── Auth API ───────────────────────────────────────
function clearLegacyAdminToken(): void {
    if (typeof window !== "undefined") {
        localStorage.removeItem("admin_token");
    }
}

export const authAPI = {
    login: async (username: string, password: string) => {
        const result = await apiFetch<{ user: { id: string; username: string; role: "admin" } }>("/auth/login", {
            method: "POST",
            body: JSON.stringify({ username, password }),
        });
        clearLegacyAdminToken();
        return result;
    },
    getMe: () => apiFetch<{ id: string; username: string }>("/auth/me"),
    logout: async () => {
        clearLegacyAdminToken();
        return apiFetch<{ message: string }>("/auth/logout", { method: "POST" });
    },
};

// ─── Travel API ─────────────────────────────────────
export const travelAPI = {
    getAll: () => apiFetch<Travel[]>("/travel"),
    getAllAdmin: () => apiFetch<Travel[]>("/travel/admin/all"),
    create: (data: Partial<Travel>) => apiFetch<Travel>("/travel/admin", {
        method: "POST",
        body: JSON.stringify(data),
    }),
    update: (id: string, data: Partial<Travel>) => apiFetch<Travel>(`/travel/admin/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    }),
    delete: (id: string) => apiFetch<{ message: string }>(`/travel/admin/${id}`, {
        method: "DELETE",
    }),
};

// ─── Blog API ───────────────────────────────────────
export const blogAPI = {
    getAll: () => apiFetch<BlogPost[]>("/blogs"),
    getById: (id: string) => apiFetch<BlogPost>(`/blogs/${id}`),
    getAllAdmin: () => apiFetch<BlogPost[]>("/blogs/admin/all"),
    create: (data: Partial<BlogPost>) => apiFetch<BlogPost>("/blogs/admin", {
        method: "POST",
        body: JSON.stringify(data),
    }),
    update: (id: string, data: Partial<BlogPost>) => apiFetch<BlogPost>(`/blogs/admin/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    }),
    delete: (id: string) => apiFetch<{ message: string }>(`/blogs/admin/${id}`, {
        method: "DELETE",
    }),
};

// ─── Project API ────────────────────────────────────
export const projectAPI = {
    getAll: () => apiFetch<Project[]>("/projects", { cache: "no-store" }),
    getAllAdmin: () => apiFetch<Project[]>("/projects/admin/all"),
    create: (data: Partial<Project>) => apiFetch<Project>("/projects/admin", {
        method: "POST",
        body: JSON.stringify(data),
    }),
    update: (id: string, data: Partial<Project>) => apiFetch<Project>(`/projects/admin/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    }),
    delete: (id: string) => apiFetch<{ message: string }>(`/projects/admin/${id}`, {
        method: "DELETE",
    }),
};

// ─── Certificate API ────────────────────────────────
export const certificateAPI = {
    getAll: () => apiFetch<Certificate[]>("/certificates"),
    getAllAdmin: () => apiFetch<Certificate[]>("/certificates/admin/all"),
    create: (data: Partial<Certificate>) => apiFetch<Certificate>("/certificates/admin", {
        method: "POST",
        body: JSON.stringify(data),
    }),
    update: (id: string, data: Partial<Certificate>) => apiFetch<Certificate>(`/certificates/admin/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    }),
    delete: (id: string) => apiFetch<{ message: string }>(`/certificates/admin/${id}`, {
        method: "DELETE",
    }),
};

// ─── Timeline API ───────────────────────────────────
export const timelineAPI = {
    getAll: () => apiFetch<TimelineItem[]>("/timeline", { cache: "no-store" }),
    getAllAdmin: () => apiFetch<TimelineItem[]>("/timeline/admin/all"),
    create: (data: Partial<TimelineItem>) => apiFetch<TimelineItem>("/timeline/admin", {
        method: "POST",
        body: JSON.stringify(data),
    }),
    update: (id: string, data: Partial<TimelineItem>) => apiFetch<TimelineItem>(`/timeline/admin/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    }),
    delete: (id: string) => apiFetch<{ message: string }>(`/timeline/admin/${id}`, {
        method: "DELETE",
    }),
};

// ─── About API ──────────────────────────────────────
export interface ContributionDay {
    date: string;
    /** GitHub's own 0-4 intensity bucket. */
    level: number;
    count: number;
}

export interface ContributionCalendar {
    username: string;
    total: number;
    /** Grid columns; each holds 7 slots, Sunday first. `null` = no such day. */
    weeks: (ContributionDay | null)[][];
    from: string;
    to: string;
}

export const githubAPI = {
    contributions: () => apiFetch<ContributionCalendar>("/github/contributions"),
};

export const aboutAPI = {
    get: () => apiFetch<AboutData>("/about"),
    upsert: (data: Partial<AboutData>) => apiFetch<AboutData>("/about/admin", {
        method: "PUT",
        body: JSON.stringify(data),
    }),
};

// ─── Visitor API ────────────────────────────────────
export const visitorAPI = {
    getVisitors: (page = 1, limit = 20) =>
        apiFetch<PaginatedVisitors>(`/admin/visitors?page=${page}&limit=${limit}`),
    getStats: () => apiFetch<VisitorStats>("/admin/visitors/stats"),
    clearOld: (days = 30) =>
        apiFetch<{ message: string }>(`/admin/visitors/clear?days=${days}`, {
            method: "DELETE",
        }),
};

// ─── Upload API ─────────────────────────────────────
export const uploadAPI = {
    upload: async (file: File, folder = "general"): Promise<{ url: string; publicId: string }> => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);
        return apiFetch<{ url: string; publicId: string }>("/admin/upload", {
            method: "POST",
            body: formData,
        }, 120_000);
    },
    delete: (publicId: string) =>
        apiFetch<{ message: string }>(`/admin/upload/${encodeURIComponent(publicId)}`, {
            method: "DELETE",
        }),
};

// ─── Analytics API ────────────────────────────────────
export const analyticsAPI = {
    track: async (action: string, details: string) => {
        const privacyNavigator = navigator as Navigator & { globalPrivacyControl?: boolean };
        if (navigator.doNotTrack === "1" || privacyNavigator.globalPrivacyControl) {
            return;
        }

        try {
            await apiFetch<{ status: string }>("/track", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action, details }),
            });
        } catch (e) {
            // Silently fail for analytics
        }
    }
};
