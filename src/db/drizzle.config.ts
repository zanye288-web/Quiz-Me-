import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Migrations/schema pushes need a connection that supports DDL.
// For Supabase use the "Session pooler" (port 5432) or the direct connection,
// NOT the "Transaction pooler" (port 6543).
//
// Provide either DATABASE_URL (or ADMIN_DATABASE_URL to override it for
// migrations), or the individual SQL_* variables.
const sslEnabled = process.env.SQL_SSL === 'true';
const ssl = sslEnabled ? ('require' as const) : false;
const connectionUrl = process.env.ADMIN_DATABASE_URL || process.env.DATABASE_URL;

let dbCredentials:
  | { url: string; ssl: typeof ssl }
  | { host: string; port?: number; user: string; password: string; database: string; ssl: typeof ssl };

if (connectionUrl) {
  console.log('Using DATABASE_URL to connect to database.');
  dbCredentials = { url: connectionUrl, ssl };
} else {
  const sqlHost = process.env.SQL_HOST;
  const sqlDbName = process.env.SQL_DB_NAME;
  const user = process.env.SQL_ADMIN_USER;
  const password = process.env.SQL_ADMIN_PASSWORD;

  if (!sqlHost) {
    throw new Error('SQL_HOST (or DATABASE_URL) must be set in environment variables.');
  }
  if (!sqlDbName) {
    throw new Error('SQL_DB_NAME (or DATABASE_URL) must be set in environment variables.');
  }
  if (!user) {
    throw new Error('SQL_ADMIN_USER (or DATABASE_URL) must be set in environment variables.');
  }
  if (!password) {
    throw new Error('SQL_ADMIN_PASSWORD (or DATABASE_URL) must be set in environment variables.');
  }

  console.log(`Using user: ${user} to connect to database.`);

  dbCredentials = {
    host: sqlHost,
    port: process.env.SQL_PORT ? Number(process.env.SQL_PORT) : undefined,
    user,
    password,
    database: sqlDbName,
    ssl,
  };
}

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  schemaFilter: ['public'],
  dbCredentials,
  verbose: true,
});
