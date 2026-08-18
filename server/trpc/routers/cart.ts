import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, publicProcedure } from '../init';
import {
  addCartItem,
  getOrCreateCart,
  mergeGuestCart,
  removeCartItem,
  setDiscountCode,
  updateCartItem,
} from '../cart-db';
import { loadDiscount } from '../../commerce/pricing';

export const cartRouter = createTRPCRouter({
  get: publicProcedure.query(({ ctx }) => {
    return getOrCreateCart({ sessionId: ctx.sessionId, userId: ctx.userId });
  }),

  addItem: publicProcedure
    .input(
      z.object({
        variantId: z.string(),
        quantity: z.number().int().min(1),
      }),
    )
    .mutation(({ ctx, input }) => {
      return addCartItem({
        sessionId: ctx.sessionId,
        userId: ctx.userId,
        variantId: input.variantId,
        quantity: input.quantity,
      });
    }),

  updateItem: publicProcedure
    .input(
      z.object({
        itemId: z.string(),
        quantity: z.number().int().min(1),
      }),
    )
    .mutation(({ ctx, input }) => {
      return updateCartItem({
        sessionId: ctx.sessionId,
        userId: ctx.userId,
        itemId: input.itemId,
        quantity: input.quantity,
      });
    }),

  removeItem: publicProcedure
    .input(z.object({ itemId: z.string() }))
    .mutation(({ ctx, input }) => {
      return removeCartItem({
        sessionId: ctx.sessionId,
        userId: ctx.userId,
        itemId: input.itemId,
      });
    }),

  applyDiscountCode: publicProcedure
    .input(z.object({ code: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const code = input.code.trim().toUpperCase();
      const row = await loadDiscount(code);
      if (!row || !row.isActive) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid discount code. Try LUMINA10, GLOW20, or WELCOME50.',
        });
      }
      return setDiscountCode({
        sessionId: ctx.sessionId,
        userId: ctx.userId,
        code,
      });
    }),

  removeDiscountCode: publicProcedure.mutation(({ ctx }) => {
    return setDiscountCode({
      sessionId: ctx.sessionId,
      userId: ctx.userId,
      code: null,
    });
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
      return mergeGuestCart({
        sessionId: ctx.sessionId,
        userId: ctx.userId,
        anonymousSessionId: input.anonymousSessionId ?? input.anonymousCartId,
      });
    }),
});
