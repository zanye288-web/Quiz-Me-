import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool, PoolConfig } from 'pg';
import * as schema from './schema.ts';

// Add global connection pool caching to persist across hot-reloads
declare global {
  var _postgresPool: Pool | undefined;
}

// Builds the pool configuration from environment variables.
//
// Either set DATABASE_URL (e.g. the Supabase connection string), or the
// individual SQL_* variables. Supabase (and most hosted Postgres providers)
// require SSL, so set SQL_SSL=true for them. SSL stays off by default so
// existing local/Cloud SQL setups keep working unchanged.
const buildPoolConfig = (): PoolConfig => {
  const ssl = process.env.SQL_SSL === 'true' ? { rejectUnauthorized: false } : undefined;

  const base: PoolConfig = {
    max: 10,
    connectionTimeoutMillis: 15000,
    ssl,
  };

  if (process.env.DATABASE_URL) {
    return { ...base, connectionString: process.env.DATABASE_URL };
  }

  return {
    ...base,
    host: process.env.SQL_HOST,
    port: process.env.SQL_PORT ? Number(process.env.SQL_PORT) : undefined,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DB_NAME,
  };
};

// Function to create or retrieve the connection pool.
export const createPool = () => {
  if (!global._postgresPool) {
    global._postgresPool = new Pool(buildPoolConfig());

    // Prevent unhandled pool-level errors from crashing the application
    global._postgresPool.on('error', (err) => {
      console.error('Unexpected error on idle SQL pool client:', err);
    });
  }
  return global._postgresPool;
};

// Create or retrieve the pool instance.
const pool = createPool();

// Initialize Drizzle with the pool and schema.
export const db = drizzle(pool, { schema });
