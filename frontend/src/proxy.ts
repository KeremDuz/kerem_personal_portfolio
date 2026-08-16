import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// Next.js 16 renamed the `middleware` convention to `proxy`; the old filename
// and export name still work but are deprecated. The proxy runtime is Node.js
// only — fine here, next-intl's routing middleware has no edge-only deps.
export const proxy = createMiddleware(routing);

export const config = {
    // Skip all paths that should not be internationalized.
    // Added 'admin' to skip i18n for admin panel routes.
    matcher: ['/((?!api|admin|_next|_vercel|.*\\..*).*)']
};
