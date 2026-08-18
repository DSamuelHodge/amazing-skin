# P1-03 Seed catalog from mock data

- **Phase:** 1 — Database & foundation
- **Priority:** critical
- **Type:** feat
- **Branch:** `feat/catalog-seed`
- **Depends on:** P1-02

## Summary

Translate `src/data/mockData.ts` into idempotent seed rows: categories, products, variants, images, ingredients, reviews, related products, and a `SAVE10` / `GLOW20` / `WELCOME50` discount set.

## Acceptance criteria

- [ ] `npm run db:seed` is idempotent (upsert by slug / SKU / INCI)
- [ ] Evening ritual SKUs exist: Cloud Melt, Lumina Barrier Serum, Velvet Lock, Midnight Recovery Mask, Velvet Oil Cleanser, Daylight Dew SPF 30, Lumina Glow Serum
- [ ] Glow Serum variants LGS-30 / LGS-50 / LGS-100 match mock prices and stock
- [ ] Seed is safe to re-run in preview (PGLite) and on Neon

## Implementation notes

`src/db/seed.ts` only. Do not delete `mockData.ts` until catalog API (P2-03) is live.
