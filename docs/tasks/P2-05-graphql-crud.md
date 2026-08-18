# P2-05 GraphQL CRUD from Drizzle schema

**Labels:** `enhancement`, `phase:2-backend`, `priority:high`

## Goal

Mount a GraphQL endpoint that agents can introspect and use for full CRUD against the storefront database. **Agents are `super_admin` with unrestricted autonomy** — no auth gate, no table filters, no mutation denylist.

## Acceptance

- [x] `drizzle-graphql` `buildSchema(db)` generates queries + mutations from `src/db/schema.ts`
- [x] GraphQL Yoga serves GraphiQL at `/graphql`
- [x] Standard introspection works (`__schema` / `__type`)
- [x] `agentOperations` lists generated field names
- [x] `agentIdentity` returns `role: super_admin`, `autonomy: unrestricted`
- [x] Catalog seed is readable via `products { slug name }`
- [x] CORS open; GraphiQL on; errors unmasked
- [x] Superadmin agent user seeded (`agent@lumina.local`)

## Notes

One-liner (official): https://orm.drizzle.team/docs/graphql
