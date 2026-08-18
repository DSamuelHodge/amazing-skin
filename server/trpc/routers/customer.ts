import { z } from 'zod';
import { and, desc, eq } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import { getDb } from '../../../src/db/client';
import {
  customerAddresses,
  customerProfiles,
  customerWishlists,
  orderItems,
  orders,
  productImages,
  products,
} from '../../../src/db/schema';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../init';

const skinTypeSchema = z.enum(['dry', 'oily', 'combination', 'sensitive', 'normal']);

const addressInput = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  company: z.string().optional(),
  addressLine1: z.string().min(1),
  addressLine2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().length(2).default('US'),
  phone: z.string().optional(),
  isDefaultShipping: z.boolean().optional(),
  isDefaultBilling: z.boolean().optional(),
});

async function clearDefaultFlags(
  userId: string,
  flags: { shipping?: boolean; billing?: boolean },
) {
  const db = await getDb();
  if (flags.shipping) {
    await db
      .update(customerAddresses)
      .set({ isDefaultShipping: false })
      .where(eq(customerAddresses.userId, userId));
  }
  if (flags.billing) {
    await db
      .update(customerAddresses)
      .set({ isDefaultBilling: false })
      .where(eq(customerAddresses.userId, userId));
  }
}

export const customerRouter = createTRPCRouter({
  ping: publicProcedure.query(() => ({ ok: true as const })),

  me: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    const profile = await db.query.customerProfiles.findFirst({
      where: eq(customerProfiles.userId, ctx.userId),
    });
    return {
      userId: ctx.userId,
      email: ctx.email,
      role: ctx.role,
      firstName: profile?.firstName ?? '',
      lastName: profile?.lastName ?? '',
      loyaltyPoints: profile?.loyaltyPoints ?? 0,
      loyaltyTier: profile?.loyaltyTier ?? 'Bronze',
      primarySkinType: profile?.primarySkinType ?? null,
      skinConcerns: profile?.skinConcerns ?? [],
    };
  }),

  orders: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    const rows = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, ctx.userId))
      .orderBy(desc(orders.createdAt));

    return Promise.all(
      rows.map(async (order) => {
        const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
        return {
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.orderStatus,
          paymentStatus: order.paymentStatus,
          fulfillmentStatus: order.fulfillmentStatus,
          total: Number(order.totalAmount),
          createdAt: order.createdAt.toISOString(),
          items: items.map((item) => ({
            id: item.id,
            productName: item.productName,
            variantName: item.variantName,
            quantity: item.quantity,
            unitPrice: Number(item.unitPrice),
          })),
        };
      }),
    );
  }),

  addresses: createTRPCRouter({
    list: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      return db
        .select()
        .from(customerAddresses)
        .where(eq(customerAddresses.userId, ctx.userId))
        .orderBy(desc(customerAddresses.isDefaultShipping), desc(customerAddresses.createdAt));
    }),

    create: protectedProcedure.input(addressInput).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (input.isDefaultShipping || input.isDefaultBilling) {
        await clearDefaultFlags(ctx.userId, {
          shipping: input.isDefaultShipping,
          billing: input.isDefaultBilling,
        });
      }
      const [row] = await db
        .insert(customerAddresses)
        .values({
          userId: ctx.userId,
          firstName: input.firstName,
          lastName: input.lastName,
          company: input.company,
          addressLine1: input.addressLine1,
          addressLine2: input.addressLine2,
          city: input.city,
          state: input.state,
          postalCode: input.postalCode,
          country: input.country ?? 'US',
          phone: input.phone,
          isDefaultShipping: input.isDefaultShipping ?? false,
          isDefaultBilling: input.isDefaultBilling ?? false,
        })
        .returning();
      return row;
    }),

    update: protectedProcedure
      .input(addressInput.extend({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        const { id, ...data } = input;
        const [existing] = await db
          .select()
          .from(customerAddresses)
          .where(and(eq(customerAddresses.id, id), eq(customerAddresses.userId, ctx.userId)))
          .limit(1);
        if (!existing) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Address not found' });
        }
        if (data.isDefaultShipping || data.isDefaultBilling) {
          await clearDefaultFlags(ctx.userId, {
            shipping: data.isDefaultShipping,
            billing: data.isDefaultBilling,
          });
        }
        const [row] = await db
          .update(customerAddresses)
          .set({
            firstName: data.firstName,
            lastName: data.lastName,
            company: data.company,
            addressLine1: data.addressLine1,
            addressLine2: data.addressLine2,
            city: data.city,
            state: data.state,
            postalCode: data.postalCode,
            country: data.country ?? existing.country,
            phone: data.phone,
            isDefaultShipping: data.isDefaultShipping ?? existing.isDefaultShipping,
            isDefaultBilling: data.isDefaultBilling ?? existing.isDefaultBilling,
          })
          .where(eq(customerAddresses.id, id))
          .returning();
        return row;
      }),

    remove: protectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        await db
          .delete(customerAddresses)
          .where(and(eq(customerAddresses.id, input.id), eq(customerAddresses.userId, ctx.userId)));
        return { ok: true as const };
      }),

    setDefault: protectedProcedure
      .input(
        z.object({
          id: z.string().uuid(),
          type: z.enum(['shipping', 'billing']),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        await clearDefaultFlags(ctx.userId, {
          shipping: input.type === 'shipping',
          billing: input.type === 'billing',
        });
        await db
          .update(customerAddresses)
          .set(
            input.type === 'shipping'
              ? { isDefaultShipping: true }
              : { isDefaultBilling: true },
          )
          .where(and(eq(customerAddresses.id, input.id), eq(customerAddresses.userId, ctx.userId)));
        return { ok: true as const };
      }),
  }),

  updateSkinProfile: protectedProcedure
    .input(
      z.object({
        primarySkinType: skinTypeSchema,
        skinConcerns: z.array(z.string()).default([]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const existing = await db.query.customerProfiles.findFirst({
        where: eq(customerProfiles.userId, ctx.userId),
      });
      if (!existing) {
        const [created] = await db
          .insert(customerProfiles)
          .values({
            userId: ctx.userId,
            primarySkinType: input.primarySkinType,
            skinConcerns: input.skinConcerns,
          })
          .returning();
        return created;
      }
      const [row] = await db
        .update(customerProfiles)
        .set({
          primarySkinType: input.primarySkinType,
          skinConcerns: input.skinConcerns,
          updatedAt: new Date(),
        })
        .where(eq(customerProfiles.userId, ctx.userId))
        .returning();
      return row;
    }),

  wishlist: createTRPCRouter({
    list: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      const rows = await db
        .select({
          id: customerWishlists.id,
          productId: customerWishlists.productId,
          addedAt: customerWishlists.addedAt,
          name: products.name,
          slug: products.slug,
          price: products.basePrice,
        })
        .from(customerWishlists)
        .innerJoin(products, eq(customerWishlists.productId, products.id))
        .where(eq(customerWishlists.userId, ctx.userId))
        .orderBy(desc(customerWishlists.addedAt));

      return Promise.all(
        rows.map(async (row) => {
          const [image] = await db
            .select()
            .from(productImages)
            .where(eq(productImages.productId, row.productId))
            .limit(1);
          return {
            id: row.id,
            productId: row.productId,
            name: row.name,
            slug: row.slug,
            price: Number(row.price),
            imageUrl: image?.imageUrl ?? '',
            addedAt: row.addedAt.toISOString(),
          };
        }),
      );
    }),

    toggle: protectedProcedure
      .input(z.object({ productId: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        const [existing] = await db
          .select()
          .from(customerWishlists)
          .where(
            and(
              eq(customerWishlists.userId, ctx.userId),
              eq(customerWishlists.productId, input.productId),
            ),
          )
          .limit(1);
        if (existing) {
          await db.delete(customerWishlists).where(eq(customerWishlists.id, existing.id));
          return { ok: true as const, wishlisted: false };
        }
        await db.insert(customerWishlists).values({
          userId: ctx.userId,
          productId: input.productId,
        });
        return { ok: true as const, wishlisted: true };
      }),
  }),

  toggleWishlist: publicProcedure
    .input(z.object({ productId: z.string().optional() }).optional())
    .mutation(() => ({ ok: true as const, wishlisted: true })),
});
