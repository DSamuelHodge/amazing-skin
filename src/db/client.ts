import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite';
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

export type AppDb = PostgresJsDatabase<typeof schema>;

export const PGLITE_DATA_DIR = path.resolve(process.cwd(), 'data/pglite');

const globalRef = globalThis as typeof globalThis & {
  __luminaDb__?: Promise<AppDb>;
};

export function isPostgresMode(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

async function createDb(): Promise<AppDb> {
  if (isPostgresMode()) {
    const postgres = (await import('postgres')).default;
    const client = postgres(process.env.DATABASE_URL!);
    return drizzlePostgres({ client, schema }) as AppDb;
  }

  mkdirSync(PGLITE_DATA_DIR, { recursive: true });
  const { PGlite } = await import('@electric-sql/pglite');
  const client = new PGlite(PGLITE_DATA_DIR);
  await client.waitReady;
  return drizzlePglite({ client, schema }) as unknown as AppDb;
}

export function getDb(): Promise<AppDb> {
  globalRef.__luminaDb__ ??= createDb().catch((err) => {
    globalRef.__luminaDb__ = undefined;
    throw err;
  });
  return globalRef.__luminaDb__;
}

export async function ensureDbReady(): Promise<void> {
  await getDb();
}
