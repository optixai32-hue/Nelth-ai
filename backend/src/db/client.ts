/**
 * Postgres client — replacement for SQLAlchemy/asyncpg layer of Onyx Standard.
 * Single shared pool; all modules import { getDb } and run parameterized SQL.
 */
import { Pool, type PoolClient, type QueryResult, type QueryResultRow } from "pg";
import { POSTGRES_URI, requirePostgresUri } from "../configs/constants.js";
import { getLogger } from "../utils/logger.js";

const logger = getLogger("db.client");

let pool: Pool | null = null;

export function getDb(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: requirePostgresUri(),
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    });
    pool.on("error", (err) => {
      logger.error("pg pool error", { error: String(err) });
    });
  }
  return pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  sql: string,
  params: readonly unknown[] = [],
): Promise<QueryResult<T>> {
  return getDb().query<T>(sql, params as unknown[]);
}

export async function queryOne<T extends QueryResultRow = QueryResultRow>(
  sql: string,
  params: readonly unknown[] = [],
): Promise<T | null> {
  const res = await query<T>(sql, params);
  return res.rows[0] ?? null;
}

/** Run a transaction; rolls back on error. Equivalent to SQLAlchemy session.begin(). */
export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await getDb().connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw err;
  } finally {
    client.release();
  }
}

export async function closeDb(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

export function parsePostgresUri(uri: string): { host: string; port: string } {
  const m = /host=([^\s&]+)/.exec(uri);
  const pm = /(?:\/\/[^:/]+:)(\d+)/.exec(uri);
  return { host: m?.[1] ?? "localhost", port: pm?.[1] ?? POSTGRES_URI ? "5432" : "5432" };
}

export { POSTGRES_URI };
