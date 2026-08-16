import type { CookieOptions } from "express";

export const SESSION_MAX_AGE_MS = 12 * 60 * 60 * 1000;

export function adminSessionCookieName(): string {
    return process.env.NODE_ENV === "production"
        ? "__Host-admin_session"
        : "admin_session";
}

export function sessionCookieOptions(): CookieOptions {
    const production = process.env.NODE_ENV === "production";

    return {
        httpOnly: true,
        secure: production,
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_MAX_AGE_MS,
    };
}

export function clearSessionCookieOptions(): CookieOptions {
    const { maxAge: _maxAge, ...options } = sessionCookieOptions();
    return options;
}
