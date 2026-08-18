# Lumina Skin Rituals

Clinical-calm skincare storefront. The repo is moving from a client-side prototype to the production architecture in [`PRODUCTION_ROADMAP.md`](PRODUCTION_ROADMAP.md).

## Stack

React 19 · Vite · Tailwind v4 · Drizzle ORM · tRPC v11 · GraphQL (drizzle-graphql) · Stripe (Phase 3)

Local/preview uses **PGLite** when `DATABASE_URL` is unset. Production expects Postgres (Neon / Cloud SQL / Supabase).

## Develop

```bash
cp .env.example .env
npm install
npm run db:generate   # after schema changes
npm run db:migrate
npm run db:seed
npm run dev           # storefront + /api/trpc + /graphql
```

## GraphQL CRUD (agent endpoint)

[`drizzle-graphql`](https://orm.drizzle.team/docs/graphql) builds queries, mutations, and resolvers from the Drizzle schema in one line:

```ts
const { schema } = buildSchema(db);
```

That schema is served by GraphQL Yoga:

- **GraphiQL + endpoint:** `/graphql`
- **Health:** `/graphql/health`
- **Introspection:** enabled (`__schema`, `__type`)
- **Agent index:** `query { agentOperations { name kind } }`

Generated per table (camelCase of the Drizzle export):

| Kind | Pattern |
| --- | --- |
| List | `products`, `orders`, `discountCodes`, … |
| Single | `productsSingle`, `ordersSingle`, … |
| Insert | `insertIntoProducts` / `insertIntoProductsSingle` |
| Update | `updateProducts` |
| Delete | `deleteFromProducts` |

Filters (`where` / `eq` / `ilike` / …), `orderBy`, and `offset`/`limit` are generated. Nested relations follow `src/db/schema.ts`.

Example — list the catalog:

```graphql
query Catalog {
  products {
    slug
    name
    basePrice
    variants { sku stockQuantity }
  }
}
```

This endpoint is the storefront's **data agency surface**. Treat it as privileged (full CRUD, including users). Do not expose it unauthenticated on a public host.

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
