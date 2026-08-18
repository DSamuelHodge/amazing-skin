# P5-01 End-to-end checkout tests

- **Phase:** 5 — QA, hardening & deploy
- **Priority:** high
- **Type:** test
- **Branch:** `test/e2e-checkout`
- **Depends on:** P3-02

## Summary

Playwright (or equivalent) covers guest add-to-cart → shipping → Stripe test card → confirmation page.

## Acceptance criteria

- [ ] `npm run test:e2e` is documented
- [ ] Stripe test mode (`4242…`) succeeds
- [ ] Out-of-stock variant cannot be reserved
- [ ] CI can run e2e against a preview URL
