# P4-01 Admin dashboard routes

- **Phase:** 4 — Admin & customer portals
- **Priority:** high
- **Type:** feat
- **Branch:** `feat/admin-dashboard`
- **Depends on:** P2-02, P3-02

## Summary

Promote `AdminDashboardModal` into `/admin/*` routes: metrics, product CRUD, order pipeline, inventory adjust. Server-side RBAC >= `support`.

## Acceptance criteria

- [ ] `/admin` is unreachable to customers
- [ ] Dashboard shows GMV, AOV, low-stock alerts for a time range
- [ ] Orders can move Processing → Packing → Shipped with tracking
- [ ] Inventory adjust writes `inventory_logs` + `audit_logs`
