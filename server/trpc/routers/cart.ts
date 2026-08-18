import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, publicProcedure } from '../init';
import {
  cloneCart,
  createEmptyCart,
  getSessionCart,
  saveSessionCart,
} from '../cart-store';
import { findVariantMeta } from './catalog';
import { isKnownDiscountCode } from './checkout';

export const cartRouter = createTRPCRouter({
  get: publicProcedure.query(({ ctx }) => {
    return cloneCart(getSessionCart(ctx.sessionId));
  }),

  addItem: publicProcedure
    .input(
      z.object({
        variantId: z.string(),
        quantity: z.number().int().min(1),
      }),
    )
    .mutation(({ ctx, input }) => {
      const cart = getSessionCart(ctx.sessionId);
      const existing = cart.items.find((item) => item.variantId === input.variantId);
      if (existing) {
        existing.quantity += input.quantity;
        return cloneCart(saveSessionCart(ctx.sessionId, cart));
      }

      const meta = findVariantMeta(input.variantId);
      cart.items.push({
        id: `item_${crypto.randomUUID()}`,
        variantId: input.variantId,
        quantity: input.quantity,
        unitPrice: meta?.unitPrice ?? 45,
        product: meta?.product ?? {
          name: 'New Product',
          slug: 'new-product',
          primaryCategory: 'face',
        },
        variant: meta?.variant ?? {
          name: 'Default',
          sku: 'NEW-1',
          attributes: [],
        },
        image: meta?.image ?? {
          imageUrl:
            'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/bd1db224-b438-47b5-8cb4-6744fbdc7fa2_800w.jpg',
        },
      });
      return cloneCart(saveSessionCart(ctx.sessionId, cart));
    }),

  updateItem: publicProcedure
    .input(
      z.object({
        itemId: z.string(),
        quantity: z.number().int().min(1),
      }),
    )
    .mutation(({ ctx, input }) => {
      const cart = getSessionCart(ctx.sessionId);
      const item = cart.items.find((entry) => entry.id === input.itemId);
      if (item) {
        item.quantity = input.quantity;
      }
      return cloneCart(saveSessionCart(ctx.sessionId, cart));
    }),

  removeItem: publicProcedure
    .input(z.object({ itemId: z.string() }))
    .mutation(({ ctx, input }) => {
      const cart = getSessionCart(ctx.sessionId);
      cart.items = cart.items.filter((item) => item.id !== input.itemId);
      return cloneCart(saveSessionCart(ctx.sessionId, cart));
    }),

  applyDiscountCode: publicProcedure
    .input(z.object({ code: z.string() }))
    .mutation(({ ctx, input }) => {
      const code = input.code.trim().toUpperCase();
      if (!isKnownDiscountCode(code)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid discount code. Try LUMINA10, GLOW20, or WELCOME50.',
        });
      }
      const cart = getSessionCart(ctx.sessionId);
      cart.discountCode = code;
      return cloneCart(saveSessionCart(ctx.sessionId, cart));
    }),

  removeDiscountCode: publicProcedure.mutation(({ ctx }) => {
    const cart = getSessionCart(ctx.sessionId);
    cart.discountCode = null;
    return cloneCart(saveSessionCart(ctx.sessionId, cart));
  }),

  mergeGuestCart: publicProcedure
    .input(
      z.object({
        anonymousCartId: z.string().optional(),
        userCartId: z.string().optional(),
        anonymousSessionId: z.string().optional(),
      }),
    )
    .mutation(({ ctx, input }) => {
      const target = getSessionCart(ctx.sessionId);
      const guestKey = input.anonymousSessionId ?? input.anonymousCartId;
      if (!guestKey || guestKey === ctx.sessionId) {
        return cloneCart(target);
      }

      const guest = getSessionCart(guestKey);
      for (const guestItem of guest.items) {
        const existing = target.items.find((item) => item.variantId === guestItem.variantId);
        if (existing) {
          existing.quantity += guestItem.quantity;
        } else {
          target.items.push({ ...guestItem, id: `item_${crypto.randomUUID()}` });
        }
      }
      if (guest.discountCode && !target.discountCode) {
        target.discountCode = guest.discountCode;
      }
      saveSessionCart(guestKey, createEmptyCart(guestKey));
      return cloneCart(saveSessionCart(ctx.sessionId, target));
    }),
});
