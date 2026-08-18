import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

const databaseUrl = process.env.DATABASE_URL?.trim();

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  ...(databaseUrl
    ? { dbCredentials: { url: databaseUrl } }
    : {
        driver: 'pglite' as const,
        dbCredentials: { url: './data/pglite' },
      }),
});
