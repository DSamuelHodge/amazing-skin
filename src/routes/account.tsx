import { useEffect, useState } from 'react';
import { Heart, MapPin, Package, Sparkles, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/src/components/ui/Button';
import { useAuthStore } from '@/src/lib/authStore';
import { navigate } from '@/src/lib/nav';
import { trpc } from '@/src/lib/trpc';

type Tab = 'orders' | 'addresses' | 'skin' | 'wishlist';

const CONCERNS = ['Redness', 'Barrier', 'Dryness', 'Texture', 'Dullness', 'Sensitivity'];

export default function AccountPage() {
  const { isAuthenticated, user, openAuthModal } = useAuthStore();
  const [tab, setTab] = useState<Tab>('orders');

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'addresses' || hash === 'skin' || hash === 'wishlist' || hash === 'orders') {
      setTab(hash);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      openAuthModal('signin');
    }
  }, [isAuthenticated, openAuthModal]);

  if (!isAuthenticated || !user) {
    return (
      <section className="bg-canvas-bg text-stone-900 min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h1 className="font-playfair text-3xl mb-3">Sign in to your ritual</h1>
          <p className="text-stone-600 mb-6">
            Orders, addresses, and your skin profile live here once you are signed in.
          </p>
          <Button variant="light" onClick={() => openAuthModal('signin')}>
            Sign in
          </Button>
        </div>
      </section>
    );
  }

  const tabs: { id: Tab; label: string; icon: typeof Package }[] = [
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'skin', label: 'Skin profile', icon: Sparkles },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
  ];

  return (
    <section className="bg-canvas-bg text-stone-900 min-h-[70vh] w-full">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <p className="text-xs tracking-[0.18em] uppercase text-stone-500 mb-3">Your account</p>
        <h1 className="font-playfair text-4xl tracking-tight">
          Hello, {user.firstName || 'there'}
        </h1>
        <p className="mt-2 text-stone-600 text-sm">
          {user.loyaltyTier} · {user.loyaltyPoints} pts · {user.email}
        </p>

        <div className="mt-8 flex flex-wrap gap-2">
          {tabs.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setTab(item.id);
                  window.history.replaceState({}, '', `/account#${item.id}`);
                }}
                className={`inline-flex items-center gap-2 rounded-full px-4 h-11 text-sm font-medium border transition-colors ${
                  active
                    ? 'bg-stone-900 text-forest-text border-stone-900'
                    : 'bg-white/70 text-stone-800 border-stone-300 hover:bg-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="mt-10">
          {tab === 'orders' && <OrdersPanel />}
          {tab === 'addresses' && <AddressPanel />}
          {tab === 'skin' && <SkinPanel />}
          {tab === 'wishlist' && <WishlistPanel />}
        </div>
      </div>
    </section>
  );
}

function OrdersPanel() {
  const query = trpc.customer.orders.useQuery();
  const orders = query.data ?? [];

  if (query.isLoading) {
    return <p className="text-stone-500">Loading orders…</p>;
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-3xl border border-stone-200 bg-canvas-surface p-8 text-center">
        <Package className="w-10 h-10 mx-auto text-stone-300 mb-3" />
        <h2 className="font-playfair text-2xl">No orders yet</h2>
        <p className="text-stone-600 mt-2 mb-6">When you complete a ritual order, it will land here.</p>
        <Button variant="light" onClick={() => navigate('/')}>
          Browse the shop
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <article key={order.id} className="rounded-3xl border border-stone-200 bg-canvas-surface p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-stone-500">{order.orderNumber}</p>
              <h3 className="font-medium mt-1 capitalize">{order.status.replaceAll('_', ' ')}</h3>
            </div>
            <p className="font-semibold">${order.total.toFixed(2)}</p>
          </div>
          <ul className="mt-4 space-y-1 text-sm text-stone-700">
            {order.items.map((item) => (
              <li key={item.id}>
                {item.quantity}× {item.productName} · {item.variantName}
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}

function AddressPanel() {
  const list = trpc.customer.addresses.list.useQuery();
  const create = trpc.customer.addresses.create.useMutation();
  const remove = trpc.customer.addresses.remove.useMutation();
  const setDefault = trpc.customer.addresses.setDefault.useMutation();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    addressLine1: '',
    city: '',
    state: '',
    postalCode: '',
    isDefaultShipping: true,
  });

  const refresh = () => list.refetch();

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
      <form
        className="rounded-3xl border border-stone-200 bg-canvas-surface p-6 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          create.mutate(form, {
            onSuccess: () => {
              toast.success('Address saved');
              setForm({
                firstName: '',
                lastName: '',
                addressLine1: '',
                city: '',
                state: '',
                postalCode: '',
                isDefaultShipping: true,
              });
              void refresh();
            },
            onError: (err) => toast.error(err.message),
          });
        }}
      >
        <h2 className="font-playfair text-2xl">Add address</h2>
        {(['firstName', 'lastName', 'addressLine1', 'city', 'state', 'postalCode'] as const).map((key) => (
          <input
            key={key}
            required
            value={form[key]}
            onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
            placeholder={key.replace(/([A-Z])/g, ' $1')}
            className="w-full h-11 rounded-xl border border-stone-300 bg-white px-3 text-sm"
          />
        ))}
        <label className="flex items-center gap-2 text-sm text-stone-700">
          <input
            type="checkbox"
            checked={form.isDefaultShipping}
            onChange={(e) => setForm((prev) => ({ ...prev, isDefaultShipping: e.target.checked }))}
          />
          Default shipping
        </label>
        <Button type="submit" variant="light" disabled={create.isPending}>
          Save address
        </Button>
      </form>

      <div className="space-y-3">
        {(list.data ?? []).map((address) => (
          <article key={address.id} className="rounded-3xl border border-stone-200 bg-canvas-surface p-5">
            <p className="font-medium">
              {address.firstName} {address.lastName}
            </p>
            <p className="text-sm text-stone-600 mt-1">
              {address.addressLine1}, {address.city} {address.state} {address.postalCode}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {address.isDefaultShipping && (
                <span className="text-[11px] uppercase tracking-wide bg-emerald-50 text-emerald-800 px-2 py-1 rounded-full">
                  Default ship
                </span>
              )}
              {address.isDefaultBilling && (
                <span className="text-[11px] uppercase tracking-wide bg-stone-100 text-stone-700 px-2 py-1 rounded-full">
                  Default bill
                </span>
              )}
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="lightOutline"
                onClick={() =>
                  setDefault.mutate(
                    { id: address.id, type: 'shipping' },
                    { onSuccess: () => void refresh() },
                  )
                }
              >
                Set default
              </Button>
              <button
                type="button"
                className="inline-flex items-center justify-center h-8 w-8 rounded-full text-stone-500 hover:text-stone-900"
                onClick={() =>
                  remove.mutate({ id: address.id }, { onSuccess: () => void refresh() })
                }
                aria-label="Remove address"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function SkinPanel() {
  const me = trpc.customer.me.useQuery();
  const update = trpc.customer.updateSkinProfile.useMutation();
  const [skinType, setSkinType] = useState('sensitive');
  const [concerns, setConcerns] = useState<string[]>([]);

  useEffect(() => {
    if (me.data?.primarySkinType) setSkinType(me.data.primarySkinType);
    if (me.data?.skinConcerns) setConcerns(me.data.skinConcerns);
  }, [me.data]);

  return (
    <div className="rounded-3xl border border-stone-200 bg-canvas-surface p-6 max-w-xl">
      <h2 className="font-playfair text-2xl mb-4">Skin profile</h2>
      <label className="text-sm text-stone-600">Primary skin type</label>
      <select
        className="mt-2 w-full h-11 rounded-xl border border-stone-300 bg-white px-3 text-sm"
        value={skinType}
        onChange={(e) => setSkinType(e.target.value)}
      >
        {['dry', 'oily', 'combination', 'sensitive', 'normal'].map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
      <p className="text-sm text-stone-600 mt-5 mb-2">Concerns</p>
      <div className="flex flex-wrap gap-2">
        {CONCERNS.map((concern) => {
          const active = concerns.includes(concern);
          return (
            <button
              key={concern}
              type="button"
              onClick={() =>
                setConcerns((prev) =>
                  active ? prev.filter((c) => c !== concern) : [...prev, concern],
                )
              }
              className={`h-11 px-4 rounded-full text-sm border ${
                active
                  ? 'bg-stone-900 text-forest-text border-stone-900'
                  : 'bg-white text-stone-800 border-stone-300'
              }`}
            >
              {concern}
            </button>
          );
        })}
      </div>
      <Button
        className="mt-6"
        variant="light"
        onClick={() =>
          update.mutate(
            {
              primarySkinType: skinType as 'dry' | 'oily' | 'combination' | 'sensitive' | 'normal',
              skinConcerns: concerns,
            },
            { onSuccess: () => toast.success('Skin profile saved') },
          )
        }
        disabled={update.isPending}
      >
        Save profile
      </Button>
    </div>
  );
}

function WishlistPanel() {
  const list = trpc.customer.wishlist.list.useQuery();
  const toggle = trpc.customer.wishlist.toggle.useMutation();
  const items = list.data ?? [];

  if (list.isLoading) return <p className="text-stone-500">Loading wishlist…</p>;

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-stone-200 bg-canvas-surface p-8 text-center">
        <Heart className="w-10 h-10 mx-auto text-stone-300 mb-3" />
        <h2 className="font-playfair text-2xl">Nothing saved yet</h2>
        <p className="text-stone-600 mt-2">Tap the heart on a product to keep it here.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <article key={item.id} className="rounded-3xl border border-stone-200 bg-canvas-surface overflow-hidden">
          {item.imageUrl && (
            <a href={`/product/${item.slug}`}>
              <img src={item.imageUrl} alt={item.name} className="w-full h-40 object-cover" />
            </a>
          )}
          <div className="p-4 flex items-start justify-between gap-3">
            <div>
              <a href={`/product/${item.slug}`} className="font-medium hover:underline">
                {item.name}
              </a>
              <p className="text-sm text-stone-600 mt-1">${item.price.toFixed(2)}</p>
            </div>
            <button
              type="button"
              className="h-11 w-11 inline-flex items-center justify-center rounded-full border border-stone-300"
              onClick={() =>
                toggle.mutate({ productId: item.productId }, { onSuccess: () => void list.refetch() })
              }
              aria-label={`Remove ${item.name} from wishlist`}
            >
              <Heart className="w-4 h-4 fill-current" />
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
