import { defineConfig } from 'drizzle-kit';

process.loadEnvFile('./.env.local');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

export default defineConfig({
  out: './drizzle',
  schema: './src/server/database/schema/index.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: connectionString,
  },
});
