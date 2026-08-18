# P3-02 Stripe webhooks and inventory lock

- **Phase:** 3 — Stripe & checkout
- **Priority:** critical
- **Type:** feat
- **Branch:** `feat/stripe-webhooks`
- **Depends on:** P3-01

## Summary

Signed webhook at `/api/webhooks/stripe`. On `payment_intent.succeeded`, capture payment, convert reservations into stock deductions, write `inventory_logs`, and mark the order `processing`. Idempotent on already-captured orders.

## Acceptance criteria

- [ ] Signature verified with `STRIPE_WEBHOOK_SECRET`
- [ ] Atomic reservation: `reserved_quantity` only increments when available stock is sufficient
- [ ] Replayed events are no-ops
- [ ] Failed / expired intents release reservations

## Implementation notes

Follow roadmap §6. Raw body required for Stripe signature verification — do not JSON-parse that route.
