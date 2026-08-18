# P4-03 Promotions and gift-with-purchase

- **Phase:** 4 — Admin & customer portals
- **Priority:** medium
- **Type:** feat
- **Branch:** `feat/promotions-gwp`
- **Depends on:** P2-04

## Summary

Honor `discount_codes` (percentage, fixed, free shipping, GWP). Auto-attach GWP when subtotal ≥ threshold. Enforce usage limits.

## Acceptance criteria

- [ ] Codes `LUMINA10`, `GLOW20`, `WELCOME50` seed and apply correctly
- [ ] GWP line is `isFreeGift` and does not stack twice
- [ ] Per-customer and global usage limits are enforced
- [ ] Admin can create/deactivate codes (`admin.discounts.manage`)
