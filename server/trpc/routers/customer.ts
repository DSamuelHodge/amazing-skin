import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../init';

export const customerRouter = createTRPCRouter({
  ping: publicProcedure.query(() => ({ ok: true as const })),

  toggleWishlist: publicProcedure
    .input(z.object({ productId: z.string().optional() }).optional())
    .mutation(() => ({ ok: true as const, wishlisted: true })),
});
