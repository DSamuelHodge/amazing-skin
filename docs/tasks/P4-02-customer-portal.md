# P4-02 Customer account portal

- **Phase:** 4 — Admin & customer portals
- **Priority:** high
- **Type:** feat
- **Branch:** `feat/customer-portal`
- **Depends on:** P2-02, P3-02

## Summary

`/account/*` for order history, addresses, skin profile, and wishlist. Replace the customer dropdown stubs with real `customer.*` procedures.

## Acceptance criteria

- [ ] Signed-in users see their orders from the DB
- [ ] Address book CRUD with default shipping/billing flags
- [ ] Skin type + concerns persist on `customer_profiles`
- [ ] Wishlist toggle is unique per (user, product)
