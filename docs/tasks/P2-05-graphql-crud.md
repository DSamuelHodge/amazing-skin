# P2-05 GraphQL CRUD from Drizzle schema

**Labels:** `enhancement`, `phase:2-backend`, `priority:high`

## Goal

Mount a GraphQL endpoint that agents can introspect and use for full CRUD against the storefront database.

## Acceptance

- [x] `drizzle-graphql` `buildSchema(db)` generates queries + mutations from `src/db/schema.ts`
- [x] GraphQL Yoga serves GraphiQL at `/graphql`
- [x] Standard introspection works (`__schema` / `__type`)
- [x] `agentOperations` lists generated field names
- [x] Catalog seed is readable via `products { slug name }`
- [ ] Privileged: do not ship unauthenticated on a public host (follow-up auth gate)

## Notes

One-liner (official): https://orm.drizzle.team/docs/graphql
