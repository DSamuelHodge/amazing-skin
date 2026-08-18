import React, { useEffect, useState } from 'react';
import { 
  CheckCircle2, 
  Package, 
  Truck, 
  Home, 
  Printer, 
  Download, 
  Sparkles, 
  Leaf, 
  Calendar, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Gift, 
  ArrowRight,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useCartStore } from '@/src/lib/trpc';
import { useAuthStore } from '@/src/lib/authStore';
import { toast } from 'sonner';

export default function OrderConfirmedPage() {
  const { setCartId } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const [orderData, setOrderData] = useState<any>(null);

  // Get order ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('orderId') || 'LUM-882194';

  useEffect(() => {
    // Clear cart ID on successful order
    setCartId(null);

    // Attempt to load order data from localStorage
    try {
      const saved = localStorage.getItem('lumina_last_order');
      if (saved) {
        setOrderData(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  }, [setCartId]);

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const estimatedDelivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const items = orderData?.items || [
    {
      id: 'default_item',
      quantity: 1,
      unitPrice: 45.00,
      product: { name: 'Lumina Glow Serum', primaryCategory: 'Face' },
      variant: { name: '30ml', sku: 'LGS-30' },
      image: { imageUrl: 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/bd1db224-b438-47b5-8cb4-6744fbdc7fa2_800w.jpg' }
    }
  ];

  const subtotal = orderData?.data?.financials?.subtotal || items.reduce((acc: number, i: any) => acc + (i.unitPrice * i.quantity), 0);
  const total = orderData?.data?.financials?.total || subtotal;
  const shippingAddress = orderData?.data?.shippingAddress;
  const pointsEarned = Math.floor(total);

  return (
    <div className="min-h-screen bg-[#faf7f2] py-10 sm:py-16 px-4 sm:px-6 lg:px-8 text-stone-900 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Order Confirmation Hero Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-stone-200/90 text-center relative overflow-hidden">
          {/* Subtle botanical aesthetic aura */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-100/60 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-amber-100/40 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center max-w-2xl mx-auto">
            {/* Animated Botanical Checkmark */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-emerald-900 text-emerald-300 border-4 border-emerald-700/30 flex items-center justify-center mb-6 shadow-lg shadow-emerald-950/10">
              <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-400 stroke-[2]" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-3 border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Ritual Order Confirmed
            </div>

            <h1 className="text-3xl sm:text-4xl font-serif text-stone-900 font-medium tracking-tight">
              Thank You for Your Ritual Order
            </h1>

            <p className="text-sm font-mono text-stone-500 mt-2">
              Reference #{orderId} • Formulated & Dispatched {formattedDate}
            </p>

            <p className="text-xs sm:text-sm text-stone-600 mt-4 leading-relaxed max-w-lg">
              We have received your order. Our laboratory artisans have begun batch formulating your active botanical solutions. A confirmation receipt and courier tracking details have been dispatched to{' '}
              <strong className="text-stone-900">{shippingAddress?.email || user?.email || 'your email'}</strong>.
            </p>

            {/* Quick Actions Bar */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-6 pt-4 border-t border-stone-100 w-full">
              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Print / Save Receipt
              </button>

              <button
                type="button"
                onClick={() => {
                  toast.info('Live Courier Dispatch Tracking', {
                    description: `Carrier: FedEx Botanical Priority (${orderId}). Package is in temperature-controlled staging.`
                  });
                }}
                className="px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-medium transition-colors flex items-center gap-1.5 border border-emerald-200"
              >
                <Truck className="w-3.5 h-3.5 text-emerald-700" />
                Track Live Courier
              </button>
            </div>
          </div>
        </div>

        {/* Live Interactive Fulfillment Timeline */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200/90 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-medium text-stone-900">
                Fulfillment & Transit Timeline
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Estimated Delivery: <strong className="text-stone-900">{estimatedDelivery}</strong>
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              Fresh Batch Verified
            </span>
          </div>

          <div className="relative">
            {/* Timeline track */}
            <div className="hidden sm:block absolute top-1/2 left-8 right-8 -translate-y-1/2 h-0.5 bg-stone-200 z-0" />
            <div className="hidden sm:block absolute top-1/2 left-8 w-1/3 -translate-y-1/2 h-0.5 bg-emerald-700 z-0" />

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative z-10">
              {/* Stage 1 */}
              <div className="flex sm:flex-col items-center sm:text-center gap-3 p-3 bg-emerald-50/60 rounded-2xl sm:bg-transparent">
                <div className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center shadow-xs shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-emerald-950">1. Order Placed</h4>
                  <p className="text-[11px] text-emerald-800">Payment Authorized</p>
                </div>
              </div>

              {/* Stage 2 */}
              <div className="flex sm:flex-col items-center sm:text-center gap-3 p-3 bg-amber-50/70 rounded-2xl sm:bg-transparent">
                <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs shrink-0 animate-pulse">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-950">2. Lab Cold-Pressing</h4>
                  <p className="text-[11px] text-amber-800">In Formulation (Today)</p>
                </div>
              </div>

              {/* Stage 3 */}
              <div className="flex sm:flex-col items-center sm:text-center gap-3 p-3 bg-stone-50 rounded-2xl sm:bg-transparent opacity-60">
                <div className="w-10 h-10 rounded-full bg-stone-200 text-stone-500 flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-700">3. Priority Transit</h4>
                  <p className="text-[11px] text-stone-500">Zero-Emission Courier</p>
                </div>
              </div>

              {/* Stage 4 */}
              <div className="flex sm:flex-col items-center sm:text-center gap-3 p-3 bg-stone-50 rounded-2xl sm:bg-transparent opacity-60">
                <div className="w-10 h-10 rounded-full bg-stone-200 text-stone-500 flex items-center justify-center shrink-0">
                  <Home className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-700">4. At Sanctuary</h4>
                  <p className="text-[11px] text-stone-500">{estimatedDelivery}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Summary Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Order Details & Line Items */}
          <div className="md:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-stone-200/90 space-y-4">
              <h3 className="font-serif text-lg font-medium text-stone-900 pb-3 border-b border-stone-100">
                Formulations in this Ritual
              </h3>

              <div className="divide-y divide-stone-100">
                {items.map((item: any) => (
                  <div key={item.id} className="py-3.5 flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-xl bg-stone-100 overflow-hidden shrink-0 border border-stone-200">
                      <img src={item.image?.imageUrl} alt={item.product?.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-stone-900 truncate">{item.product?.name}</h4>
                      <p className="text-[11px] text-stone-500">{item.variant?.name} &times; {item.quantity}</p>
                    </div>
                    <span className="text-xs font-bold text-stone-900 font-mono">
                      ${(item.unitPrice * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Order Totals */}
              <div className="pt-3 border-t border-stone-100 space-y-2 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span className="font-mono font-medium text-stone-900">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Shipping & Handling</span>
                  <span className="text-emerald-700 font-medium font-mono">Complimentary</span>
                </div>
                <div className="flex justify-between text-base font-serif font-medium text-stone-900 pt-2 border-t border-stone-100">
                  <span>Total Paid</span>
                  <span className="font-mono font-bold text-stone-900">${Number(total).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Member Points Earned Celebration */}
            <div className="bg-[#15281e] text-emerald-50 rounded-3xl p-6 shadow-sm border border-emerald-900/50 flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                    Lumina Ritual Loyalty
                  </span>
                </div>
                <p className="text-sm font-medium text-white mt-1">
                  You earned <strong className="text-amber-300 font-bold">+{pointsEarned} loyalty points</strong> from this purchase!
                </p>
                <p className="text-xs text-emerald-200/80 mt-0.5">
                  Points have been accredited to your member profile for future botanical discounts.
                </p>
              </div>
            </div>
          </div>

          {/* Shipping Destination & Delivery Prep Advice */}
          <div className="md:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200/90 space-y-4">
              <h3 className="font-serif text-lg font-medium text-stone-900 pb-2 border-b border-stone-100">
                Delivery Details
              </h3>

              <div className="text-xs space-y-3 text-stone-600">
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">Destination</span>
                  <p className="font-semibold text-stone-900 mt-0.5">
                    {shippingAddress?.firstName || user?.firstName || 'Clara'} {shippingAddress?.lastName || user?.lastName || 'Vance'}
                  </p>
                  <p>{shippingAddress?.address1 || '450 Sutter Street, Suite 1200'}</p>
                  <p>{shippingAddress?.city || 'San Francisco'}, {shippingAddress?.state || 'CA'} {shippingAddress?.postalCode || '94108'}</p>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">Contact</span>
                  <p className="font-mono">{shippingAddress?.email || user?.email || 'clara.vance@example.com'}</p>
                  <p className="font-mono">{shippingAddress?.phone || '(415) 890-3321'}</p>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">Payment Method</span>
                  <p className="font-medium text-stone-900">Encrypted Card (•••• 4242)</p>
                </div>
              </div>
            </div>

            {/* Skincare Ritual Preparation Concierge Card */}
            <div className="bg-[#faf7f2] rounded-3xl p-6 border border-stone-200/80 space-y-3">
              <div className="flex items-center gap-2 text-stone-900">
                <Leaf className="w-4 h-4 text-emerald-700" />
                <h4 className="font-serif text-sm font-bold">How to Prepare for Your Ritual</h4>
              </div>
              <ul className="text-xs text-stone-600 space-y-2 leading-relaxed list-disc list-inside">
                <li>Cleanse nightly with lukewarm water to prime your lipid barrier.</li>
                <li>Store your fresh peptide formulations away from direct sunlight once arrived.</li>
                <li>Perform a 24h patch test on the lower jawline before full application.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="text-center pt-4">
          <button
            type="button"
            onClick={() => window.location.href = '/'}
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#15281e] hover:bg-[#1e392b] text-white font-medium rounded-2xl transition-all shadow-md text-sm"
          >
            <span>Continue Exploring Sanctuary Formulations</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
