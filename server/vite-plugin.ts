import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Connect, Plugin, PreviewServer, ViteDevServer } from 'vite';
import { nodeHTTPRequestHandler } from '@trpc/server/adapters/node-http';
import type { AppRouter } from './trpc/root';
import type { createContext as CreateContextFn } from './trpc/context';
import { getGraphqlYoga, isGraphqlRequest } from './graphql';

const TRPC_PREFIX = '/api/trpc';

function getTrpcPath(url: string) {
  const pathname = url.split('?')[0] ?? '';
  if (pathname === TRPC_PREFIX || pathname === `${TRPC_PREFIX}/`) {
    return '';
  }
  return decodeURIComponent(pathname.slice(`${TRPC_PREFIX}/`.length));
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

function attachGraphql(server: { middlewares: Connect.Server }) {
  const middleware: Connect.NextHandleFunction = (req, res, next) => {
    const url = req.originalUrl ?? req.url ?? '';
    if (!isGraphqlRequest(url)) {
      next();
      return;
    }
    void handleGraphqlRequest(req, res).catch((err) => {
      console.error('[lumina-api] GraphQL handler failed', err);
      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: { message: String(err) } }));
      }
    });
  };
  server.middlewares.use(middleware);
}

export function luminaApiPlugin(): Plugin {
  return {
    name: 'lumina-api',
    configureServer(vite: ViteDevServer) {
      attachGraphql(vite);
      const trpc: Connect.NextHandleFunction = (req, res, next) => {
        const url = req.originalUrl ?? req.url ?? '';
        if (!url.startsWith(TRPC_PREFIX)) {
          next();
          return;
        }
        void handleTrpcRequest(vite, req, res).catch((err) => {
          console.error('[lumina-api] tRPC handler failed', err);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: { message: String(err) } }));
          }
        });
      };
      vite.middlewares.use(trpc);
    },
    configurePreviewServer(server: PreviewServer) {
      attachGraphql(server);
    },
  };
}

export default luminaApiPlugin;
