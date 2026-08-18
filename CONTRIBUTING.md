# Contributing to Lumina Skin Rituals

This repo follows [GitHub Flow](https://docs.github.com/en/get-started/using-github/github-flow) and [Conventional Commits](https://www.conventionalcommits.org/).

## One issue → one branch → one PR

1. Pick an open issue from the [production backlog](docs/tasks/README.md).
2. Create a branch from `main`:

   ```bash
   git checkout main
   git pull
   git checkout -b <type>/<short-slug>
   ```

   Examples: `feat/design-tokens`, `feat/cart-merge`, `fix/webhook-idempotency`.

3. Keep the PR to a single concern. Schema + seed can share a PR; Stripe UI + webhook handler should not.
4. Open the PR against `main` using `.github/PULL_REQUEST_TEMPLATE.md`.
5. Title format:

   ```
   <type>(<scope>): <imperative summary>
   ```

   Types: `feat` `fix` `docs` `style` `refactor` `perf` `test` `chore` `ci`.

6. Link the issue in the body with `Closes #<n>` so merge auto-closes it.

## Review bar

- `npm run lint` and `npm run build` must pass (enforced by `.github/workflows/ci.yml`).
- UI PRs include a screenshot or short recording.
- No secrets. New env vars go in `.env.example` with a comment.
- Do not rewrite the Drizzle schema in a UI PR. Schema changes belong in a dedicated `feat/db-*` PR.

## Source of truth

Production architecture, schema, tRPC surface, and Stripe flow live in [`PRODUCTION_ROADMAP.md`](PRODUCTION_ROADMAP.md). If an issue disagrees with that document, update the roadmap in the same PR.
