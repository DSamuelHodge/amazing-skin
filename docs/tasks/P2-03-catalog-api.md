# P2-03 Catalog routers on Postgres

- **Phase:** 2 — Backend tRPC & auth
- **Priority:** critical
- **Type:** feat
- **Branch:** `feat/catalog-api`
- **Depends on:** P1-03, P2-01

## Summary

`catalog.getCategories`, `getProducts`, `getProductBySlug`, `getFeaturedRitual`, `getRelatedProducts` query Drizzle instead of `mockData`.

## Acceptance criteria

- [x] Product PDP at `/product/lumina-glow-serum` renders DB data
- [x] Shop section can list seeded products
- [x] Cursor pagination on `getProducts`
- [x] Inactive products are hidden from the storefront

## Implementation notes

Keep TypeScript types in `src/types.ts` as the client contract; map numeric Drizzle columns to numbers at the boundary.
