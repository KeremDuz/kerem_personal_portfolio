// ─── API Configuration ──────────────────────────────
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

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
    icon: string;
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

// ─── Token Management ───────────────────────────────
function getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("admin_token");
}

function setToken(token: string): void {
    localStorage.setItem("admin_token", token);
}

function removeToken(): void {
    localStorage.removeItem("admin_token");
}

// ─── Generic Fetch ──────────────────────────────────
async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const headers: Record<string, string> = {
        ...(options.headers as Record<string, string>),
    };

    const token = getToken();
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    // Only set Content-Type for non-FormData bodies
    if (!(options.body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
    });

    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
    }

    return res.json();
}

// ─── Auth API ───────────────────────────────────────
export const authAPI = {
    login: async (username: string, password: string) => {
        const data = await apiFetch<{ token: string; user: { id: string; username: string } }>("/auth/login", {
            method: "POST",
            body: JSON.stringify({ username, password }),
        });
        setToken(data.token);
        return data;
    },
    getMe: () => apiFetch<{ id: string; username: string }>("/auth/me"),
    logout: () => removeToken(),
    isAuthenticated: () => !!getToken(),
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
    getAll: () => apiFetch<Project[]>("/projects"),
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
        });
    },
    delete: (publicId: string) =>
        apiFetch<{ message: string }>(`/admin/upload/${encodeURIComponent(publicId)}`, {
            method: "DELETE",
        }),
};

// ─── Analytics API ────────────────────────────────────
export const analyticsAPI = {
    track: async (action: string, details: string) => {
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
