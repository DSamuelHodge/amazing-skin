import { eq } from 'drizzle-orm';
import { getStripe, getStripeMode, getStripeWebhookSecret } from '../../lib/stripe';
import { getDb } from '../../src/db/client';
import { orders } from '../../src/db/schema';
import { fulfillOrder, releaseOrderReservation } from '../commerce/orders';

export class WebhookError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export async function handleStripeWebhook(rawBody: Buffer, signature: string | undefined) {
  const mode = getStripeMode();
  if (mode === 'live-blocked') {
    throw new WebhookError('Stripe live mode is disabled', 503);
  }
  if (mode === 'demo') {
    throw new WebhookError('Stripe webhook requires STRIPE_SECRET_KEY (sk_test_) and STRIPE_WEBHOOK_SECRET', 503);
  }

  const stripe = getStripe();
  const secret = getStripeWebhookSecret();
  if (!stripe || !secret) {
    throw new WebhookError('Stripe webhook is not configured', 503);
  }
  if (!signature) {
    throw new WebhookError('Missing stripe-signature header', 400);
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid signature';
    throw new WebhookError(`Webhook Signature Error: ${message}`, 400);
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object;
    try {
      await fulfillOrder({ paymentIntentId: pi.id });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes('not found')) {
        console.warn('[stripe] payment_intent.succeeded with no local order', pi.id);
      } else {
        throw err;
      }
    }
  }

  if (event.type === 'payment_intent.payment_failed' || event.type === 'payment_intent.canceled') {
    const pi = event.data.object;
    const db = await getDb();
    const [order] = pi.metadata?.orderId
      ? await db.select().from(orders).where(eq(orders.id, pi.metadata.orderId))
      : await db.select().from(orders).where(eq(orders.stripePaymentIntentId, pi.id));
    if (order) {
      await releaseOrderReservation(order.id, `Stripe ${event.type}`);
    }
  }

  return { received: true, type: event.type };
}
