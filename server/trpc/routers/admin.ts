import { z } from 'zod';
import { and, desc, eq, gte } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import { getDb } from '../../../src/db/client';
import {
  auditLogs,
  carts,
  categories,
  cmsContentBlocks,
  customerProfiles,
  discountCodes,
  ingredients,
  inventoryLogs,
  orderAddresses,
  orderFulfillments,
  orderItems,
  orders,
  productReviews,
  productVariants,
  products,
  users,
} from '../../../src/db/schema';
import { createTRPCRouter, staffAtLeast, staffProcedure } from '../init';
import { fromMoney, toMoney } from '../../commerce/money';
import { restockOnRefund } from '../../commerce/orders';
import { getStripe, getStripeMode, isDemoPaymentIntentId } from '../../../lib/stripe';
import type { UserRole } from '../../../src/lib/auth-types';
import { AGENT_SUPERADMIN } from '../../../src/lib/agent-superadmin';

const rangeSchema = z.enum(['24h', '7d', '30d', '90d']).default('30d');

function since(range: z.infer<typeof rangeSchema>) {
  const ms =
    range === '24h' ? 24 * 3600_000 : range === '7d' ? 7 * 86400_000 : range === '90d' ? 90 * 86400_000 : 30 * 86400_000;
  return new Date(Date.now() - ms);
}

async function writeAudit(
  adminUserId: string,
  action: string,
  targetEntity: string,
  targetId: string,
  changes?: { before: unknown; after: unknown },
) {
  const db = await getDb();
  await db.insert(auditLogs).values({
    adminUserId,
    action,
    targetEntity,
    targetId,
    changes: changes as { before: unknown; after: unknown } | undefined,
  });
}

const DEFAULT_CMS = [
  {
    key: 'home_hero',
    title: 'Home hero',
    payload: {
      eyebrow: 'Clinical botanicals',
      heading: 'Lumina Skin Rituals',
      body: 'Barrier-first formulas for evening recovery.',
    },
  },
  {
    key: 'evening_ritual_section',
    title: 'Evening ritual',
    payload: { heading: 'The evening ritual', body: 'Cleanse, treat, seal.' },
  },
];

export const adminRouter = createTRPCRouter({
  ping: staffProcedure.query(({ ctx }) => ({
    ok: true as const,
    role: ctx.role,
    email: ctx.email,
  })),

  metrics: createTRPCRouter({
    dashboard: staffProcedure.input(z.object({ range: rangeSchema }).optional()).query(async ({ input }) => {
      const db = await getDb();
      const from = since(input?.range ?? '30d');
      const captured = await db
        .select()
        .from(orders)
        .where(and(eq(orders.paymentStatus, 'captured'), gte(orders.createdAt, from)));
      const gmv = captured.reduce((acc, o) => acc + fromMoney(o.totalAmount), 0);
      const orderCount = captured.length;
      const aov = orderCount ? gmv / orderCount : 0;
      const pending = await db
        .select({ id: orders.id })
        .from(orders)
        .where(and(eq(orders.orderStatus, 'pending_payment'), gte(orders.createdAt, from)));
      const cartRows = await db.select({ id: carts.id }).from(carts).where(gte(carts.createdAt, from));
      const variants = await db.select().from(productVariants);
      const lowStock = variants
        .filter((v) => v.stockQuantity - v.reservedQuantity <= v.lowStockThreshold)
        .map((v) => ({
          id: v.id,
          sku: v.sku,
          name: v.name,
          stock: v.stockQuantity,
          reserved: v.reservedQuantity,
          threshold: v.lowStockThreshold,
        }));
      return {
        range: input?.range ?? '30d',
        gmv: Number(gmv.toFixed(2)),
        aov: Number(aov.toFixed(2)),
        orderCount,
        pendingPayment: pending.length,
        cartsStarted: cartRows.length,
        conversionRate: cartRows.length ? Number(((orderCount / cartRows.length) * 100).toFixed(1)) : 0,
        lowStock,
      };
    }),
  }),

  catalog: createTRPCRouter({
    list: staffProcedure.query(async () => {
      const db = await getDb();
      const rows = await db.select().from(products).orderBy(desc(products.updatedAt));
      const vars = await db.select().from(productVariants);
      const cats = await db.select().from(categories);
      return rows.map((p) => ({
        ...p,
        basePrice: fromMoney(p.basePrice),
        compareAtPrice: p.compareAtPrice ? fromMoney(p.compareAtPrice) : null,
        variants: vars
          .filter((v) => v.productId === p.id)
          .map((v) => ({
            ...v,
            price: fromMoney(v.price),
            available: v.stockQuantity - v.reservedQuantity,
          })),
        category: cats.find((c) => c.id === p.categoryId) ?? null,
      }));
    }),
    categories: staffProcedure.query(async () => {
      const db = await getDb();
      return db.select().from(categories).orderBy(categories.displayOrder);
    }),
    upsert: staffAtLeast('manager')
      .input(
        z.object({
          id: z.string().uuid().optional(),
          name: z.string().min(1),
          slug: z.string().min(1).optional(),
          shortDescription: z.string().min(1),
          description: z.string().min(1),
          categoryId: z.string().uuid(),
          formulationType: z.string().min(1),
          basePrice: z.number().positive(),
          isActive: z.boolean().optional(),
          isFeatured: z.boolean().optional(),
          isBestSeller: z.boolean().optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        const slug =
          input.slug ??
          input.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        const values = {
          name: input.name,
          slug,
          shortDescription: input.shortDescription,
          description: input.description,
          categoryId: input.categoryId,
          formulationType: input.formulationType,
          basePrice: toMoney(input.basePrice),
          isActive: input.isActive ?? true,
          isFeatured: input.isFeatured ?? false,
          isBestSeller: input.isBestSeller ?? false,
          updatedAt: new Date(),
        };
        if (input.id) {
          const [before] = await db.select().from(products).where(eq(products.id, input.id));
          const [after] = await db.update(products).set(values).where(eq(products.id, input.id)).returning();
          await writeAudit(ctx.userId, 'product.update', 'product', input.id, { before, after });
          return after;
        }
        const [created] = await db.insert(products).values(values).returning();
        await writeAudit(ctx.userId, 'product.create', 'product', created!.id, { before: null, after: created });
        return created;
      }),
    upsertVariant: staffAtLeast('manager')
      .input(
        z.object({
          id: z.string().uuid().optional(),
          productId: z.string().uuid(),
          sku: z.string().min(1),
          name: z.string().min(1),
          price: z.number().positive(),
          stockQuantity: z.number().int().min(0).optional(),
          lowStockThreshold: z.number().int().min(0).optional(),
          isActive: z.boolean().optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (input.id) {
          const [after] = await db
            .update(productVariants)
            .set({
              sku: input.sku,
              name: input.name,
              price: toMoney(input.price),
              lowStockThreshold: input.lowStockThreshold,
              isActive: input.isActive,
            })
            .where(eq(productVariants.id, input.id))
            .returning();
          await writeAudit(ctx.userId, 'variant.update', 'product_variant', input.id, { before: null, after });
          return after;
        }
        const [created] = await db
          .insert(productVariants)
          .values({
            productId: input.productId,
            sku: input.sku,
            name: input.name,
            price: toMoney(input.price),
            stockQuantity: input.stockQuantity ?? 0,
            lowStockThreshold: input.lowStockThreshold ?? 10,
            isActive: input.isActive ?? true,
          })
          .returning();
        await writeAudit(ctx.userId, 'variant.create', 'product_variant', created!.id, { before: null, after: created });
        return created;
      }),
  }),

  inventory: createTRPCRouter({
    list: staffProcedure.query(async () => {
      const db = await getDb();
      const vars = await db.select().from(productVariants).orderBy(productVariants.sku);
      const prods = await db.select().from(products);
      return vars.map((v) => ({
        ...v,
        price: fromMoney(v.price),
        available: v.stockQuantity - v.reservedQuantity,
        productName: prods.find((p) => p.id === v.productId)?.name ?? 'Product',
      }));
    }),
    logs: staffProcedure.input(z.object({ variantId: z.string().uuid().optional(), limit: z.number().int().max(200).optional() }).optional()).query(async ({ input }) => {
      const db = await getDb();
      const rows = await db
        .select()
        .from(inventoryLogs)
        .where(input?.variantId ? eq(inventoryLogs.variantId, input.variantId) : undefined)
        .orderBy(desc(inventoryLogs.createdAt))
        .limit(input?.limit ?? 80);
      return rows;
    }),
    adjust: staffAtLeast('manager')
      .input(
        z.object({
          variantId: z.string().uuid(),
          delta: z.number().int(),
          reason: z.string().min(1),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        if (input.delta === 0) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Adjustment cannot be zero.' });
        }
        const db = await getDb();
        const [variant] = await db.select().from(productVariants).where(eq(productVariants.id, input.variantId));
        if (!variant) throw new TRPCError({ code: 'NOT_FOUND', message: 'Variant not found' });
        const next = Math.max(0, variant.stockQuantity + input.delta);
        const [after] = await db
          .update(productVariants)
          .set({ stockQuantity: next })
          .where(eq(productVariants.id, input.variantId))
          .returning();
        await db.insert(inventoryLogs).values({
          variantId: input.variantId,
          action: input.delta > 0 ? 'restock' : 'adjustment',
          quantityChange: input.delta,
          resultingStock: next,
          adminUserId: ctx.userId,
          note: input.reason,
        });
        await writeAudit(ctx.userId, 'inventory.adjust', 'product_variant', input.variantId, {
          before: { stock: variant.stockQuantity },
          after: { stock: next, reason: input.reason },
        });
        return after;
      }),
  }),

  orders: createTRPCRouter({
    list: staffProcedure
      .input(
        z
          .object({
            status: z.string().optional(),
            search: z.string().optional(),
            limit: z.number().int().max(200).optional(),
          })
          .optional(),
      )
      .query(async ({ input }) => {
        const db = await getDb();
        const rows = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(input?.limit ?? 80);
        return rows
          .filter((o) => (input?.status ? o.orderStatus === input.status || o.fulfillmentStatus === input.status : true))
          .filter((o) =>
            input?.search
              ? o.orderNumber.toLowerCase().includes(input.search.toLowerCase()) ||
                o.email.toLowerCase().includes(input.search.toLowerCase())
              : true,
          )
          .map((o) => ({
            ...o,
            subtotal: fromMoney(o.subtotal),
            discountTotal: fromMoney(o.discountTotal),
            shippingTotal: fromMoney(o.shippingTotal),
            taxTotal: fromMoney(o.taxTotal),
            totalAmount: fromMoney(o.totalAmount),
          }));
      }),
    get: staffProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ input }) => {
      const db = await getDb();
      const [order] = await db.select().from(orders).where(eq(orders.id, input.id));
      if (!order) throw new TRPCError({ code: 'NOT_FOUND', message: 'Order not found' });
      const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
      const addresses = await db.select().from(orderAddresses).where(eq(orderAddresses.orderId, order.id));
      const fulfillments = await db.select().from(orderFulfillments).where(eq(orderFulfillments.orderId, order.id));
      return {
        ...order,
        subtotal: fromMoney(order.subtotal),
        discountTotal: fromMoney(order.discountTotal),
        shippingTotal: fromMoney(order.shippingTotal),
        taxTotal: fromMoney(order.taxTotal),
        totalAmount: fromMoney(order.totalAmount),
        items: items.map((i) => ({ ...i, unitPrice: fromMoney(i.unitPrice), lineTotal: fromMoney(i.lineTotal) })),
        addresses,
        fulfillments,
      };
    }),
    updateStatus: staffAtLeast('support')
      .input(
        z.object({
          orderId: z.string().uuid(),
          fulfillmentStatus: z.enum(['unfulfilled', 'packing', 'shipped', 'in_transit', 'delivered', 'failed']),
          trackingCarrier: z.string().optional(),
          trackingNumber: z.string().optional(),
          trackingUrl: z.string().optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        const [before] = await db.select().from(orders).where(eq(orders.id, input.orderId));
        if (!before) throw new TRPCError({ code: 'NOT_FOUND', message: 'Order not found' });
        const orderStatus =
          input.fulfillmentStatus === 'delivered'
            ? 'fulfilled'
            : input.fulfillmentStatus === 'failed'
              ? before.orderStatus
              : before.orderStatus === 'pending_payment'
                ? before.orderStatus
                : 'processing';
        const [after] = await db
          .update(orders)
          .set({
            fulfillmentStatus: input.fulfillmentStatus,
            orderStatus,
            updatedAt: new Date(),
          })
          .where(eq(orders.id, input.orderId))
          .returning();
        if (input.trackingNumber || input.fulfillmentStatus === 'shipped') {
          await db.insert(orderFulfillments).values({
            orderId: input.orderId,
            trackingCarrier: input.trackingCarrier ?? 'USPS',
            trackingNumber: input.trackingNumber,
            trackingUrl:
              input.trackingUrl ??
              (input.trackingNumber
                ? `https://tools.usps.com/go/TrackConfirmAction?tLabels=${encodeURIComponent(input.trackingNumber)}`
                : undefined),
            status: input.fulfillmentStatus,
            shippedAt: input.fulfillmentStatus === 'shipped' || input.fulfillmentStatus === 'in_transit' ? new Date() : null,
            deliveredAt: input.fulfillmentStatus === 'delivered' ? new Date() : null,
          });
        }
        await writeAudit(ctx.userId, 'order.updateStatus', 'order', input.orderId, { before, after });
        return after;
      }),
    refund: staffAtLeast('admin')
      .input(z.object({ orderId: z.string().uuid(), reason: z.string().min(1), restock: z.boolean().default(true) }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        const [order] = await db.select().from(orders).where(eq(orders.id, input.orderId));
        if (!order) throw new TRPCError({ code: 'NOT_FOUND', message: 'Order not found' });
        if (order.stripePaymentIntentId && !isDemoPaymentIntentId(order.stripePaymentIntentId) && getStripeMode() === 'test') {
          const stripe = getStripe();
          await stripe?.refunds.create({
            payment_intent: order.stripePaymentIntentId,
            reason: 'requested_by_customer',
          });
        }
        if (input.restock) {
          await restockOnRefund(input.orderId, ctx.userId, input.reason);
        } else {
          await db
            .update(orders)
            .set({ orderStatus: 'refunded', paymentStatus: 'refunded', updatedAt: new Date() })
            .where(eq(orders.id, input.orderId));
        }
        await writeAudit(ctx.userId, 'order.refund', 'order', input.orderId, {
          before: { status: order.orderStatus },
          after: { status: 'refunded', reason: input.reason, restock: input.restock },
        });
        return { ok: true as const };
      }),
  }),

  customers: createTRPCRouter({
    list: staffProcedure.input(z.object({ search: z.string().optional() }).optional()).query(async ({ input }) => {
      const db = await getDb();
      const people = await db.select().from(users).orderBy(desc(users.createdAt)).limit(200);
      const profiles = await db.select().from(customerProfiles);
      return people
        .filter((u) =>
          input?.search ? u.email.toLowerCase().includes(input.search.toLowerCase()) : true,
        )
        .map((u) => {
          const profile = profiles.find((p) => p.userId === u.id);
          return {
            id: u.id,
            email: u.email,
            role: u.role,
            stripeCustomerId: u.stripeCustomerId,
            createdAt: u.createdAt,
            firstName: profile?.firstName ?? '',
            lastName: profile?.lastName ?? '',
            loyaltyPoints: profile?.loyaltyPoints ?? 0,
            loyaltyTier: profile?.loyaltyTier ?? 'Bronze',
            primarySkinType: profile?.primarySkinType ?? null,
          };
        });
    }),
    setRole: staffAtLeast('admin')
      .input(z.object({ userId: z.string().uuid(), role: z.enum(['customer', 'support', 'manager', 'admin', 'super_admin']) }))
      .mutation(async ({ ctx, input }) => {
        if (input.userId === AGENT_SUPERADMIN.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Agent superadmin role is immutable.' });
        }
        const db = await getDb();
        const [before] = await db.select().from(users).where(eq(users.id, input.userId));
        const [after] = await db.update(users).set({ role: input.role as UserRole, updatedAt: new Date() }).where(eq(users.id, input.userId)).returning();
        await writeAudit(ctx.userId, 'customer.setRole', 'user', input.userId, { before, after });
        return after;
      }),
  }),

  discounts: createTRPCRouter({
    list: staffProcedure.query(async () => {
      const db = await getDb();
      const rows = await db.select().from(discountCodes).orderBy(discountCodes.code);
      return rows.map((d) => ({ ...d, discountValue: fromMoney(d.discountValue), minSubtotal: fromMoney(d.minSubtotal) }));
    }),
    upsert: staffAtLeast('manager')
      .input(
        z.object({
          id: z.string().uuid().optional(),
          code: z.string().min(3).max(50),
          discountType: z.enum(['percentage', 'fixed_amount', 'free_shipping', 'gwp']),
          discountValue: z.number().min(0),
          minSubtotal: z.number().min(0).optional(),
          usageLimitTotal: z.number().int().positive().nullable().optional(),
          usageLimitPerCustomer: z.number().int().positive().optional(),
          gwpVariantId: z.string().uuid().nullable().optional(),
          isActive: z.boolean().optional(),
          expiresAt: z.string().datetime().nullable().optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        const values = {
          code: input.code.trim().toUpperCase(),
          discountType: input.discountType,
          discountValue: toMoney(input.discountValue),
          minSubtotal: toMoney(input.minSubtotal ?? 0),
          usageLimitTotal: input.usageLimitTotal ?? null,
          usageLimitPerCustomer: input.usageLimitPerCustomer ?? 1,
          gwpVariantId: input.gwpVariantId ?? null,
          isActive: input.isActive ?? true,
          expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
        };
        if (input.id) {
          const [after] = await db.update(discountCodes).set(values).where(eq(discountCodes.id, input.id)).returning();
          await writeAudit(ctx.userId, 'coupon.update', 'discount_code', input.id, { before: null, after });
          return after;
        }
        const [created] = await db.insert(discountCodes).values(values).returning();
        await writeAudit(ctx.userId, 'coupon.create', 'discount_code', created!.id, { before: null, after: created });
        return created;
      }),
    setActive: staffAtLeast('manager')
      .input(z.object({ id: z.string().uuid(), isActive: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        const [after] = await db.update(discountCodes).set({ isActive: input.isActive }).where(eq(discountCodes.id, input.id)).returning();
        await writeAudit(ctx.userId, 'coupon.setActive', 'discount_code', input.id, { before: null, after });
        return after;
      }),
  }),

  reviews: createTRPCRouter({
    list: staffProcedure.query(async () => {
      const db = await getDb();
      return db.select().from(productReviews).orderBy(desc(productReviews.createdAt)).limit(200);
    }),
    moderate: staffAtLeast('support')
      .input(z.object({ id: z.string().uuid(), isApproved: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        const [after] = await db
          .update(productReviews)
          .set({ isApproved: input.isApproved })
          .where(eq(productReviews.id, input.id))
          .returning();
        await writeAudit(ctx.userId, 'review.moderate', 'product_review', input.id, { before: null, after });
        return after;
      }),
  }),

  cms: createTRPCRouter({
    list: staffProcedure.query(async () => {
      const db = await getDb();
      const existing = await db.select().from(cmsContentBlocks);
      if (existing.length === 0) {
        for (const block of DEFAULT_CMS) {
          await db.insert(cmsContentBlocks).values({ ...block, isPublished: true });
        }
        return db.select().from(cmsContentBlocks);
      }
      return existing;
    }),
    upsert: staffAtLeast('manager')
      .input(
        z.object({
          id: z.string().uuid().optional(),
          key: z.string().min(1),
          title: z.string().min(1),
          payload: z.record(z.string(), z.unknown()),
          isPublished: z.boolean().optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (input.id) {
          const [after] = await db
            .update(cmsContentBlocks)
            .set({
              key: input.key,
              title: input.title,
              payload: input.payload,
              isPublished: input.isPublished ?? true,
              updatedAt: new Date(),
            })
            .where(eq(cmsContentBlocks.id, input.id))
            .returning();
          await writeAudit(ctx.userId, 'cms.update', 'cms_content_block', input.id, { before: null, after });
          return after;
        }
        const [created] = await db
          .insert(cmsContentBlocks)
          .values({
            key: input.key,
            title: input.title,
            payload: input.payload,
            isPublished: input.isPublished ?? true,
          })
          .returning();
        await writeAudit(ctx.userId, 'cms.create', 'cms_content_block', created!.id, { before: null, after: created });
        return created;
      }),
  }),

  ingredients: createTRPCRouter({
    list: staffProcedure.query(async () => {
      const db = await getDb();
      return db.select().from(ingredients).orderBy(ingredients.inciName);
    }),
  }),

  audit: createTRPCRouter({
    list: staffProcedure.query(async () => {
      const db = await getDb();
      return db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(150);
    }),
  }),

  carts: createTRPCRouter({
    abandoned: staffProcedure.query(async () => {
      const db = await getDb();
      const rows = await db.select().from(carts).orderBy(desc(carts.updatedAt)).limit(50);
      return rows.map((c) => ({
        id: c.id,
        email: null,
        userId: c.userId,
        discountCode: c.appliedDiscountCode,
        updatedAt: c.updatedAt,
        expiresAt: c.expiresAt,
      }));
    }),
  }),
});
