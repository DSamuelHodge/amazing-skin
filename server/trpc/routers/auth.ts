import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../init';
import { getDb } from '../../../src/db/client';
import { customerProfiles, users } from '../../../src/db/schema';
import type { UserProfile, UserRole } from '../../../src/lib/auth-types';

async function loadProfile(userId: string, email: string, fallbackName?: string): Promise<UserProfile> {
  const db = await getDb();
  const row = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: { profile: true },
  });
  const profile = row?.profile;
  const [first, ...rest] = (fallbackName ?? '').split(' ');
  return {
    id: row?.id ?? userId,
    email: row?.email ?? email,
    firstName: profile?.firstName ?? first ?? 'Lumina',
    lastName: profile?.lastName ?? rest.join(' ') ?? 'Member',
    role: (row?.role as UserRole | undefined) ?? 'customer',
    loyaltyPoints: profile?.loyaltyPoints ?? 0,
    loyaltyTier: profile?.loyaltyTier ?? 'Bronze',
    primarySkinType: profile?.primarySkinType ?? undefined,
  };
}

export const authRouter = createTRPCRouter({
  getCurrentUser: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.userId || !ctx.email) return null;
    return loadProfile(ctx.userId, ctx.email);
  }),

  updateSkinProfile: protectedProcedure
    .input(z.object({ skinType: z.enum(['dry', 'oily', 'combination', 'sensitive', 'normal']) }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      await db
        .update(customerProfiles)
        .set({ primarySkinType: input.skinType, updatedAt: new Date() })
        .where(eq(customerProfiles.userId, ctx.userId));
      return loadProfile(ctx.userId, ctx.email ?? '');
    }),
});
