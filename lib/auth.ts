import 'dotenv/config';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { dash, sentinel } from '@better-auth/infra';
import { eq } from 'drizzle-orm';
import { getDb } from '../src/db/client';
import { account, session, user, verification } from '../src/db/auth-schema';
import { customerProfiles, users } from '../src/db/schema';
import { AGENT_SUPERADMIN } from '../src/lib/agent-superadmin';
import type { UserRole } from '../src/lib/auth-types';

const PRODUCTION_ORIGIN = 'https://thenikkigcollection.com';
const AUTH_BASE_PATH = '/api/auth';
const PREVIEW_ORIGIN = 'http://127.0.0.1:8080';

function productionAuthEnabled() {
  return process.env.BETTER_AUTH_USE_PRODUCTION_URL === 'true';
}

function previewOrigin() {
  const appUrl = process.env.APP_URL?.trim();
  if (!appUrl) return PREVIEW_ORIGIN;
  try {
    return new URL(appUrl).origin;
  } catch {
    return PREVIEW_ORIGIN;
  }
}

/** Runtime origin. Production domain stays on Wix until DNS cutover. */
function resolveAuthBaseURL() {
  if (productionAuthEnabled()) {
    return process.env.BETTER_AUTH_URL?.trim() || PRODUCTION_ORIGIN;
  }
  return previewOrigin();
}

function staticTrustedOrigins() {
  return [
    previewOrigin(),
    PREVIEW_ORIGIN,
    'http://localhost:8080',
    'http://[::1]:8080',
    PRODUCTION_ORIGIN,
    'https://www.thenikkigcollection.com',
  ];
}

function splitName(name: string | undefined): { firstName: string; lastName: string } {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] ?? 'Lumina',
    lastName: parts.slice(1).join(' ') || 'Member',
  };
}

function roleForEmail(email: string): UserRole {
  return email.toLowerCase() === AGENT_SUPERADMIN.email ? 'super_admin' : 'customer';
}

async function syncCommerceUser(authUser: {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
}) {
  const db = await getDb();
  const email = authUser.email.toLowerCase();
  const { firstName, lastName } = splitName(authUser.name);
  const role = roleForEmail(email);

  const existing = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  const userId = existing?.id ?? authUser.id;

  if (!existing) {
    await db.insert(users).values({
      id: userId,
      email,
      role,
      isEmailVerified: authUser.emailVerified,
    });
  } else if (role === 'super_admin' && existing.role !== 'super_admin') {
    await db
      .update(users)
      .set({ role: 'super_admin', isEmailVerified: true, updatedAt: new Date() })
      .where(eq(users.id, existing.id));
  }

  const profile = await db.query.customerProfiles.findFirst({
    where: eq(customerProfiles.userId, userId),
  });
  if (!profile) {
    await db.insert(customerProfiles).values({
      userId,
      firstName,
      lastName,
      loyaltyTier: role === 'super_admin' ? 'Founder' : 'Bronze',
      loyaltyPoints: role === 'super_admin' ? 0 : 50,
    });
  }
}

const globalRef = globalThis as typeof globalThis & {
  __luminaAuth__?: Promise<LuminaAuth>;
};

type LuminaAuth = Awaited<ReturnType<typeof createAuth>>;

async function createAuth() {
  const db = await getDb();
  const apiKey = process.env.BETTER_AUTH_API_KEY;
  if (!apiKey) {
    console.warn('[auth] BETTER_AUTH_API_KEY is not set — dash/sentinel will not reach Better Auth Infrastructure');
  }

  return betterAuth({
    appName: 'Lumina Skin Rituals',
    baseURL: resolveAuthBaseURL(),
    basePath: AUTH_BASE_PATH,
    secret: process.env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema: { user, session, account, verification },
    }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
    },
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 60 * 5,
      },
    },
    trustedOrigins: async (request) => {
      const origins = new Set(staticTrustedOrigins().filter(Boolean));
      const headerOrigin = request?.headers.get('origin') ?? request?.headers.get('referer');
      if (headerOrigin) {
        try {
          origins.add(new URL(headerOrigin).origin);
        } catch {
          /* ignore malformed Origin */
        }
      }
      return [...origins];
    },
    advanced: {
      useSecureCookies: process.env.BETTER_AUTH_USE_SECURE_COOKIES === 'true',
      database: {
        generateId: () => crypto.randomUUID(),
      },
      defaultCookieAttributes: {
        sameSite: 'lax',
        httpOnly: true,
        secure: process.env.BETTER_AUTH_USE_SECURE_COOKIES === 'true',
      },
    },
    databaseHooks: {
      user: {
        create: {
          after: async (created) => {
            if (!created?.email) return;
            await syncCommerceUser({
              id: created.id,
              email: created.email,
              name: created.name,
              emailVerified: created.emailVerified,
            });
          },
        },
      },
    },
    plugins: [
      dash({
        apiKey,
      }),
      sentinel({
        apiKey,
      }),
    ],
  });
}

export function getAuth() {
  globalRef.__luminaAuth__ ??= createAuth().catch((err) => {
    globalRef.__luminaAuth__ = undefined;
    throw err;
  });
  return globalRef.__luminaAuth__;
}

export const AUTH_BASE_PATH_VALUE = AUTH_BASE_PATH;
export const AUTH_PRODUCTION_ORIGIN = PRODUCTION_ORIGIN;

