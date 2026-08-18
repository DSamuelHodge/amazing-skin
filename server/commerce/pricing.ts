import { and, eq, lte, or, sql } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import type { CartItem } from '@/src/types';
import { getDb } from '../../src/db/client';
import { discountCodes, orders, productVariants, products } from '../../src/db/schema';
import { fromMoney, toMoney } from './money';

export const GWP_THRESHOLD = 80;
const TAX_RATE = 0.075;

export interface PricingInput {
  items: CartItem[];
  discountCode?: string | null;
  shippingMethod?: string;
  giftPackaging?: boolean;
  pointsRedeemed?: number;
  userId?: string | null;
}

export interface PricingResult {
  subtotal: number;
  discount: number;
  pointsDiscount: number;
  shipping: number;
  packagingFee: number;
  tax: number;
  total: number;
  appliedCode: string | null;
  discountType: string | null;
  gwp: { variantId: string; name: string; sku: string } | null;
}

export async function loadDiscount(code: string | null | undefined) {
  if (!code?.trim()) return null;
  const db = await getDb();
  return (
    (await db.query.discountCodes.findFirst({
      where: eq(discountCodes.code, code.trim().toUpperCase()),
    })) ?? null
  );
}

export async function assertDiscountApplicable(
  code: string,
  subtotal: number,
  userId: string | null,
) {
  const row = await loadDiscount(code);
  if (!row || !row.isActive) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Invalid discount code. Try LUMINA10, GLOW20, or WELCOME50.',
    });
  }
  const now = new Date();
  if (row.startsAt && row.startsAt > now) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'This discount is not active yet.' });
  }
  if (row.expiresAt && row.expiresAt < now) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'This discount has expired.' });
  }
  if (fromMoney(row.minSubtotal) > subtotal) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `Spend at least $${fromMoney(row.minSubtotal).toFixed(2)} to use this code.`,
    });
  }
  if (row.usageLimitTotal != null && row.usageCount >= row.usageLimitTotal) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'This discount has reached its usage limit.' });
  }
  if (userId && row.usageLimitPerCustomer) {
    const db = await getDb();
    const history = await db.select({ notes: orders.notes, orderStatus: orders.orderStatus }).from(orders).where(eq(orders.userId, userId));
    const used = history.filter(
      (o) =>
        o.notes?.includes(`code:${row.code}`) &&
        o.orderStatus !== 'cancelled' &&
        o.orderStatus !== 'payment_failed',
    ).length;
    if (used >= row.usageLimitPerCustomer) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'You have already used this discount.' });
    }
  }
  return row;
}

function shippingFor(method: string | undefined): number {
  if (method === 'express') return 12;
  if (method === 'chilled') return 24;
  return 0;
}

async function resolveGwp(subtotal: number, applied: Awaited<ReturnType<typeof loadDiscount>>) {
  const db = await getDb();
  let variantId = applied?.discountType === 'gwp' ? applied.gwpVariantId : null;

  if (!variantId && subtotal >= GWP_THRESHOLD) {
    const auto = await db.query.discountCodes.findFirst({
      where: and(
        eq(discountCodes.discountType, 'gwp'),
        eq(discountCodes.isActive, true),
        or(sql`${discountCodes.minSubtotal} is null`, lte(discountCodes.minSubtotal, toMoney(subtotal))),
      ),
    });
    variantId = auto?.gwpVariantId ?? null;
  }

  if (!variantId) return null;

  const variant = await db.query.productVariants.findFirst({
    where: eq(productVariants.id, variantId),
  });
  if (!variant?.isActive) return null;
  const product = await db.query.products.findFirst({ where: eq(products.id, variant.productId) });
  return {
    variantId: variant.id,
    name: `${product?.name ?? 'Gift'} — ${variant.name}`,
    sku: variant.sku,
  };
}

export async function calculatePricing(input: PricingInput): Promise<PricingResult> {
  const subtotal = input.items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  let applied = null as Awaited<ReturnType<typeof loadDiscount>>;
  const code = input.discountCode?.trim().toUpperCase() ?? null;

  if (code) {
    applied = await assertDiscountApplicable(code, subtotal, input.userId ?? null);
  }

  let discount = 0;
  let shipping = shippingFor(input.shippingMethod);
  if (applied) {
    const value = fromMoney(applied.discountValue);
    if (applied.discountType === 'percentage') {
      discount = Number(((subtotal * value) / 100).toFixed(2));
    } else if (applied.discountType === 'fixed_amount') {
      discount = Math.min(value, subtotal);
    } else if (applied.discountType === 'free_shipping') {
      shipping = 0;
    }
  }

  const packagingFee = input.giftPackaging ? 5 : 0;
  const pointsDiscount = Math.min((input.pointsRedeemed ?? 0) / 10, Math.max(0, subtotal - discount));
  const taxable = Math.max(0, subtotal - discount - pointsDiscount);
  const tax = Number((taxable * TAX_RATE).toFixed(2));
  const total = Math.max(0, taxable + shipping + packagingFee + tax);
  const gwp = await resolveGwp(subtotal, applied);

  return {
    subtotal: Number(subtotal.toFixed(2)),
    discount: Number(discount.toFixed(2)),
    pointsDiscount: Number(pointsDiscount.toFixed(2)),
    shipping: Number(shipping.toFixed(2)),
    packagingFee,
    tax,
    total: Number(total.toFixed(2)),
    appliedCode: applied?.code ?? null,
    discountType: applied?.discountType ?? null,
    gwp,
  };
}
