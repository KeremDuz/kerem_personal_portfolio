function withoutTrailingSlash(value: string): string {
    return value.replace(/\/$/, "");
}

/**
 * Browsers use a same-origin API gateway by default. Keeping the backend URL
 * out of the client bundle avoids CORS/cookie problems and lets deployments
 * move the API without rebuilding every browser-facing URL.
 */
export const browserApiBase = withoutTrailingSlash(
    process.env.NEXT_PUBLIC_API_URL || "/api"
);

/** Server Components can call the backend directly, without an HTTP proxy hop. */
export const serverApiBase = withoutTrailingSlash(
    process.env.BACKEND_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000/api"
);
