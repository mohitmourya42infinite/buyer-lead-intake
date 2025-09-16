## Buyer Leads

Lightweight Next.js app to manage buyer leads with CSV import/export, validation, auth, and Prisma.

### Quick start

1) Prereqs
- Node 20+
- pnpm/npm/yarn (examples use npm)

2) Env
Create `.env` at project root:

```bash
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET="dev-secret"
NEXTAUTH_URL="http://localhost:3000"
# For server components that fetch the API directly (SSR path)
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

3) Install, migrate, seed, dev

```bash
npm install
npx prisma migrate dev --name init
# optional: seed minimal data (create a user) via dev auth flow when you sign in
npm run dev
```

Open `http://localhost:3000`.

### Design notes

- **Validation**: Lives in `src/lib/validation.ts` using Zod. The same schema (`buyerSchema`) is used by API routes for create and CSV import to keep rules consistent (e.g., bhk required for certain property types, budgetMin ≤ budgetMax).

- **SSR vs client**:
  - Listing page (`src/app/buyers/page.tsx`) is an async server component that fetches from the internal API with `cache: "no-store"` for freshness, then renders a table. When there are no items, it renders `src/components/EmptyState.tsx`.
  - Global error handling is done client-side via `src/components/ErrorBoundary.tsx`, wrapped in `src/app/layout.tsx` so runtime errors in the tree are caught and a friendly fallback is shown.

- **Ownership enforcement**:
  - Auth via NextAuth Credentials. Each `Buyer` has `ownerId` referencing `User`.
  - API `POST /api/buyers` requires a valid session and uses `session.user.id` as `ownerId`. `GET /api/buyers` requires a session as well. The import route currently uses a demo owner placeholder (`ownerId: "import"`) for simplicity; in real usage, wire it to the authenticated user.

- **Concurrency and rate limiting**:
  - A simple in-memory token bucket in `src/lib/ratelimit.ts` is applied to `POST /api/buyers` to mitigate bursts (keyed by user and IP). Prisma writes that must be consistent are wrapped in `$transaction` blocks (create buyer + audit history).

### What’s done vs skipped

Done:
- Buyers CRUD: list and create API; server-rendered listing UI
- Zod validation shared across API and CSV import
- CSV export with filters; CSV import with header/row validation and mapping
- NextAuth credentials-based “dev” auth; middleware protects `/buyers` and `/api`
- Rate limiting for create; basic audit trail via `BuyerHistory`
- Error boundary and empty-state UX

Skipped/Deferred:
- Full UI for create/edit forms (server has endpoint; UI partially scaffolded)
- Robust ownership checks on import/export (import uses demo `ownerId`)
- Production logging/monitoring; persistent rate-limit store; background jobs
- E2E tests and comprehensive unit tests

### CSV import/export

- **Export**: `GET /api/buyers/export` supports the same query params as the list page (`q`, `city`, `propertyType`, `status`, `timeline`). It returns a CSV with headers:
  `fullName,email,phone,city,propertyType,bhk,purpose,budgetMin,budgetMax,timeline,source,notes,tags,status`.

- **Import**: `POST /api/buyers/import` with raw CSV text body. Requirements:
  - Max 200 rows
  - Must include the same headers as export
  - `tags` pipe-delimited (e.g., `hot|budget>1cr`)
  - Errors are returned with row numbers (2-based, accounting for header)
  - Note: currently assigns `ownerId: "import"`. Adjust to session user for real use.

Example (curl):

```bash
curl -X POST \
  -H "Content-Type: text/plain" \
  --data-binary @buyers.csv \
  http://localhost:3000/api/buyers/import
```

### Running tests

```bash
npm test
```

Unit tests live in `src/tests`. Add Vitest config if you expand coverage.

### Dev auth and local testing

- Visit `/signin` and enter any email to create or reuse a demo user.
- Protected routes are enforced by `src/middleware.ts` using NextAuth.
- For API testing without the browser, you can set a header or localStorage in dev:
  - The app uses session JWTs via NextAuth. For quick local API testing, send `Cookie: next-auth.session-token=...` from your browser session.
  - Alternatively, for very quick development with a proxy or custom client, you can simulate a user via `x-user-email` header if you add a tiny dev-only handler around `authorize` (not included by default). Recommended path is to authenticate via `/signin` and reuse the cookie.

### Notes for production

- Replace SQLite with Postgres/MySQL in `prisma/schema.prisma` and update `DATABASE_URL`.
- Replace in-memory rate limiter with Redis.
- Add structured logging and error monitoring.
- Lock down CSV import ownership and bump validations as needed.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
