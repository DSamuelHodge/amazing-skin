import 'dotenv/config';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isPostgresMode, PGLITE_DATA_DIR } from './client';

const migrationsFolder = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../drizzle',
);

function assertMigrationsFolder() {
  if (!existsSync(migrationsFolder)) {
    throw new Error(`Migrations folder not found: ${migrationsFolder}`);
  }

  const journalPath = path.join(migrationsFolder, 'meta', '_journal.json');
  if (!existsSync(journalPath)) {
    console.warn(
      `[db] No drizzle journal at ${journalPath}. Official migrators expect drizzle-kit generate output (meta/_journal.json + *.sql).`,
    );
  }
}

async function migratePostgres() {
  const postgres = (await import('postgres')).default;
  const { drizzle } = await import('drizzle-orm/postgres-js');
  const { migrate } = await import('drizzle-orm/postgres-js/migrator');
  const client = postgres(process.env.DATABASE_URL!, { max: 1 });
  try {
    await migrate(drizzle(client), { migrationsFolder });
  } finally {
    await client.end({ timeout: 5 });
  }
}

async function migratePglite() {
  const { PGlite } = await import('@electric-sql/pglite');
  const { drizzle } = await import('drizzle-orm/pglite');
  const { migrate } = await import('drizzle-orm/pglite/migrator');
  mkdirSync(PGLITE_DATA_DIR, { recursive: true });
  const client = new PGlite(PGLITE_DATA_DIR);
  await client.waitReady;
  try {
    await migrate(drizzle({ client }), { migrationsFolder });
  } finally {
    await client.close();
  }
}

async function main() {
  assertMigrationsFolder();
  const mode = isPostgresMode() ? 'postgres' : `pglite (${PGLITE_DATA_DIR})`;
  console.log(`[db] Applying migrations from ${migrationsFolder} via ${mode}`);

  if (isPostgresMode()) {
    await migratePostgres();
  } else {
    await migratePglite();
  }

  console.log('[db] Migrations applied');
}

main().catch((err) => {
  console.error('[db] Migration failed:', err);
  process.exit(1);
});
