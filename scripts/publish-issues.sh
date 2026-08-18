#!/usr/bin/env bash
# Publish docs/tasks/*.md as GitHub issues.
# Requires: gh auth with issues:write and a repo that allows label create.
set -euo pipefail

REPO="${REPO:-DSamuelHodge/amazing-skin}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

labels=(
  "phase:1-foundation|1d4ed8|Phase 1: Database, tokens, and project foundation"
  "phase:2-backend|7c3aed|Phase 2: tRPC server, auth, cart, catalog"
  "phase:3-payments|0f766e|Phase 3: Stripe checkout, webhooks, inventory"
  "phase:4-portals|c2410c|Phase 4: Admin dashboard and customer portal"
  "phase:5-hardening|334155|Phase 5: QA, a11y, CI/CD, production deploy"
  "priority:critical|b91c1c|Blocks production; ship first"
  "priority:high|ea580c|Required for a complete storefront"
  "priority:medium|ca8a04|Important but not a launch blocker"
)

echo "Creating labels on ${REPO}…"
for entry in "${labels[@]}"; do
  IFS='|' read -r name color desc <<<"$entry"
  gh label create "$name" --color "$color" --description "$desc" --repo "$REPO" --force
done

mapfile -t files < <(find "$ROOT/docs/tasks" -name 'P*.md' | sort)

echo "Creating issues…"
for file in "${files[@]}"; do
  title="$(sed -n 's/^# //p' "$file" | head -1)"
  body="$(cat "$file")"
  echo "→ $title"
  gh issue create --repo "$REPO" --title "$title" --body "$body" --label "enhancement"
done

echo "Done. Update PR bodies with Closes #<n>."
