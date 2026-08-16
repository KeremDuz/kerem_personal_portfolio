# Kerem Düz — Full-Stack Portfolio

[Live site](https://www.keremduz.com) · [Repository](https://github.com/KeremDuz/kerem_personal_portfolio)

An interactive bilingual portfolio for projects, experience, certifications,
GitHub activity, technical writing, and travel memories. The public site is
server-rendered with Next.js; an authenticated Express API manages content,
analytics, and Cloudinary uploads.

## Stack

- Next.js 16, React 19, TypeScript, and next-intl
- Tailwind CSS, Framer Motion, and Three.js/react-globe.gl
- Express, MongoDB/Mongoose, and Zod
- HTTP-only JWT admin sessions, Helmet, CORS, and rate limiting
- Cloudinary media uploads

See [ARCHITECTURE.md](./ARCHITECTURE.md) for boundaries and migration decisions.

## Requirements

- Node.js 22 or newer
- npm 10 or newer
- MongoDB, or the included development database command
- A Cloudinary account only when testing uploads

## Setup

```bash
git clone https://github.com/KeremDuz/kerem_personal_portfolio.git
cd kerem_personal_portfolio
npm run install:all
```

Copy `.env.example` to `.env` and replace every placeholder secret. Required
values are `MONGODB_URI`, `JWT_SECRET`, `ANALYTICS_HASH_SALT`,
`ADMIN_USERNAME`, and `ADMIN_PASSWORD`.

The browser uses a same-origin `/api` gateway. For deployed environments, set
the server-only `BACKEND_API_URL` in the Next.js deployment. Avoid setting
`NEXT_PUBLIC_API_URL` unless a direct cross-origin API is intentional.

Seed the admin user and initial content:

```bash
npm run seed
```

## Development

Start the local database, API, and frontend together:

```bash
npm run dev
```

Or run them independently:

```bash
npm run dev:db
npm run dev:backend
npm run dev:frontend
```

- Site: `http://localhost:3000`
- Admin: `http://localhost:3000/admin`
- API health: `http://localhost:5000/api/health`

## Verification

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run media:audit
```

`npm run check` runs lint, both TypeScript checks, and the backend test suite.
The tests use Node's built-in runner and do not need a live MongoDB instance.

## Security and privacy

- Admin sessions are stored in HTTP-only cookies, never local storage.
- Production cookies are Secure and use the `__Host-` prefix.
- Mutations require an AJAX-only header as a CSRF barrier.
- Visitor IP addresses are HMAC-hashed before persistence.
- Do Not Track and Global Privacy Control disable custom analytics events.
- Admin/auth responses are never cached; public reads use bounded CDN caching.
- Upload deletion is restricted to the portfolio's Cloudinary folder.

Never commit `.env`, database files, or service credentials.

## Media

The checked-in travel library is supported as a fallback, but it is too large
to remain the long-term delivery path. New full-resolution media should go to
Cloudinary/object storage; only thumbnails and small immutable assets should
remain under `frontend/public`.
