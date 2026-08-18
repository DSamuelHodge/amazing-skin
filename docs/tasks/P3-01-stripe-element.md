# P3-01 Stripe Payment Element

- **Phase:** 3 — Stripe & checkout
- **Priority:** critical
- **Type:** feat
- **Branch:** `feat/stripe-element`
- **Depends on:** P2-04

## Summary

Replace the visual card form in checkout Step 3 with Stripe Payment Element. Server creates a PaymentIntent after validating totals and reserving stock for 15 minutes.

## Acceptance criteria

- [ ] `checkout.createPaymentIntent` returns a client secret
- [ ] Payment Element mounts in `PaymentStep.tsx`
- [ ] Prices are computed server-side; client amounts are ignored
- [ ] `.env.example` documents `STRIPE_PUBLISHABLE_KEY` and `STRIPE_SECRET_KEY`

## Implementation notes

Do not handle webhooks here (P3-02). Keep the existing multi-step checkout chrome.
