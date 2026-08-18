import type { IncomingMessage, ServerResponse } from 'node:http';
import { randomUUID } from 'node:crypto';
import type { NodeHTTPCreateContextFnOptions } from '@trpc/server/adapters/node-http';
import { fromNodeHeaders } from 'better-auth/node';
import { eq } from 'drizzle-orm';
import { getAuth } from '../../lib/auth';
import { getDb } from '../../src/db/client';
import { users } from '../../src/db/schema';
import type { UserRole } from '../../src/lib/auth-types';

export const SESSION_COOKIE = 'lumina_session_id';

function parseCookies(header: string | undefined): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!header) return cookies;
  for (const part of header.split(';')) {
    const [rawKey, ...rest] = part.trim().split('=');
    if (!rawKey) continue;
    cookies[rawKey] = decodeURIComponent(rest.join('='));
  }
  return cookies;
}

export async function createContext(
  opts: NodeHTTPCreateContextFnOptions<IncomingMessage, ServerResponse>,
) {
  const cookies = parseCookies(opts.req.headers.cookie);
  let sessionId = cookies[SESSION_COOKIE];

  if (!sessionId) {
    sessionId = randomUUID();
    const cookie = `${SESSION_COOKIE}=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000`;
    const existing = opts.res.getHeader('Set-Cookie');
    if (Array.isArray(existing)) {
      opts.res.setHeader('Set-Cookie', [...existing, cookie]);
    } else if (typeof existing === 'string') {
      opts.res.setHeader('Set-Cookie', [existing, cookie]);
    } else {
      opts.res.setHeader('Set-Cookie', cookie);
    }
  }

  let userId: string | null = null;
  let role: UserRole | null = null;
  let email: string | null = null;

  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(opts.req.headers),
    });
    if (session?.user) {
      email = session.user.email;
      const db = await getDb();
      const commerce = await db.query.users.findFirst({
        where: eq(users.email, session.user.email.toLowerCase()),
      });
      userId = commerce?.id ?? session.user.id;
      role = (commerce?.role as UserRole | undefined) ?? 'customer';
    }
  } catch (err) {
    console.error('[auth] session lookup failed', err);
  }

  return {
    sessionId,
    userId,
    role,
    email,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
