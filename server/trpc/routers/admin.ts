import { createTRPCRouter, publicProcedure } from '../init';

export const adminRouter = createTRPCRouter({
  ping: publicProcedure.query(() => ({ ok: true as const })),
});
