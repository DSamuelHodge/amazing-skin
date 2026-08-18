import { useEffect, useState } from 'react';
import { Coins, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/src/lib/authStore';
import { trpcClient } from '@/src/lib/trpc';
import type { ShippingFormData } from './ShippingStep';
import { StripePayForm } from './StripePayForm';

interface PaymentStepProps {
  total: number;
  subtotal: number;
  onBack: () => void;
  formData: ShippingFormData;
  discountCode?: string;
  pointsRedeemed: number;
  setPointsRedeemed: React.Dispatch<React.SetStateAction<number>>;
  onPaid: (result: { orderId: string; orderNumber: string; items: unknown }) => void;
}

function toAddress(form: ShippingFormData) {
  return {
    firstName: form.firstName,
    lastName: form.lastName,
    addressLine1: form.address1,
    addressLine2: form.address2 || undefined,
    city: form.city,
    state: form.state,
    postalCode: form.postalCode,
    country: form.country || 'US',
    phone: form.phone || undefined,
  };
}

export function PaymentStep({
  total,
  onBack,
  formData,
  discountCode,
  pointsRedeemed,
  setPointsRedeemed,
  onPaid,
}: PaymentStepProps) {
  const { user, isAuthenticated } = useAuthStore();
  const [intent, setIntent] = useState<{
    orderId: string;
    orderNumber: string;
    clientSecret: string;
    paymentIntentId: string;
    mode: 'demo' | 'test' | 'live-blocked';
    publishableKey: string | null;
    amount: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const config = await trpcClient.checkout.config.query();
        const created = await trpcClient.checkout.createPaymentIntent.mutate({
          email: formData.email,
          shipping: toAddress(formData),
          billing: formData.sameAsShipping ? undefined : toAddress(formData),
          shippingMethod: formData.shippingMethod,
          giftPackaging: formData.giftPackaging,
          pointsRedeemed,
          discountCode,
          notes: formData.deliveryNotes || undefined,
        });
        if (cancelled) return;
        setIntent({
          orderId: created.orderId,
          orderNumber: created.orderNumber,
          clientSecret: created.clientSecret,
          paymentIntentId: created.paymentIntentId,
          mode: created.mode,
          publishableKey: config.publishableKey,
          amount: created.amount,
        });
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : 'Could not start payment.';
        setError(message);
        toast.error(message);
      }
    })();
    return () => {
      cancelled = true;
    };
    // Intent is created once when Step 3 mounts so we do not double-reserve stock.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConfirm = async () => {
    if (!intent) return;
    setConfirming(true);
    try {
      const result = await trpcClient.checkout.confirmOrder.mutate({
        orderId: intent.orderId,
        paymentIntentId: intent.paymentIntentId,
      });
      onPaid({
        orderId: result.orderId,
        orderNumber: result.orderNumber,
        items: [],
      });
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="bg-canvas-elevated rounded-3xl p-6 sm:p-9 shadow-sm border border-border-subtle text-text-primary space-y-8">
      <div className="pb-5 border-b border-border-subtle flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-primary">Step 03 of 03</span>
          <h2 className="text-2xl sm:text-3xl font-serif text-text-primary tracking-tight mt-0.5">Encrypted Payment</h2>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Amounts are priced on the server. Card data never touches Lumina servers.
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200">
          <Lock className="w-3.5 h-3.5" />
          <span>{intent?.mode === 'test' ? 'Stripe test mode' : 'Demo capture'}</span>
        </div>
      </div>

      {isAuthenticated && user && user.loyaltyPoints > 0 && (
        <div className="p-4 rounded-2xl bg-forest-bg text-forest-text border border-forest-border space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-brand-accent" />
              <span className="text-xs font-bold uppercase tracking-wider text-brand-accent">Redeem Lumina Member Points</span>
            </div>
            <span className="text-xs font-medium text-forest-muted">
              Available: <strong>{user.loyaltyPoints} pts</strong>
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { label: 'Do not use points', points: 0 },
              { label: 'Use 50 pts', points: Math.min(50, user.loyaltyPoints) },
              { label: `Use all ${user.loyaltyPoints} pts`, points: user.loyaltyPoints },
            ].map((opt) => (
              <button
                key={opt.label}
                type="button"
                onClick={() => setPointsRedeemed(opt.points)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium min-h-11 ${
                  pointsRedeemed === opt.points
                    ? 'bg-brand-accent text-forest-bg font-bold'
                    : 'bg-forest-elevated text-forest-muted hover:bg-forest-surface'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">{error}</div>
      )}

      {!intent && !error && (
        <div className="flex items-center justify-center py-12">
          <div className="w-10 h-10 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {intent && (
        <StripePayForm
          total={intent.amount || total}
          clientSecret={intent.clientSecret}
          publishableKey={intent.publishableKey}
          mode={intent.mode}
          onBack={onBack}
          onConfirm={handleConfirm}
          isConfirming={confirming}
        />
      )}
    </div>
  );
}
