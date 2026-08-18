# Lumina Skin Rituals

Clinical-calm skincare storefront. The repo is moving from a client-side prototype to the production architecture in [`PRODUCTION_ROADMAP.md`](PRODUCTION_ROADMAP.md).

## Stack

React 19 · Vite · Tailwind v4 · Drizzle ORM · tRPC v11 · Stripe (Phase 3)

Local/preview uses **PGLite** when `DATABASE_URL` is unset. Production expects Postgres (Neon / Cloud SQL / Supabase).

## Develop

```bash
cp .env.example .env
npm install
npm run db:generate   # after schema changes
npm run db:migrate
npm run db:seed
npm run dev           # http://localhost:8080
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
| `npm run dev` | Vite + `/api/trpc` on port 8080 |
| `npm run build` | Production client bundle |
| `npm run lint` | `tsc --noEmit` |
| `npm run db:migrate` | Apply `drizzle/` SQL |
| `npm run db:seed` | Idempotent catalog seed |
