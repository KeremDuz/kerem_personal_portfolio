/** @type {import('next').NextConfig} */
const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');
const backendApiUrl = (process.env.BACKEND_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
const directBrowserApi = process.env.NEXT_PUBLIC_API_URL;

function originOf(value) {
    try {
        return new URL(value).origin;
    } catch {
        return null;
    }
}

const connectSources = [
    "'self'",
    'https://www.google-analytics.com',
    'https://*.google-analytics.com',
    'https://www.googletagmanager.com',
    originOf(directBrowserApi),
].filter(Boolean);

const scriptSources = [
    "'self'",
    "'unsafe-inline'",
    process.env.NODE_ENV === 'development' ? "'unsafe-eval'" : null,
    'https://www.googletagmanager.com',
].filter(Boolean);

const contentSecurityPolicy = [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    `script-src ${scriptSources.join(' ')}`,
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data:",
    "img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com https://*.google-analytics.com",
    "media-src 'self' blob: https://res.cloudinary.com",
    `connect-src ${connectSources.join(' ')}`,
    "frame-src https://lookerstudio.google.com https://datastudio.google.com",
].join('; ');

const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ['react-globe.gl', 'three'],
    // There is a lockfile at the repo root as well as in frontend/, so Turbopack
    // guesses the wrong workspace root and warns. This pins it to this app.
    turbopack: {
        root: __dirname,
    },
    experimental: {
        optimizePackageImports: ['lucide-react'],
    },
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: `${backendApiUrl}/:path*`,
            },
        ];
    },
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    { key: 'Content-Security-Policy', value: contentSecurityPolicy },
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'X-Frame-Options', value: 'DENY' },
                ],
            },
            {
                source: '/globe/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
            {
                source: '/travel/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=2592000, stale-while-revalidate=86400',
                    },
                ],
            },
            {
                source: '/travel-thumbs/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=2592000, stale-while-revalidate=86400',
                    },
                ],
            },
            {
                source: '/certificates/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=2592000, stale-while-revalidate=86400',
                    },
                ],
            },
            {
                // Pre-sized hero portrait derivatives — content-addressed by
                // filename, so they can be cached indefinitely.
                source: '/profile/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
        ];
    },
    images: {
        formats: ['image/avif', 'image/webp'],
        qualities: [75, 88, 92],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
            },
        ],
    },
};

module.exports = withNextIntl(nextConfig);
