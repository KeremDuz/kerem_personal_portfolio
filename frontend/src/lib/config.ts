function withoutTrailingSlash(value: string): string {
    return value.replace(/\/$/, "");
}

/**
 * Browsers always call the same-origin `/api` gateway (a Next.js rewrite to
 * the Express backend, see next.config.js). Calling the backend host directly
 * from the browser made every request cross-origin, and any mismatch in the
 * backend's CORS allow-list blocked the whole site's data.
 */
export const browserApiBase = "/api";

/** Server Components can call the backend directly, without an HTTP proxy hop. */
export const serverApiBase = withoutTrailingSlash(
    process.env.BACKEND_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000/api"
);
