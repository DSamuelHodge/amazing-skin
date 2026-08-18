# P2-02 Session auth and RBAC

- **Phase:** 2 — Backend tRPC & auth
- **Priority:** critical
- **Type:** feat
- **Branch:** `feat/auth-rbac`
- **Depends on:** P2-01

## Summary

Implement `auth.signUp` / `signIn` / `signOut` / `getCurrentUser` with HttpOnly session cookies, password hashing, and role middleware (`customer` < `support` < `manager` < `admin` < `super_admin`).

## Acceptance criteria

- [ ] Passwords stored as hashes (bcrypt or argon2id), never plaintext
- [ ] Session cookie is HttpOnly, SameSite=Lax, Secure in production
- [ ] Admin procedures reject `customer` sessions with `FORBIDDEN`
- [ ] `src/lib/authStore.ts` talks to the server instead of inventing users
- [ ] Guest session id `lumina_session_id` is minted if missing (see roadmap §5.1)

## Implementation notes

Magic-link tab in `AuthModal` can remain UI-only. Do not add social providers in this PR.
