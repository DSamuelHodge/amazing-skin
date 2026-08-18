# P3-03 Order confirmation email

- **Phase:** 3 — Stripe & checkout
- **Priority:** high
- **Type:** feat
- **Branch:** `feat/order-emails`
- **Depends on:** P3-02

## Summary

Dispatch an order confirmation (Resend or SendGrid) after a captured payment. Include order number, items, totals, and shipping address.

## Acceptance criteria

- [ ] Email send is triggered from the webhook transaction success path
- [ ] Failures are logged and do not roll back payment capture
- [ ] `.env.example` documents `RESEND_API_KEY` / `EMAIL_FROM`
- [ ] Local/dev without a key skips send and logs
