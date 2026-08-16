# Architecture

## Runtime shape

The project is an incremental modular monolith: Next.js owns rendering and the
browser-facing origin, while Express remains the data and upload service during
the migration.

```text
Browser --> Next.js --/api gateway--> Express --> MongoDB
   |                                      |------> Cloudinary
   `------ server-rendered HTML           `------> GitHub adapter
```

Browser requests default to `/api`. Next.js rewrites them to `BACKEND_API_URL`,
which keeps the backend location private and allows the HTTP-only admin cookie
to remain first-party. Server Components call `BACKEND_API_URL` directly.

## Boundaries

- `frontend/src/app`: routing, metadata, and server-side composition.
- `frontend/src/components`: interactive client islands and presentation.
- `frontend/src/lib`: API/configuration adapters; components do not build
  backend URLs themselves.
- `backend/src/app.ts`: middleware and route composition, with no database
  connection or listening side effect.
- `backend/src/server.ts`: environment validation, database connection, process
  lifecycle, and graceful shutdown.
- `backend/src/controllers`: HTTP-to-domain translation.
- `backend/src/models`: persistence definitions.
- `backend/src/middleware/schemas.ts`: authoritative runtime input contracts.

## Data and rendering rules

1. Public content is fetched in parallel by the locale page and rendered into
   initial HTML. Client components use static content only as an outage/empty-DB
   fallback.
2. Interactive behavior remains client-side; only the Three.js globe skips SSR.
3. Public API reads use short CDN caches. Auth/admin responses are `no-store`.
4. Requests have bounded payload sizes and timeouts.
5. Admin mutations use an HTTP-only, Secure production cookie. Unsafe requests
   require `X-Requested-With`, preventing plain-form CSRF.
6. Analytics identifiers are HMAC hashes; raw IP addresses are not persisted.

## Next extraction targets

Do not create another service merely to reorganize code. Extract a service only
when it has an independent scaling, runtime, or security requirement. Likely
candidates are a future AI worker or long-running media pipeline. Ordinary
portfolio CRUD should migrate from Express to Next.js server functions over
time, one feature at a time.

The largest remaining structural hotspot is the admin dashboard. Split it by
feature (`travel`, `blog`, `projects`, `certificates`, `timeline`, `about`) when
those screens next receive product work, preserving the API contracts and tests.

## Media migration

`frontend/public/travel` still contains hundreds of megabytes of originals.
Keep thumbnails and brand assets in the app; move full-resolution images and
videos to Cloudinary or object storage. Run `npm run media:audit` to see the
current footprint, and `npm run media:audit -- --strict` when enforcing the
25 MiB per-file / 500 MiB total transitional budget in CI.
