import { initTRPC, TRPCError } from '@trpc/server';
import type { Context } from './context';
import { STAFF_ROLES, type UserRole } from '../../src/lib/auth-types';

const t = initTRPC.context<Context>().create();

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;

const ROLE_RANK: Record<UserRole, number> = {
  customer: 0,
  support: 1,
  manager: 2,
  admin: 3,
  super_admin: 4,
};

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

export function staffAtLeast(min: UserRole) {
  return staffProcedure.use(({ ctx, next }) => {
    const rank = ROLE_RANK[ctx.role ?? 'customer'] ?? 0;
    if (rank < ROLE_RANK[min]) {
      throw new TRPCError({ code: 'FORBIDDEN', message: `${min} role required` });
    }
    return next({ ctx });
  });
}
