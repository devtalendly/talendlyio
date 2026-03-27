import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import * as schema from './schema';
import { relations } from './relations';

export function connectToDatabase(connectionString: string) {
  const pool = new Pool({ connectionString });
  return drizzle({ client: pool, schema, relations });
}

export type Database = ReturnType<typeof connectToDatabase>;
