# Lumina Skin Rituals

Clinical-calm skincare storefront. The repo is moving from a client-side prototype to the production architecture in [`PRODUCTION_ROADMAP.md`](PRODUCTION_ROADMAP.md).

## Stack

React 19 · Vite · Tailwind v4 · Drizzle ORM · tRPC v11 · Better Auth · GraphQL (drizzle-graphql) · Stripe (Phase 3)

Local/preview uses **PGLite** when `DATABASE_URL` is unset. Production expects Postgres (Neon / Cloud SQL / Supabase).

## Develop

```bash
cp .env.example .env
npm install
npm run db:generate   # after schema changes
npm run db:migrate
npm run db:seed
npm run dev           # storefront + /api/trpc + /api/auth + /graphql
```

## Auth (Better Auth + Infrastructure)

Email/password sessions mount at **`/api/auth/*`**. Better Auth Infrastructure (`dash()` + `sentinelClient()`) connects this app to [thenikkigcollection.com](https://thenikkigcollection.com) for the dashboard, audit log, and abuse protection.

| File | Role |
| --- | --- |
| [`lib/auth.ts`](lib/auth.ts) | Server `betterAuth()` + Drizzle adapter + `dash()` / `sentinel()` |
| [`lib/auth-client.ts`](lib/auth-client.ts) | Browser client + `dashClient()` / `sentinelClient()` |

Env (see `.env.example`): `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_API_KEY`.

Sign-up also upserts commerce `users` / `customer_profiles`. Email `hodge@agentmail.to` is `super_admin`. Magic-link UI stays informational until transactional email is wired.

## GraphQL CRUD (superadmin agent)

[`drizzle-graphql`](https://orm.drizzle.team/docs/graphql) builds queries, mutations, and resolvers from the Drizzle schema in one line:

```ts
const { schema } = buildSchema(db);
```

Every caller of `/graphql` **is `super_admin` with unrestricted autonomy**. No login, no RBAC, no table denylist. Introspection, GraphiQL, insert, update, and delete stay on.

- **GraphiQL + endpoint:** `/graphql`
- **Health:** `/graphql/health`
- **Who am I:** `query { agentIdentity { id email role autonomy privileges } }`
- **Operation index:** `query { agentOperations { name kind } }`

Generated per table (camelCase of the Drizzle export):

| Kind | Pattern |
| --- | --- |
| List | `products`, `orders`, `discountCodes`, `users`, … |
| Single | `productsSingle`, `ordersSingle`, … |
| Insert | `insertIntoProducts` / `insertIntoProductsSingle` |
| Update | `updateProducts` |
| Delete | `deleteFromProducts` |

Filters (`where` / `eq` / `ilike` / …), `orderBy`, and `offset`/`limit` are generated. Nested relations follow `src/db/schema.ts`.

```graphql
query Whoami {
  agentIdentity { role autonomy privileges }
}

query Catalog {
  products {
    slug
    name
    basePrice
    variants { sku stockQuantity }
  }
}
```

## GitHub Flow

See [`CONTRIBUTING.md`](CONTRIBUTING.md) and the PR-sized backlog in [`docs/tasks/README.md`](docs/tasks/README.md).

```
git checkout -b feat/short-slug
# …one concern…
# PR title: feat(scope): imperative summary
# PR body: Closes #<n>
```

To publish the local backlog as GitHub issues (needs `issues:write`):

```bash
./scripts/publish-issues.sh
```

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Vite + `/api/trpc` + `/graphql` |
| `npm run build` | Production client bundle |
| `npm run lint` | `tsc --noEmit` |
| `npm run db:migrate` | Apply `drizzle/` SQL |
| `npm run db:seed` | Idempotent catalog seed |
| `npm run test:e2e` | Guest checkout + inventory lock (needs a running `npm run dev`) |
| `npm run test:a11y` | Keyboard: skip link, cart, sign-in, shipping field |

## Environment

Never commit secrets. Copy `.env.example` → `.env`.

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | prod | Postgres. Unset locally → embedded PGLite in `data/pglite` |
| `BETTER_AUTH_SECRET` | yes | Session signing |
| `BETTER_AUTH_API_KEY` | infra | Better Auth dash/sentinel |
| `BETTER_AUTH_URL` | prod | `https://thenikkigcollection.com` after DNS leaves Wix |
| `BETTER_AUTH_USE_PRODUCTION_URL` | prod | Set `true` only after the domain points at this app |
| `STRIPE_SECRET_KEY` | payments | **`sk_test_` only** — `sk_live_` is refused |
| `STRIPE_PUBLISHABLE_KEY` | payments | Matching `pk_test_` |
| `STRIPE_WEBHOOK_SECRET` | webhooks | Stripe CLI / Dashboard signing secret |
| `RESEND_API_KEY` | email | Unset = log and skip; capture still succeeds |
| `EMAIL_FROM` | email | Default `Lumina Skin Rituals <orders@thenikkigcollection.com>` |
| `APP_URL` | preview/prod | Public origin for auth cookies and return URLs |

## Stripe webhook

Dashboard (test mode) endpoint:

```
https://<your-host>/api/webhooks/stripe
```

Events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.canceled`.
Raw body is required — do not JSON-parse this route. Locally: `stripe listen --forward-to localhost:8080/api/webhooks/stripe`.

## Deploy

Production artifact is `npm run build` (`dist/`). Pair with:

1. Postgres `DATABASE_URL`
2. `npm run db:migrate` then `npm run db:seed` on first release
3. Env vars from the table above (no live Stripe keys)
4. Host that serves the Vite build **and** the `/api/*` + `/graphql` Node middleware (Vite preview, Cloud Run with a Node server, or Vercel with a server entry)

Vercel: set Root Directory to this repo, Node 22, the env vars, and point the Stripe webhook at `https://<project>.vercel.app/api/webhooks/stripe`. Cloud Run: containerize `npm run build && npm run preview` (or a custom Node host) bound to `$PORT`.

Until `thenikkigcollection.com` DNS leaves Wix, keep `BETTER_AUTH_USE_PRODUCTION_URL` unset so preview auth stays on `APP_URL`.

