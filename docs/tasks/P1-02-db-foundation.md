# P1-02 Drizzle client, kit, and migrations

- **Phase:** 1 — Database & foundation
- **Priority:** critical
- **Type:** feat
- **Branch:** `feat/db-foundation`
- **Labels:** `enhancement`
- **Concurrent with:** P1-01

## Summary

Make `src/db/schema.ts` executable: drizzle-kit config, dual-mode client (Postgres when `DATABASE_URL` is set, PGLite otherwise), and a generated SQL migration.

## Current state

Schema TypeScript exists and matches the roadmap. There is no `drizzle.config.ts`, no client, no `drizzle-kit`, no `postgres` / PGLite driver, and `.env.example` only has Gemini keys.

## Acceptance criteria

- [ ] `drizzle.config.ts` points at `src/db/schema.ts` and `drizzle/`
- [ ] `src/db/client.ts` exports `getDb()` — `postgres` + drizzle when `DATABASE_URL` is set, else `@electric-sql/pglite`
- [ ] `npm run db:generate` and `npm run db:migrate` work
- [ ] First migration creates every table/enum in the schema
- [ ] `.env.example` documents `DATABASE_URL` (optional locally)

## Implementation notes

Do not rewrite `schema.ts` unless a compile error requires a one-line fix. Do not seed data (P1-03).
