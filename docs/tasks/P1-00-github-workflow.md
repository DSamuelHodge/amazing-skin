# P1-00 GitHub issue/PR templates and CI

- **Phase:** 1 — Database & foundation
- **Priority:** high
- **Type:** chore
- **Branch:** `chore/github-workflow`
- **Labels:** `documentation`, `enhancement`

## Summary

Adopt GitHub Flow so every production task is a reviewable pull request: issue forms, PR template, Conventional Commits, and a lint/build check on PRs.

## Current state

No `.github/` directory. No README. No CI. Default labels only.

## Acceptance criteria

- [ ] `.github/PULL_REQUEST_TEMPLATE.md` exists and requires Summary, Test plan, `Closes #`
- [ ] Issue forms for task / bug / feature
- [ ] `CONTRIBUTING.md` documents branch + title conventions
- [ ] CI workflow runs `npm run lint` and `npm run build` on PRs to `main`
- [ ] Backlog files live under `docs/tasks/`

## Implementation notes

Do not change application code in this PR.
