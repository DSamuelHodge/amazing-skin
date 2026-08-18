# P5-02 WCAG 2.1 AA and Lighthouse > 90

- **Phase:** 5 — QA, hardening & deploy
- **Priority:** medium
- **Type:** a11y
- **Branch:** `a11y/wcag-lighthouse`
- **Labels:** `accessibility`

## Summary

Hit roadmap §8: 44×44 targets, 4.5:1 body contrast, focus-visible rings, focus trap in cart/auth, LCP < 1.8s, CLS < 0.05, lazy checkout/admin chunks.

## Acceptance criteria

- [ ] Lighthouse Performance and Accessibility ≥ 90 on home + PDP
- [ ] Keyboard can open cart, sign in, and complete shipping fields
- [ ] Hero images use AVIF/WebP + `fetchpriority="high"` and explicit aspect-ratio
