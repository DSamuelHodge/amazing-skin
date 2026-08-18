# P4-02 Customer account portal

- **Phase:** 4 — Admin & customer portals
- **Priority:** high
- **Type:** feat
- **Branch:** `feat/customer-portal`
- **Depends on:** P2-02, P3-02

## Summary

`/account/*` for order history, addresses, skin profile, and wishlist. Replace the customer dropdown stubs with real `customer.*` procedures.

## Acceptance criteria

- [x] Signed-in users see their orders from the DB
- [x] Address book CRUD with default shipping/billing flags
- [x] Skin type + concerns persist on `customer_profiles`
- [x] Wishlist toggle is unique per (user, product)
