# P5-03 Production CI/CD

- **Phase:** 5 — QA, hardening & deploy
- **Priority:** high
- **Type:** ci
- **Branch:** `ci/production-deploy`
- **Depends on:** P1-00

## Summary

Extend CI with typecheck + migration dry-run. Document Cloud Run / Vercel deploy, required secrets, and webhook endpoint.

## Acceptance criteria

- [ ] README lists env vars, `npm run db:migrate`, and deploy steps
- [ ] Production build is the artifact that deploys
- [ ] Stripe webhook URL and secrets are documented, not committed
