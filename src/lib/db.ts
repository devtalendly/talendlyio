import { connectToDatabase } from '@/server/database/connection';

export type { Database } from '@/server/database/connection';
export * from '@/server/database/schema';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

export const db = connectToDatabase(connectionString);
