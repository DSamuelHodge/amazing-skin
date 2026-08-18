# P1-01 OKLCH design token system

- **Phase:** 1 — Database & foundation
- **Priority:** medium
- **Type:** feat
- **Branch:** `feat/design-tokens`
- **Labels:** `enhancement`
- **Concurrent with:** P1-02

## Summary

Finish the Organic Luxury token system from §2 of the roadmap and replace hardcoded hex in storefront, checkout, auth, and admin chrome.

## Current state

`src/index.css` already declares `--canvas-*` and `--brand-*` OKLCH values, but body still uses `bg-[#1b2320]` and most components hardcode `#f4eadf`, `#15281e`, `#faf7f2`.

## Acceptance criteria

- [ ] `:root` and `.dark` expose the full token set from the roadmap (canvas, brand, text-primary, text-muted, border-subtle, border-strong, spacing, radius, type scale)
- [ ] Tailwind `@theme` aliases exist (`bg-canvas-bg`, `text-text-primary`, `border-border-subtle`, `bg-brand-primary`, …)
- [ ] No `#rrggbb` remain in `src/components` or `src/routes` except dynamic variant `hexCode` and card-brand gradients that are not brand tokens
- [ ] Light shop sections stay alabaster; dark hero/nav stay night forest
- [ ] Visual appearance is unchanged to a casual shopper

## Implementation notes

Touch `src/index.css`, `src/components/**`, `src/routes/**`. Do not change schema, tRPC, or package.json.
