import Stripe from 'stripe';

export type StripeMode = 'demo' | 'test' | 'live-blocked';

const LIVE_PREFIX = 'sk_live_';
const TEST_PREFIX = 'sk_test_';

export function getStripeSecretKey(): string {
  return process.env.STRIPE_SECRET_KEY?.trim() ?? '';
}

export function getStripePublishableKey(): string {
  return (
    process.env.STRIPE_PUBLISHABLE_KEY?.trim() ||
    process.env.VITE_STRIPE_PUBLISHABLE_KEY?.trim() ||
    ''
  );
}

export function getStripeWebhookSecret(): string {
  return process.env.STRIPE_WEBHOOK_SECRET?.trim() ?? '';
}

export function getStripeMode(): StripeMode {
  const key = getStripeSecretKey();
  if (key.startsWith(LIVE_PREFIX)) return 'live-blocked';
  if (key.startsWith(TEST_PREFIX)) return 'test';
  return 'demo';
}

let stripeSingleton: Stripe | null | undefined;

/**
 * Test-mode Stripe client only. Live keys are refused so the storefront
 * never charges Hodge acct_1SmRZaPufKwsPniX in livemode.
 */
export function getStripe(): Stripe | null {
  if (stripeSingleton !== undefined) return stripeSingleton;
  const mode = getStripeMode();
  if (mode !== 'test') {
    if (mode === 'live-blocked') {
      console.error('[stripe] Live secret keys are blocked. Use a sk_test_ key.');
    }
    stripeSingleton = null;
    return null;
  }
  stripeSingleton = new Stripe(getStripeSecretKey());
  return stripeSingleton;
}

export function assertNotLive(): void {
  if (getStripeMode() === 'live-blocked') {
    throw new Error('Stripe live mode is disabled. Set STRIPE_SECRET_KEY to a sk_test_ key.');
  }
}

export function demoPaymentIntentId(orderId: string) {
  return `pi_demo_${orderId.replace(/-/g, '').slice(0, 24)}`;
}

export function isDemoPaymentIntentId(id: string | null | undefined) {
  return Boolean(id?.startsWith('pi_demo_'));
}
