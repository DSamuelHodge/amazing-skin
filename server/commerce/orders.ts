import { and, desc, eq, lt, sql } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import { getDb, type AppDb } from '../../src/db/client';
import {
  customerProfiles,
  inventoryLogs,
  orderAddresses,
  orderItems,
  orders,
  productVariants,
  products,
} from '../../src/db/schema';
import { clearCart, getOrCreateCart } from '../trpc/cart-db';
import { demoPaymentIntentId, getStripe, getStripeMode, isDemoPaymentIntentId } from '../../lib/stripe';
import { fromMoney, toCents, toMoney } from './money';
import { calculatePricing } from './pricing';
import { queueOrderConfirmation } from './email';

export const RESERVATION_MS = 15 * 60 * 1000;

export interface CheckoutAddress {
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface CreateIntentInput {
  sessionId: string;
  userId: string | null;
  email: string;
  shipping: CheckoutAddress;
  billing?: CheckoutAddress;
  shippingMethod?: string;
  giftPackaging?: boolean;
  pointsRedeemed?: number;
  discountCode?: string | null;
  notes?: string;
}

function orderNumber() {
  return `LUM-${Date.now().toString(36).toUpperCase().slice(-4)}${Math.floor(10 + Math.random() * 89)}`;
}

async function reserveVariant(tx: AppDb, variantId: string, qty: number, orderId: string) {
  const updated = await tx
    .update(productVariants)
    .set({
      reservedQuantity: sql`${productVariants.reservedQuantity} + ${qty}`,
    })
    .where(
      and(
        eq(productVariants.id, variantId),
        sql`${productVariants.stockQuantity} - ${productVariants.reservedQuantity} >= ${qty}`,
      ),
    )
    .returning({
      id: productVariants.id,
      stockQuantity: productVariants.stockQuantity,
      reservedQuantity: productVariants.reservedQuantity,
    });

  const row = updated[0];
  if (!row) {
    throw new TRPCError({
      code: 'CONFLICT',
      message: 'One or more items are no longer in stock.',
    });
  }

  await tx.insert(inventoryLogs).values({
    variantId,
    action: 'order_reservation',
    quantityChange: -qty,
    resultingStock: row.stockQuantity - row.reservedQuantity,
    referenceId: orderId,
    note: 'Checkout reservation (15 min)',
  });
}

async function releaseVariant(tx: AppDb, variantId: string, qty: number, orderId: string, note: string) {
  const updated = await tx
    .update(productVariants)
    .set({
      reservedQuantity: sql`greatest(${productVariants.reservedQuantity} - ${qty}, 0)`,
    })
    .where(eq(productVariants.id, variantId))
    .returning({
      stockQuantity: productVariants.stockQuantity,
      reservedQuantity: productVariants.reservedQuantity,
    });
  const row = updated[0];
  if (!row) return;
  await tx.insert(inventoryLogs).values({
    variantId,
    action: 'adjustment',
    quantityChange: qty,
    resultingStock: row.stockQuantity - row.reservedQuantity,
    referenceId: orderId,
    note,
  });
}

async function deductReserved(tx: AppDb, variantId: string, qty: number, orderId: string) {
  const updated = await tx
    .update(productVariants)
    .set({
      stockQuantity: sql`greatest(${productVariants.stockQuantity} - ${qty}, 0)`,
      reservedQuantity: sql`greatest(${productVariants.reservedQuantity} - ${qty}, 0)`,
    })
    .where(eq(productVariants.id, variantId))
    .returning({
      stockQuantity: productVariants.stockQuantity,
      reservedQuantity: productVariants.reservedQuantity,
    });
  const row = updated[0];
  if (!row) return;
  await tx.insert(inventoryLogs).values({
    variantId,
    action: 'order_fulfilled',
    quantityChange: -qty,
    resultingStock: row.stockQuantity,
    referenceId: orderId,
    note: 'Payment captured',
  });
}

export async function releaseExpiredReservations() {
  const db = await getDb();
  const cutoff = new Date(Date.now() - RESERVATION_MS);
  const stale = await db
    .select()
    .from(orders)
    .where(and(eq(orders.paymentStatus, 'pending'), eq(orders.orderStatus, 'pending_payment'), lt(orders.createdAt, cutoff)));

  for (const order of stale) {
    await releaseOrderReservation(order.id, 'Reservation expired (15 min)');
  }
}

export async function releaseOrderReservation(orderId: string, note: string) {
  const db = await getDb();
  await db.transaction(async (tx) => {
    const [order] = await tx.select().from(orders).where(eq(orders.id, orderId));
    if (!order) return;
    if (order.paymentStatus === 'captured' || order.orderStatus === 'cancelled') return;

    const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, orderId));
    for (const item of items) {
      if (item.isFreeGift) continue;
      await releaseVariant(tx as unknown as AppDb, item.variantId, item.quantity, orderId, note);
    }
    await tx
      .update(orders)
      .set({
        orderStatus: 'cancelled',
        paymentStatus: 'failed',
        notes: note,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));
  });
}

export async function fulfillOrder(opts: { orderId?: string; paymentIntentId?: string }) {
  const db = await getDb();
  let newlyCaptured = false;
  const captured = await db.transaction(async (tx) => {
    const [order] = opts.orderId
      ? await tx.select().from(orders).where(eq(orders.id, opts.orderId))
      : await tx.select().from(orders).where(eq(orders.stripePaymentIntentId, opts.paymentIntentId!));

    if (!order) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Order not found for payment.' });
    }
    if (order.paymentStatus === 'captured') {
      return order;
    }

    const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, order.id));
    for (const item of items) {
      if (item.isFreeGift) continue;
      await deductReserved(tx as unknown as AppDb, item.variantId, item.quantity, order.id);
    }

    if (order.userId && order.loyaltyPointsEarned > 0) {
      await tx
        .update(customerProfiles)
        .set({
          loyaltyPoints: sql`${customerProfiles.loyaltyPoints} + ${order.loyaltyPointsEarned}`,
          updatedAt: new Date(),
        })
        .where(eq(customerProfiles.userId, order.userId));
    }

    if (order.notes) {
      const codeMatch = /code:([A-Z0-9]+)/.exec(order.notes);
      if (codeMatch?.[1]) {
        await tx.execute(sql`
          update discount_codes
          set usage_count = usage_count + 1
          where code = ${codeMatch[1]}
        `);
      }
    }

    const [updated] = await tx
      .update(orders)
      .set({
        paymentStatus: 'captured',
        orderStatus: 'processing',
        updatedAt: new Date(),
      })
      .where(eq(orders.id, order.id))
      .returning();

    newlyCaptured = true;
    return updated ?? order;
  });

  if (newlyCaptured) {
    queueOrderConfirmation(captured.id);
  }
  return captured;
}

export async function restockOnRefund(orderId: string, adminUserId: string | null, note: string) {
  const db = await getDb();
  await db.transaction(async (tx) => {
    const [order] = await tx.select().from(orders).where(eq(orders.id, orderId));
    if (!order) throw new TRPCError({ code: 'NOT_FOUND', message: 'Order not found' });
    if (order.orderStatus === 'refunded') return;

    const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, orderId));
    for (const item of items) {
      const [row] = await tx
        .update(productVariants)
        .set({ stockQuantity: sql`${productVariants.stockQuantity} + ${item.quantity}` })
        .where(eq(productVariants.id, item.variantId))
        .returning({ stockQuantity: productVariants.stockQuantity });
      await tx.insert(inventoryLogs).values({
        variantId: item.variantId,
        action: 'return_restock',
        quantityChange: item.quantity,
        resultingStock: row?.stockQuantity ?? 0,
        referenceId: orderId,
        adminUserId,
        note,
      });
    }

    await tx
      .update(orders)
      .set({
        orderStatus: 'refunded',
        paymentStatus: 'refunded',
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));
  });
}

export async function createPaymentIntent(input: CreateIntentInput) {
  await releaseExpiredReservations();
  const mode = getStripeMode();
  if (mode === 'live-blocked') {
    throw new TRPCError({
      code: 'PRECONDITION_FAILED',
      message: 'Stripe live mode is disabled. Configure a sk_test_ secret key.',
    });
  }

  const cart = await getOrCreateCart({ sessionId: input.sessionId, userId: input.userId });
  if (cart.items.length === 0) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Your ritual bag is empty.' });
  }

  const pricing = await calculatePricing({
    items: cart.items,
    discountCode: input.discountCode ?? cart.discountCode,
    shippingMethod: input.shippingMethod,
    giftPackaging: input.giftPackaging,
    pointsRedeemed: input.pointsRedeemed,
    userId: input.userId,
  });

  const db = await getDb();
  const [existing] = await db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.email, input.email.toLowerCase()),
        eq(orders.orderStatus, 'pending_payment'),
        eq(orders.paymentStatus, 'pending'),
      ),
    )
    .orderBy(desc(orders.createdAt))
    .limit(1);

  if (
    existing &&
    existing.stripePaymentIntentId &&
    Date.now() - existing.createdAt.getTime() < RESERVATION_MS &&
    fromMoney(existing.totalAmount) === pricing.total
  ) {
    const mode = getStripeMode();
    return {
      orderId: existing.id,
      orderNumber: existing.orderNumber,
      clientSecret: isDemoPaymentIntentId(existing.stripePaymentIntentId)
        ? `demo_secret_${existing.id}`
        : (await getStripe()?.paymentIntents.retrieve(existing.stripePaymentIntentId))?.client_secret ?? '',
      paymentIntentId: existing.stripePaymentIntentId,
      amount: pricing.total,
      amountCents: toCents(pricing.total),
      mode,
      pricing,
    };
  }
  const number = orderNumber();
  const noteParts = [
    input.notes,
    pricing.appliedCode ? `code:${pricing.appliedCode}` : null,
    `ship:${input.shippingMethod ?? 'eco'}`,
  ]
    .filter(Boolean)
    .join(' | ');

  const orderId = await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(orders)
      .values({
        orderNumber: number,
        userId: input.userId,
        email: input.email.toLowerCase(),
        orderStatus: 'pending_payment',
        paymentStatus: 'pending',
        fulfillmentStatus: 'unfulfilled',
        currency: 'USD',
        subtotal: toMoney(pricing.subtotal),
        discountTotal: toMoney(pricing.discount + pricing.pointsDiscount),
        shippingTotal: toMoney(pricing.shipping + pricing.packagingFee),
        taxTotal: toMoney(pricing.tax),
        totalAmount: toMoney(pricing.total),
        loyaltyPointsEarned: Math.floor(pricing.total),
        loyaltyPointsRedeemed: input.pointsRedeemed ?? 0,
        notes: noteParts,
      })
      .returning({ id: orders.id });

    const id = created!.id;

    for (const item of cart.items) {
      const variant = await tx.query.productVariants.findFirst({
        where: eq(productVariants.id, item.variantId),
      });
      const product = variant
        ? await tx.query.products.findFirst({ where: eq(products.id, variant.productId) })
        : undefined;
      await reserveVariant(tx as unknown as AppDb, item.variantId, item.quantity, id);
      await tx.insert(orderItems).values({
        orderId: id,
        variantId: item.variantId,
        productName: product?.name ?? item.product.name,
        variantName: variant?.name ?? item.variant.name,
        sku: variant?.sku ?? item.variant.sku,
        unitPrice: toMoney(item.unitPrice),
        quantity: item.quantity,
        lineTotal: toMoney(item.unitPrice * item.quantity),
        isFreeGift: false,
      });
    }

    if (pricing.gwp) {
      const already = cart.items.some((i) => i.variantId === pricing.gwp!.variantId);
      if (!already) {
        await tx.insert(orderItems).values({
          orderId: id,
          variantId: pricing.gwp.variantId,
          productName: pricing.gwp.name,
          variantName: 'Gift with purchase',
          sku: pricing.gwp.sku,
          unitPrice: toMoney(0),
          quantity: 1,
          lineTotal: toMoney(0),
          isFreeGift: true,
        });
      }
    }

    const shipping = input.shipping;
    await tx.insert(orderAddresses).values({
      orderId: id,
      type: 'shipping',
      firstName: shipping.firstName,
      lastName: shipping.lastName,
      company: shipping.company,
      addressLine1: shipping.addressLine1,
      addressLine2: shipping.addressLine2,
      city: shipping.city,
      state: shipping.state,
      postalCode: shipping.postalCode,
      country: shipping.country || 'US',
      phone: shipping.phone,
    });
    const billing = input.billing ?? shipping;
    await tx.insert(orderAddresses).values({
      orderId: id,
      type: 'billing',
      firstName: billing.firstName,
      lastName: billing.lastName,
      company: billing.company,
      addressLine1: billing.addressLine1,
      addressLine2: billing.addressLine2,
      city: billing.city,
      state: billing.state,
      postalCode: billing.postalCode,
      country: billing.country || 'US',
      phone: billing.phone,
    });

    return id;
  });

  const amountCents = toCents(pricing.total);
  let clientSecret = `demo_secret_${orderId}`;
  let paymentIntentId = demoPaymentIntentId(orderId);

  if (mode === 'test') {
    const stripe = getStripe();
    if (!stripe) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Stripe client unavailable.' });
    }
    const pi = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      receipt_email: input.email,
      metadata: {
        orderId,
        orderNumber: number,
        cartId: cart.id,
        expiresAt: String(Date.now() + RESERVATION_MS),
      },
    });
    paymentIntentId = pi.id;
    clientSecret = pi.client_secret ?? '';
  }

  await db
    .update(orders)
    .set({ stripePaymentIntentId: paymentIntentId, updatedAt: new Date() })
    .where(eq(orders.id, orderId));

  return {
    orderId,
    orderNumber: number,
    clientSecret,
    paymentIntentId,
    amount: pricing.total,
    amountCents,
    mode,
    pricing,
  };
}

export async function confirmDemoOrSucceededIntent(opts: {
  orderId: string;
  sessionId: string;
  userId: string | null;
  paymentIntentId?: string;
}) {
  const db = await getDb();
  const [order] = await db.select().from(orders).where(eq(orders.id, opts.orderId));
  if (!order) throw new TRPCError({ code: 'NOT_FOUND', message: 'Order not found.' });

  const mode = getStripeMode();
  const piId = opts.paymentIntentId ?? order.stripePaymentIntentId;

  if (mode === 'test' && piId && !isDemoPaymentIntentId(piId)) {
    const stripe = getStripe();
    if (!stripe) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Stripe unavailable.' });
    const pi = await stripe.paymentIntents.retrieve(piId);
    if (pi.status !== 'succeeded') {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: `Payment is ${pi.status}. Complete the Payment Element first.`,
      });
    }
  }

  const fulfilled = await fulfillOrder({ orderId: order.id });
  await clearCart({ sessionId: opts.sessionId, userId: opts.userId });

  return {
    orderId: fulfilled.id,
    orderNumber: fulfilled.orderNumber,
    total: fromMoney(fulfilled.totalAmount),
    success: true as const,
  };
}
