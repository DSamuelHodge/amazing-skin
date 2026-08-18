import { initTRPC, TRPCError } from '@trpc/server';
import type { Context } from './context';
import { STAFF_ROLES } from '../../src/lib/auth-types';

const t = initTRPC.context<Context>().create();

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Sign in required' });
  }
  return next({ ctx: { ...ctx, userId: ctx.userId } });
});

export const staffProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!ctx.role || !STAFF_ROLES.includes(ctx.role)) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Staff role required' });
  }
  return next({ ctx });
});
