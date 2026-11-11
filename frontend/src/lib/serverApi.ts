import { serverApiBase } from "@/lib/config";

/**
 * Server-side reads of public API content, cached for five minutes. Failures
 * resolve to empty values so a sleeping backend never breaks a page render.
 */
async function fetchPublic(endpoint: string): Promise<unknown> {
    try {
        const response = await fetch(`${serverApiBase}${endpoint}`, {
            next: { revalidate: 300 },
            signal: AbortSignal.timeout(5_000),
        });
        return response.ok ? await response.json() : null;
    } catch {
        return null;
    }
}

export async function fetchPublicList<T>(endpoint: string): Promise<T[]> {
    const data = await fetchPublic(endpoint);
    return Array.isArray(data) ? (data as T[]) : [];
}

export async function fetchPublicObject<T>(endpoint: string): Promise<T | null> {
    return (await fetchPublic(endpoint)) as T | null;
}
