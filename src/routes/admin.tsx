import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  ArrowLeft,
  ClipboardList,
  LayoutDashboard,
  Package,
  ScrollText,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Tag,
  Truck,
  Users,
  Warehouse,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/src/lib/authStore';
import { trpcClient } from '@/src/lib/trpc';
import { STAFF_ROLES, type UserRole } from '@/src/lib/auth-types';
import { navigate } from '@/src/lib/nav';

type Tab =
  | 'overview'
  | 'orders'
  | 'catalog'
  | 'inventory'
  | 'customers'
  | 'promotions'
  | 'reviews'
  | 'cms'
  | 'audit';

const TABS: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'catalog', label: 'Catalog', icon: Package },
  { id: 'inventory', label: 'Inventory', icon: Warehouse },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'promotions', label: 'Promotions', icon: Tag },
  { id: 'reviews', label: 'Reviews', icon: Sparkles },
  { id: 'cms', label: 'CMS', icon: ClipboardList },
  { id: 'audit', label: 'Audit', icon: ScrollText },
];

function money(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

export default function AdminPage() {
  const { user, isAuthenticated, hydrateSession, openAuthModal } = useAuthStore();
  const [tab, setTab] = useState<Tab>('overview');

  useEffect(() => {
    void hydrateSession();
  }, [hydrateSession]);

  const role = user?.role as UserRole | undefined;
  const allowed = Boolean(isAuthenticated && role && STAFF_ROLES.includes(role));

  if (!allowed) {
    return (
      <div className="min-h-screen bg-forest-bg text-forest-text flex items-center justify-center px-6">
        <div className="max-w-md w-full rounded-[28px] bg-forest-surface border border-forest-border p-8 space-y-4">
          <ShieldCheck className="w-8 h-8 text-brand-accent" />
          <h1 className="font-serif text-3xl">Operations console</h1>
          <p className="text-sm text-forest-muted leading-relaxed">
            Staff sign-in is required. Customers cannot reach fulfillment, catalog, or audit tools.
          </p>
          <button
            type="button"
            onClick={() => openAuthModal('admin')}
            className="w-full min-h-11 rounded-2xl bg-brand-accent text-forest-bg font-medium"
          >
            Sign in as staff
          </button>
          <button type="button" onClick={() => navigate('/')} className="w-full min-h-11 text-sm text-forest-muted">
            Back to store
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas-bg text-text-primary flex">
      <aside className="hidden md:flex w-64 shrink-0 flex-col bg-forest-bg text-forest-text border-r border-forest-border">
        <div className="px-5 py-6 border-b border-forest-border">
          <p className="text-[10px] uppercase tracking-[0.2em] text-brand-accent">Lumina Ops</p>
          <h1 className="font-serif text-2xl mt-1">Console</h1>
          <p className="text-xs text-forest-muted mt-2 truncate">{user?.email}</p>
          <p className="text-[10px] uppercase tracking-wider text-brand-accent mt-1">{role}</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {TABS.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm min-h-11 transition-colors ${
                  active ? 'bg-forest-elevated text-brand-accent' : 'text-forest-muted hover:bg-forest-surface hover:text-forest-text'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="m-3 min-h-11 rounded-xl border border-forest-border text-sm text-forest-muted flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Storefront
        </button>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="md:hidden sticky top-0 z-20 bg-forest-bg text-forest-text px-4 py-3 flex gap-2 overflow-x-auto">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`px-3 py-2 rounded-full text-xs whitespace-nowrap min-h-11 ${tab === item.id ? 'bg-brand-accent text-forest-bg' : 'bg-forest-surface'}`}
            >
              {item.label}
            </button>
          ))}
        </header>
        <main className="p-4 sm:p-8 max-w-6xl">
          {tab === 'overview' && <OverviewPanel />}
          {tab === 'orders' && <OrdersPanel />}
          {tab === 'catalog' && <CatalogPanel />}
          {tab === 'inventory' && <InventoryPanel />}
          {tab === 'customers' && <CustomersPanel />}
          {tab === 'promotions' && <PromotionsPanel />}
          {tab === 'reviews' && <ReviewsPanel />}
          {tab === 'cms' && <CmsPanel />}
          {tab === 'audit' && <AuditPanel />}
        </main>
      </div>
    </div>
  );
}

function OverviewPanel() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'metrics'],
    queryFn: () => trpcClient.admin.metrics.dashboard.query({ range: '30d' }),
  });
  if (isLoading || !data) return <Skeleton />;
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-3xl">Thirty-day pulse</h2>
        <p className="text-sm text-text-muted mt-1">GMV, AOV, conversion, and stock that needs a purchase order.</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'GMV', value: money(data.gmv) },
          { label: 'AOV', value: money(data.aov) },
          { label: 'Captured orders', value: String(data.orderCount) },
          { label: 'Conversion', value: `${data.conversionRate}%` },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl bg-canvas-elevated border border-border-subtle p-5">
            <p className="text-[11px] uppercase tracking-wider text-text-muted">{card.label}</p>
            <p className="font-serif text-2xl mt-2 tabular-nums">{card.value}</p>
          </div>
        ))}
      </div>
      <section className="rounded-2xl bg-canvas-elevated border border-border-subtle p-5">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-amber-700" />
          <h3 className="font-medium">Low stock</h3>
        </div>
        {data.lowStock.length === 0 ? (
          <p className="text-sm text-text-muted">All variants are above threshold.</p>
        ) : (
          <ul className="divide-y divide-border-subtle">
            {data.lowStock.map((row) => (
              <li key={row.id} className="py-2 flex justify-between text-sm">
                <span>
                  {row.name} <span className="text-text-muted font-mono">{row.sku}</span>
                </span>
                <span className="tabular-nums">
                  {row.stock - row.reserved} avail / {row.threshold} min
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function OrdersPanel() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'orders', search],
    queryFn: () => trpcClient.admin.orders.list.query({ search: search || undefined }),
  });
  const [selected, setSelected] = useState<string | null>(null);
  const detail = useQuery({
    queryKey: ['admin', 'order', selected],
    queryFn: () => trpcClient.admin.orders.get.query({ id: selected! }),
    enabled: Boolean(selected),
  });

  const advance = async (status: 'packing' | 'shipped' | 'in_transit' | 'delivered', tracking?: string) => {
    if (!selected) return;
    await trpcClient.admin.orders.updateStatus.mutate({
      orderId: selected,
      fulfillmentStatus: status,
      trackingCarrier: 'USPS',
      trackingNumber: tracking,
    });
    toast.success(`Order moved to ${status}`);
    void qc.invalidateQueries({ queryKey: ['admin', 'orders'] });
    void qc.invalidateQueries({ queryKey: ['admin', 'order', selected] });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-3xl">Order pipeline</h2>
          <p className="text-sm text-text-muted">Processing → packing → shipped → delivered. Tracking writes a fulfillment row.</p>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search number or email"
          className="h-11 px-3 rounded-xl border border-border-strong bg-canvas-elevated text-sm min-w-56"
        />
      </div>
      <div className="grid lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2 rounded-2xl border border-border-subtle bg-canvas-elevated overflow-hidden">
          {isLoading ? (
            <Skeleton />
          ) : (
            <ul>
              {(data ?? []).map((order) => (
                <li key={order.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(order.id)}
                    className={`w-full text-left px-4 py-3 border-b border-border-subtle ${selected === order.id ? 'bg-emerald-50' : ''}`}
                  >
                    <div className="flex justify-between text-sm">
                      <span className="font-mono">{order.orderNumber}</span>
                      <span className="tabular-nums">{money(order.totalAmount)}</span>
                    </div>
                    <p className="text-xs text-text-muted mt-1">
                      {order.email} · {order.orderStatus} / {order.fulfillmentStatus}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="lg:col-span-3 rounded-2xl border border-border-subtle bg-canvas-elevated p-5 min-h-80">
          {!selected && <p className="text-sm text-text-muted">Select an order.</p>}
          {detail.data && (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-sm">{detail.data.orderNumber}</p>
                  <h3 className="font-serif text-2xl">{money(detail.data.totalAmount)}</h3>
                  <p className="text-xs text-text-muted">
                    {detail.data.paymentStatus} · {detail.data.fulfillmentStatus}
                  </p>
                </div>
                <Truck className="w-5 h-5 text-brand-primary" />
              </div>
              <ul className="text-sm space-y-1">
                {detail.data.items.map((item) => (
                  <li key={item.id} className="flex justify-between">
                    <span>
                      {item.productName} × {item.quantity}
                      {item.isFreeGift ? ' (GWP)' : ''}
                    </span>
                    <span className="tabular-nums">{money(item.lineTotal)}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="px-3 min-h-11 rounded-xl border border-border-strong text-xs" onClick={() => advance('packing')}>
                  Packing
                </button>
                <button
                  type="button"
                  className="px-3 min-h-11 rounded-xl border border-border-strong text-xs"
                  onClick={() => {
                    const tracking = window.prompt('USPS tracking number') ?? undefined;
                    void advance('shipped', tracking);
                  }}
                >
                  Ship + tracking
                </button>
                <button type="button" className="px-3 min-h-11 rounded-xl border border-border-strong text-xs" onClick={() => advance('delivered')}>
                  Delivered
                </button>
                <button
                  type="button"
                  className="px-3 min-h-11 rounded-xl border border-red-200 text-red-800 text-xs"
                  onClick={async () => {
                    if (!window.confirm('Refund and restock this order?')) return;
                    await trpcClient.admin.orders.refund.mutate({ orderId: selected!, reason: 'requested_by_customer', restock: true });
                    toast.success('Refunded');
                    void qc.invalidateQueries({ queryKey: ['admin'] });
                  }}
                >
                  Refund + restock
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CatalogPanel() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'catalog'],
    queryFn: () => trpcClient.admin.catalog.list.query(),
  });
  if (isLoading) return <Skeleton />;
  return (
    <div className="space-y-4">
      <h2 className="font-serif text-3xl">Catalog</h2>
      <p className="text-sm text-text-muted">Products, variants, SKUs, and live/hidden flags from Postgres.</p>
      <div className="space-y-3">
        {(data ?? []).map((product) => (
          <article key={product.id} className="rounded-2xl border border-border-subtle bg-canvas-elevated p-5">
            <div className="flex flex-wrap justify-between gap-2">
              <div>
                <h3 className="font-serif text-xl">{product.name}</h3>
                <p className="text-xs text-text-muted font-mono">{product.slug}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${product.isActive ? 'bg-emerald-50 text-emerald-900' : 'bg-stone-100 text-stone-600'}`}>
                {product.isActive ? 'Live' : 'Hidden'}
              </span>
            </div>
            <ul className="mt-3 text-sm divide-y divide-border-subtle">
              {product.variants.map((v) => (
                <li key={v.id} className="py-2 flex justify-between">
                  <span>
                    {v.name} · <span className="font-mono text-text-muted">{v.sku}</span>
                  </span>
                  <span className="tabular-nums">
                    {money(v.price)} · {v.available} avail
                  </span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}

function InventoryPanel() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ['admin', 'inventory'],
    queryFn: () => trpcClient.admin.inventory.list.query(),
  });
  const logs = useQuery({
    queryKey: ['admin', 'inventory-logs'],
    queryFn: () => trpcClient.admin.inventory.logs.query({ limit: 20 }),
  });

  return (
    <div className="space-y-5">
      <h2 className="font-serif text-3xl">Inventory ledger</h2>
      <div className="rounded-2xl border border-border-subtle bg-canvas-elevated overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-text-muted">
            <tr>
              <th className="px-4 py-3">SKU</th>
              <th>Product</th>
              <th className="text-right">On hand</th>
              <th className="text-right">Reserved</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((row) => (
              <tr key={row.id} className="border-t border-border-subtle">
                <td className="px-4 py-3 font-mono text-xs">{row.sku}</td>
                <td>{row.productName}</td>
                <td className="text-right tabular-nums">{row.stockQuantity}</td>
                <td className="text-right tabular-nums">{row.reservedQuantity}</td>
                <td className="px-4 py-2 text-right">
                  <button
                    type="button"
                    className="text-xs min-h-11 px-3 rounded-xl border border-border-strong"
                    onClick={async () => {
                      const raw = window.prompt(`Adjust ${row.sku} (positive restock, negative shrink)`, '25');
                      if (!raw) return;
                      const delta = Number(raw);
                      const reason = window.prompt('Reason', 'Cycle count restock') ?? 'adjustment';
                      await trpcClient.admin.inventory.adjust.mutate({ variantId: row.id, delta, reason });
                      toast.success('Inventory updated');
                      void qc.invalidateQueries({ queryKey: ['admin'] });
                    }}
                  >
                    Adjust
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <section>
        <h3 className="text-sm font-medium mb-2">Recent ledger</h3>
        <ul className="text-xs space-y-1 text-text-muted">
          {(logs.data ?? []).map((log) => (
            <li key={log.id} className="font-mono">
              {log.createdAt.toString().slice(0, 19)} · {log.action} · {log.quantityChange} → {log.resultingStock}
              {log.note ? ` · ${log.note}` : ''}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function CustomersPanel() {
  const { data } = useQuery({
    queryKey: ['admin', 'customers'],
    queryFn: () => trpcClient.admin.customers.list.query(),
  });
  return (
    <div className="space-y-4">
      <h2 className="font-serif text-3xl">Customers</h2>
      <div className="rounded-2xl border border-border-subtle bg-canvas-elevated overflow-hidden">
        {(data ?? []).map((c) => (
          <div key={c.id} className="px-4 py-3 border-b border-border-subtle flex justify-between gap-3 text-sm">
            <div>
              <p>
                {c.firstName} {c.lastName} <span className="text-text-muted">{c.email}</span>
              </p>
              <p className="text-xs text-text-muted">
                {c.loyaltyTier} · {c.loyaltyPoints} pts · {c.primarySkinType ?? 'no skin profile'}
              </p>
            </div>
            <span className="text-[10px] uppercase tracking-wider self-center">{c.role}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PromotionsPanel() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ['admin', 'discounts'],
    queryFn: () => trpcClient.admin.discounts.list.query(),
  });
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end gap-3">
        <div>
          <h2 className="font-serif text-3xl">Promotions & GWP</h2>
          <p className="text-sm text-text-muted">Percentage, fixed, free shipping, gift-with-purchase. Usage limits are enforced at checkout.</p>
        </div>
        <button
          type="button"
          className="min-h-11 px-4 rounded-xl bg-brand-primary text-white text-sm"
          onClick={async () => {
            const code = window.prompt('Code', 'GLOWGIFT');
            if (!code) return;
            await trpcClient.admin.discounts.upsert.mutate({
              code,
              discountType: 'fixed_amount',
              discountValue: 10,
              minSubtotal: 0,
              isActive: true,
            });
            toast.success('Code saved');
            void qc.invalidateQueries({ queryKey: ['admin', 'discounts'] });
          }}
        >
          New code
        </button>
      </div>
      <ul className="space-y-2">
        {(data ?? []).map((d) => (
          <li key={d.id} className="rounded-2xl border border-border-subtle bg-canvas-elevated p-4 flex justify-between gap-3">
            <div>
              <p className="font-mono text-sm">{d.code}</p>
              <p className="text-xs text-text-muted">
                {d.discountType} · {d.discountValue} · min {money(d.minSubtotal ?? 0)} · used {d.usageCount}
                {d.usageLimitTotal != null ? `/${d.usageLimitTotal}` : ''}
              </p>
            </div>
            <button
              type="button"
              className="text-xs min-h-11 px-3 rounded-xl border border-border-strong"
              onClick={async () => {
                await trpcClient.admin.discounts.setActive.mutate({ id: d.id, isActive: !d.isActive });
                void qc.invalidateQueries({ queryKey: ['admin', 'discounts'] });
              }}
            >
              {d.isActive ? 'Deactivate' : 'Activate'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ReviewsPanel() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ['admin', 'reviews'],
    queryFn: () => trpcClient.admin.reviews.list.query(),
  });
  return (
    <div className="space-y-4">
      <h2 className="font-serif text-3xl">Review moderation</h2>
      {(data ?? []).map((r) => (
        <article key={r.id} className="rounded-2xl border border-border-subtle bg-canvas-elevated p-4">
          <div className="flex justify-between gap-2">
            <p className="font-medium text-sm">
              {r.reviewerName} · {r.rating}/5
            </p>
            <span className="text-xs">{r.isApproved ? 'Published' : 'Held'}</span>
          </div>
          <p className="text-sm mt-2">{r.comment}</p>
          <div className="flex gap-2 mt-3">
            <button
              type="button"
              className="text-xs min-h-11 px-3 rounded-xl border border-border-strong"
              onClick={async () => {
                await trpcClient.admin.reviews.moderate.mutate({ id: r.id, isApproved: true });
                void qc.invalidateQueries({ queryKey: ['admin', 'reviews'] });
              }}
            >
              Approve
            </button>
            <button
              type="button"
              className="text-xs min-h-11 px-3 rounded-xl border border-border-strong"
              onClick={async () => {
                await trpcClient.admin.reviews.moderate.mutate({ id: r.id, isApproved: false });
                void qc.invalidateQueries({ queryKey: ['admin', 'reviews'] });
              }}
            >
              Hold
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

function CmsPanel() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ['admin', 'cms'],
    queryFn: () => trpcClient.admin.cms.list.query(),
  });
  return (
    <div className="space-y-4">
      <h2 className="font-serif text-3xl">Content blocks</h2>
      {(data ?? []).map((block) => (
        <article key={block.id} className="rounded-2xl border border-border-subtle bg-canvas-elevated p-4 space-y-2">
          <p className="font-mono text-xs">{block.key}</p>
          <h3 className="font-serif text-xl">{block.title}</h3>
          <pre className="text-xs bg-canvas-surface rounded-xl p-3 overflow-x-auto">{JSON.stringify(block.payload, null, 2)}</pre>
          <button
            type="button"
            className="text-xs min-h-11 px-3 rounded-xl border border-border-strong"
            onClick={async () => {
              const title = window.prompt('Title', block.title);
              if (!title) return;
              await trpcClient.admin.cms.upsert.mutate({
                id: block.id,
                key: block.key,
                title,
                payload: block.payload as Record<string, unknown>,
                isPublished: block.isPublished,
              });
              toast.success('Saved');
              void qc.invalidateQueries({ queryKey: ['admin', 'cms'] });
            }}
          >
            Rename
          </button>
        </article>
      ))}
    </div>
  );
}

function AuditPanel() {
  const { data } = useQuery({
    queryKey: ['admin', 'audit'],
    queryFn: () => trpcClient.admin.audit.list.query(),
  });
  return (
    <div className="space-y-4">
      <h2 className="font-serif text-3xl">Audit log</h2>
      <ul className="rounded-2xl border border-border-subtle bg-canvas-elevated divide-y divide-border-subtle">
        {(data ?? []).map((row) => (
          <li key={row.id} className="px-4 py-3 text-sm">
            <p className="font-mono text-xs text-text-muted">{row.createdAt.toString()}</p>
            <p>
              {row.action} · {row.targetEntity} · {row.targetId}
            </p>
          </li>
        ))}
        {(data ?? []).length === 0 && <li className="px-4 py-6 text-sm text-text-muted">No staff actions yet.</li>}
      </ul>
    </div>
  );
}

function Skeleton() {
  return <div className="h-40 rounded-2xl bg-canvas-surface border border-border-subtle animate-pulse" />;
}
