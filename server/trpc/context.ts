import type { IncomingMessage, ServerResponse } from 'node:http';
import { randomUUID } from 'node:crypto';
import type { NodeHTTPCreateContextFnOptions } from '@trpc/server/adapters/node-http';

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

  return {
    sessionId,
    userId: null as string | null,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
