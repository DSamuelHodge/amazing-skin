import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, publicProcedure } from '../init';

function notImplemented(procedure: string): never {
  throw new TRPCError({
    code: 'NOT_IMPLEMENTED',
    message: `${procedure} is not implemented yet`,
  });
}

export const authRouter = createTRPCRouter({
  signUp: publicProcedure
    .input(
      z
        .object({
          email: z.string().optional(),
          password: z.string().optional(),
          firstName: z.string().optional(),
          lastName: z.string().optional(),
        })
        .optional(),
    )
    .mutation(() => notImplemented('auth.signUp')),

  signIn: publicProcedure
    .input(
      z
        .object({
          email: z.string().optional(),
          password: z.string().optional(),
        })
        .optional(),
    )
    .mutation(() => notImplemented('auth.signIn')),

  signOut: publicProcedure.mutation(() => notImplemented('auth.signOut')),

  getCurrentUser: publicProcedure.query(() => null),

  refreshToken: publicProcedure.mutation(() => notImplemented('auth.refreshToken')),
});
