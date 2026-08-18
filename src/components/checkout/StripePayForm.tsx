import { useState } from 'react';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { ArrowLeft, Lock, ShieldCheck, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const stripePromiseCache = new Map<string, Promise<Stripe | null>>();

function stripePromise(pk: string) {
  let p = stripePromiseCache.get(pk);
  if (!p) {
    p = loadStripe(pk);
    stripePromiseCache.set(pk, p);
  }
  return p;
}

export interface PayFormProps {
  total: number;
  clientSecret: string;
  publishableKey: string | null;
  mode: 'demo' | 'test' | 'live-blocked';
  onBack: () => void;
  onConfirm: () => Promise<void>;
  isConfirming: boolean;
}

function StripeInner({ total, onBack, onConfirm, isConfirming }: Omit<PayFormProps, 'clientSecret' | 'publishableKey' | 'mode'>) {
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setBusy(true);
    const { error } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
      confirmParams: { return_url: `${window.location.origin}/order-confirmed` },
    });
    if (error) {
      setBusy(false);
      toast.error(error.message ?? 'Payment failed');
      return;
    }
    try {
      await onConfirm();
    } catch (err) {
      setBusy(false);
      toast.error(err instanceof Error ? err.message : 'Could not confirm order');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-2xl border border-border-subtle bg-canvas-elevated p-4">
        <PaymentElement options={{ layout: 'tabs' }} />
      </div>
      <TrustRow />
      <Actions onBack={onBack} busy={busy || isConfirming} total={total} />
    </form>
  );
}

function DemoInner({ total, onBack, onConfirm, isConfirming }: Omit<PayFormProps, 'clientSecret' | 'publishableKey' | 'mode'>) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onConfirm();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not confirm order');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-2xl border border-border-subtle bg-canvas-surface p-5 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-primary">Demo checkout</p>
        <p className="text-sm text-text-muted leading-relaxed">
          Stripe test keys are not configured, so this capture writes a real order and inventory
          reservation without charging a card. Use card <span className="font-mono text-text-primary">4242</span> when
          test mode is connected.
        </p>
      </div>
      <TrustRow />
      <Actions onBack={onBack} busy={isConfirming} total={total} />
    </form>
  );
}

function TrustRow() {
  return (
    <div className="p-4 rounded-2xl bg-canvas-surface border border-border-subtle flex flex-wrap items-center justify-between gap-3 text-xs text-text-muted">
      <div className="flex items-center gap-1.5">
        <ShieldCheck className="w-4 h-4 text-brand-primary shrink-0" />
        <span>256-Bit SSL Encrypted</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Sparkles className="w-4 h-4 text-brand-primary shrink-0" />
        <span>Dermatologist Formulated</span>
      </div>
    </div>
  );
}

function Actions({ onBack, busy, total }: { onBack: () => void; busy: boolean; total: number }) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border-subtle">
      <button
        type="button"
        onClick={onBack}
        className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border border-border-strong text-text-primary hover:bg-canvas-surface font-medium text-sm transition-colors flex items-center justify-center gap-2 min-h-11"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Review</span>
      </button>
      <button
        type="submit"
        disabled={busy}
        className="w-full sm:w-auto px-10 py-4 bg-brand-primary hover:bg-forest-elevated text-white font-medium rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed min-h-11"
      >
        <Lock className="w-4 h-4" />
        <span>{busy ? 'Authorizing…' : `Authorize & Pay $${total.toFixed(2)}`}</span>
      </button>
    </div>
  );
}

export function StripePayForm(props: PayFormProps) {
  if (props.mode === 'test' && props.publishableKey && props.clientSecret) {
    return (
      <Elements
        stripe={stripePromise(props.publishableKey)}
        options={{
          clientSecret: props.clientSecret,
          appearance: {
            theme: 'stripe',
            variables: {
              colorPrimary: '#15281e',
              colorBackground: '#faf7f3',
              colorText: '#1c1917',
              borderRadius: '12px',
              fontFamily: 'Geist Variable, Inter, system-ui, sans-serif',
            },
          },
        }}
      >
        <StripeInner total={props.total} onBack={props.onBack} onConfirm={props.onConfirm} isConfirming={props.isConfirming} />
      </Elements>
    );
  }

  return <DemoInner total={props.total} onBack={props.onBack} onConfirm={props.onConfirm} isConfirming={props.isConfirming} />;
}
