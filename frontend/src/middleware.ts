import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
    // Skip all paths that should not be internationalized.
    // Added 'admin' to skip i18n for admin panel routes.
    matcher: ['/((?!api|admin|_next|_vercel|.*\\..*).*)']
};
