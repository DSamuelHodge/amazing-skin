# P2-04 Server-authoritative cart and guest merge

- **Phase:** 2 — Backend tRPC & auth
- **Priority:** high
- **Type:** feat
- **Branch:** `feat/cart-merge`
- **Depends on:** P2-02, P1-03

## Summary

Persist carts in `carts` / `cart_items`. Guest carts key off `anonymousSessionId`. On sign-in, merge per roadmap §5.2 (sum qty, cap at available stock, delete guest cart).

## Acceptance criteria

- [ ] `cart.get|addItem|updateItem|removeItem|applyDiscountCode|removeDiscountCode|mergeGuestCart` work against the DB
- [ ] Cart survives refresh (cookie / session id)
- [ ] Sign-in merges quantities and never exceeds `stock_quantity - reserved_quantity`
- [ ] Unique `(cartId, variantId)` is respected

## Implementation notes

Replace the mutable `mockCart` in `src/lib/trpc.ts`. Drawer UI should not need a redesign.
