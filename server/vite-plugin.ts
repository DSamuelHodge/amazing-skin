import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Connect, Plugin, PreviewServer, ViteDevServer } from 'vite';
import { nodeHTTPRequestHandler } from '@trpc/server/adapters/node-http';
import { toNodeHandler } from 'better-auth/node';
import type { AppRouter } from './trpc/root';
import type { createContext as CreateContextFn } from './trpc/context';
import { getGraphqlYoga, isGraphqlRequest } from './graphql';
import { AUTH_BASE_PATH_VALUE, getAuth } from '../lib/auth';
import { handleStripeWebhook, WebhookError } from './webhooks/stripe';

const TRPC_PREFIX = '/api/trpc';
const AUTH_PREFIX = AUTH_BASE_PATH_VALUE;
const STRIPE_WEBHOOK_PATH = '/api/webhooks/stripe';

function getTrpcPath(url: string) {
  const pathname = url.split('?')[0] ?? '';
  if (pathname === TRPC_PREFIX || pathname === `${TRPC_PREFIX}/`) {
    return '';
  }
  return decodeURIComponent(pathname.slice(`${TRPC_PREFIX}/`.length));
}

function isAuthRequest(url: string) {
  const pathname = url.split('?')[0] ?? '';
  return pathname === AUTH_PREFIX || pathname.startsWith(`${AUTH_PREFIX}/`);
}

function isStripeWebhook(url: string) {
  const pathname = url.split('?')[0] ?? '';
  return pathname === STRIPE_WEBHOOK_PATH;
}

function readRawBody(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

async function handleTrpcRequest(
  vite: ViteDevServer,
  req: IncomingMessage,
  res: ServerResponse,
) {
  const [{ appRouter }, { createContext }] = (await Promise.all([
    vite.ssrLoadModule('/server/trpc/root.ts'),
    vite.ssrLoadModule('/server/trpc/context.ts'),
  ])) as [
    { appRouter: AppRouter },
    { createContext: typeof CreateContextFn },
  ];

  await nodeHTTPRequestHandler({
    router: appRouter,
    createContext,
    req,
    res,
    path: getTrpcPath(req.url ?? ''),
  });
}

async function handleGraphqlRequest(req: IncomingMessage, res: ServerResponse) {
  const yoga = await getGraphqlYoga();
  await yoga.handle(req, res);
}

async function handleAuthRequest(req: IncomingMessage, res: ServerResponse) {
  const auth = await getAuth();
  await toNodeHandler(auth)(req, res);
}

async function handleWebhookRequest(req: IncomingMessage, res: ServerResponse) {
  const rawBody = await readRawBody(req);
  const header = req.headers['stripe-signature'];
  const signature = Array.isArray(header) ? header[0] : header;
  try {
    const result = await handleStripeWebhook(rawBody, signature);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(result));
  } catch (err) {
    const status = err instanceof WebhookError ? err.status : 500;
    console.error('[lumina-api] Stripe webhook failed', err);
    if (!res.headersSent) {
      res.statusCode = status;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }));
    }
  }
}

function attachApi(server: { middlewares: Connect.Server }, vite?: ViteDevServer) {
  const middleware: Connect.NextHandleFunction = (req, res, next) => {
    const url = req.originalUrl ?? req.url ?? '';
    if (isStripeWebhook(url)) {
      void handleWebhookRequest(req, res);
      return;
    }
    if (isAuthRequest(url)) {
      void handleAuthRequest(req, res).catch((err) => {
        console.error('[lumina-api] Better Auth handler failed', err);
        if (!res.headersSent) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: { message: String(err) } }));
        }
      });
      return;
    }
    if (isGraphqlRequest(url)) {
      void handleGraphqlRequest(req, res).catch((err) => {
        console.error('[lumina-api] GraphQL handler failed', err);
        if (!res.headersSent) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: { message: String(err) } }));
        }
      });
      return;
    }
    if (vite && url.startsWith(TRPC_PREFIX)) {
      void handleTrpcRequest(vite, req, res).catch((err) => {
        console.error('[lumina-api] tRPC handler failed', err);
        if (!res.headersSent) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: { message: String(err) } }));
        }
      });
      return;
    }
    next();
  };
  server.middlewares.use(middleware);
}

export function luminaApiPlugin(): Plugin {
  return {
    name: 'lumina-api',
    configureServer(vite: ViteDevServer) {
      attachApi(vite, vite);
    },
    configurePreviewServer(server: PreviewServer) {
      attachApi(server);
    },
  };
}

export default luminaApiPlugin;
