# Production backlog

Issues derived from [`PRODUCTION_ROADMAP.md`](../../PRODUCTION_ROADMAP.md). Each task is sized for **one GitHub pull request**.

GitHub Issues API is currently read-only for this workspace token, so the canonical copies live here. When write access is restored, run:

```bash
./scripts/publish-issues.sh
```

That script creates labels, opens one issue per file in this folder, and prints the issue numbers to paste into PR bodies (`Closes #<n>`).

## Workflow

| Step | Convention |
| --- | --- |
| Branch | `type/short-slug` matching the Proposed branch in the issue |
| PR title | Conventional Commit, e.g. `feat(db): add drizzle-kit migrations` |
| PR body | Use `.github/PULL_REQUEST_TEMPLATE.md` + `Closes #<n>` |
| Merge | Squash merge into `main` |

## Dependency graph

```
P1-00 github-workflow          (this PR — templates, CI, backlog)
   │
   ├── P1-01 design-tokens     ── concurrent with P1-02
   ├── P1-02 db-foundation     ── concurrent with P1-01
   │       └── P1-03 catalog-seed
   │
   └── P2-01 trpc-server
           ├── P2-02 auth-rbac
           ├── P2-03 catalog-api      ── needs P1-03
           └── P2-04 cart-merge       ── needs P2-02
                   └── P3-01 stripe-element
                           └── P3-02 stripe-webhooks
                                   └── P3-03 order-emails
                                           ├── P4-01 admin-dashboard
                                           ├── P4-02 customer-portal
                                           └── P4-03 promotions-gwp
                                                   ├── P5-01 e2e-checkout
                                                   ├── P5-02 wcag-lighthouse
                                                   └── P5-03 ci-cd-deploy
```

**Concurrent now:** P1-01 (tokens) and P1-02 (db client/migrations) do not share files.

## Task index

| ID | Phase | Priority | Title | Branch |
| --- | --- | --- | --- | --- |
| [P1-00](P1-00-github-workflow.md) | 1 | high | GitHub issue/PR templates and CI | `chore/github-workflow` |
| [P1-01](P1-01-design-tokens.md) | 1 | medium | OKLCH design token system | `feat/design-tokens` |
| [P1-02](P1-02-db-foundation.md) | 1 | critical | Drizzle client, kit, migrations | `feat/db-foundation` |
| [P1-03](P1-03-catalog-seed.md) | 1 | critical | Seed catalog from mock data | `feat/catalog-seed` |
| [P2-01](P2-01-trpc-server.md) | 2 | critical | Express + tRPC v11 server | `feat/trpc-server` |
| [P2-02](P2-02-auth-rbac.md) | 2 | critical | Session auth and RBAC | `feat/auth-rbac` |
| [P2-03](P2-03-catalog-api.md) | 2 | critical | Catalog routers on Postgres | `feat/catalog-api` |
| [P2-04](P2-04-cart-merge.md) | 2 | high | Server cart + guest merge | `feat/cart-merge` |
| [P3-01](P3-01-stripe-element.md) | 3 | critical | Stripe Payment Element | `feat/stripe-element` |
| [P3-02](P3-02-stripe-webhooks.md) | 3 | critical | Webhooks + inventory lock | `feat/stripe-webhooks` |
| [P3-03](P3-03-order-emails.md) | 3 | high | Order confirmation email | `feat/order-emails` |
| [P4-01](P4-01-admin-dashboard.md) | 4 | high | Admin dashboard routes | `feat/admin-dashboard` |
| [P4-02](P4-02-customer-portal.md) | 4 | high | Customer account portal | `feat/customer-portal` |
| [P4-03](P4-03-promotions-gwp.md) | 4 | medium | Promotions and GWP engine | `feat/promotions-gwp` |
| [P5-01](P5-01-e2e-checkout.md) | 5 | high | E2E checkout tests | `test/e2e-checkout` |
| [P5-02](P5-02-wcag-lighthouse.md) | 5 | medium | WCAG AA + Lighthouse > 90 | `a11y/wcag-lighthouse` |
| [P5-03](P5-03-ci-cd-deploy.md) | 5 | high | Production CI/CD | `ci/production-deploy` |
