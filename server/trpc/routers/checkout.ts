import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, publicProcedure } from '../init';
import { getOrCreateCart } from '../cart-db';
import { getStripeMode, getStripePublishableKey } from '../../../lib/stripe';
import { calculatePricing } from '../../commerce/pricing';
import {
  confirmDemoOrSucceededIntent,
  createPaymentIntent,
} from '../../commerce/orders';

const addressSchema = z.object({
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
});

export const checkoutRouter = createTRPCRouter({
  config: publicProcedure.query(() => {
    const mode = getStripeMode();
    return {
      mode,
      publishableKey: mode === 'test' ? getStripePublishableKey() : null,
    };
  }),

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
    .mutation(async ({ ctx, input }) => {
      const cart = await getOrCreateCart({ sessionId: ctx.sessionId, userId: ctx.userId });
      return calculatePricing({
        items: cart.items,
        discountCode: input?.discountCode ?? cart.discountCode ?? undefined,
        shippingMethod: input?.shippingMethod ?? 'eco',
        giftPackaging: input?.giftPackaging ?? false,
        pointsRedeemed: input?.pointsRedeemed ?? 0,
        userId: ctx.userId,
      });
    }),

  createPaymentIntent: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        shipping: addressSchema,
        billing: addressSchema.optional(),
        shippingMethod: z.string().optional(),
        giftPackaging: z.boolean().optional(),
        pointsRedeemed: z.number().int().min(0).optional(),
        discountCode: z.string().optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return createPaymentIntent({
        sessionId: ctx.sessionId,
        userId: ctx.userId,
        email: input.email,
        shipping: input.shipping,
        billing: input.billing,
        shippingMethod: input.shippingMethod,
        giftPackaging: input.giftPackaging,
        pointsRedeemed: input.pointsRedeemed,
        discountCode: input.discountCode,
        notes: input.notes,
      });
    }),

  confirmOrder: publicProcedure
    .input(
      z.object({
        orderId: z.string().uuid(),
        paymentIntentId: z.string().optional(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return confirmDemoOrSucceededIntent({
        orderId: input.orderId,
        paymentIntentId: input.paymentIntentId,
        sessionId: ctx.sessionId,
        userId: ctx.userId,
      });
    }),

  /** @deprecated Use createPaymentIntent + confirmOrder. Kept so older clients fail clearly. */
  createOrder: publicProcedure.input(z.any().optional()).mutation(() => {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Checkout now requires a PaymentIntent. Refresh and pay from step 3.',
    });
  }),
});
