import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, publicProcedure } from '../init';
import { cloneCart, createEmptyCart, getSessionCart, saveSessionCart } from '../cart-store';
import type { CartItem } from '@/src/types';

const KNOWN_CODES = new Set(['SAVE10', 'LUMINA10', 'GLOW20', 'WELCOME50', 'BOTANICAL']);

export function isKnownDiscountCode(code: string) {
  return KNOWN_CODES.has(code.trim().toUpperCase());
}

export function calculatePricing(
  items: CartItem[],
  opts: {
    discountCode?: string;
    shippingMethod?: string;
    giftPackaging?: boolean;
    pointsRedeemed?: number;
  } = {},
) {
  const subtotal = items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);

  let discount = 0;
  const code = opts.discountCode?.trim().toUpperCase();
  if (code === 'SAVE10' || code === 'LUMINA10') {
    discount = Math.min(10, subtotal);
  } else if (code === 'GLOW20') {
    discount = Number((subtotal * 0.2).toFixed(2));
  } else if (code === 'WELCOME50') {
    discount = Math.min(15, subtotal);
  } else if (code === 'BOTANICAL') {
    discount = Number((subtotal * 0.15).toFixed(2));
  } else if (code) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Invalid discount code. Try LUMINA10, GLOW20, or WELCOME50.',
    });
  }

  let shipping = 0;
  if (opts.shippingMethod === 'express') shipping = 12.0;
  else if (opts.shippingMethod === 'chilled') shipping = 24.0;

  const packagingFee = opts.giftPackaging ? 5.0 : 0;
  const pointsDiscount = (opts.pointsRedeemed ?? 0) / 10;
  const effectiveDiscount = discount + pointsDiscount;
  const tax = Number(((subtotal - effectiveDiscount) * 0.075).toFixed(2));
  const total = Math.max(0, subtotal - effectiveDiscount + shipping + packagingFee + Math.max(0, tax));

  return {
    subtotal,
    discount,
    pointsDiscount,
    shipping,
    packagingFee,
    tax: Math.max(0, tax),
    total,
    gwp:
      subtotal >= 80
        ? { variantId: 'gwp_1', name: 'Deluxe Mini Botanical Essence (15ml)' }
        : null,
  };
}

export const checkoutRouter = createTRPCRouter({
  summary: publicProcedure
    .input(
      z
        .object({
          discountCode: z.string().optional(),
          shippingMethod: z.string().optional(),
          giftPackaging: z.boolean().optional(),
          pointsRedeemed: z.number().optional(),
        })
        .optional(),
    )
    .mutation(({ ctx, input }) => {
      const cart = getSessionCart(ctx.sessionId);
      return calculatePricing(cart.items, {
        discountCode: input?.discountCode ?? cart.discountCode ?? undefined,
        shippingMethod: input?.shippingMethod ?? 'eco',
        giftPackaging: input?.giftPackaging ?? false,
        pointsRedeemed: input?.pointsRedeemed ?? 0,
      });
    }),

  createOrder: publicProcedure
    .input(z.any().optional())
    .mutation(({ ctx, input }) => {
      const cart = getSessionCart(ctx.sessionId);
      const orderId = `LUM-${Math.floor(100000 + Math.random() * 900000)}`;
      const snapshot = cloneCart(cart);
      saveSessionCart(ctx.sessionId, createEmptyCart(ctx.sessionId));
      return {
        orderId,
        success: true as const,
        items: snapshot.items,
        data: input ?? {},
      };
    }),
});
