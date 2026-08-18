# P2-01 Express + tRPC v11 server

- **Phase:** 2 — Backend tRPC & auth
- **Priority:** critical
- **Type:** feat
- **Branch:** `feat/trpc-server`
- **Depends on:** P1-00

## Summary

Replace the in-memory `src/lib/trpc.ts` facade with a real `@trpc/server` v11 router mounted at `/api/trpc` on the Vite/Express process (single port).

## Acceptance criteria

- [ ] `appRouter` exists with empty-but-typed `auth`, `catalog`, `cart`, `checkout`, `customer`, `admin` namespaces
- [ ] Vite (or Express+Vite middleware) serves the app and `/api/trpc` on one port
- [ ] Client uses `@trpc/client` + TanStack Query; mock module remains only as a flagged fallback
- [ ] Health procedure `catalog.ping` returns `{ ok: true }`

## Implementation notes

Do not implement business logic here — that is P2-02 through P2-04. Keep the public client hook names close to the current `trpc.cart.get.useQuery()` so UI diffs stay small.
