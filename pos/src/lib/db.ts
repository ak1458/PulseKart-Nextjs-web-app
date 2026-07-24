import { Pool, type PoolClient } from 'pg';

/**
 * Postgres connection pool.
 *
 * Cached on `globalThis` because Next.js re-evaluates modules on every hot
 * reload in development; without this, each edit leaks a pool and the database
 * runs out of connections after a few minutes of work.
 */
const globalForDb = globalThis as unknown as { __posPool?: Pool };

export function getPool(): Pool {
    if (!globalForDb.__posPool) {
        const connectionString = process.env.DATABASE_URL;
        if (!connectionString) {
            throw new Error(
                'DATABASE_URL is not set. Copy .env.example to .env and fill it in.',
            );
        }

        globalForDb.__posPool = new Pool({
            connectionString,
            max: 10,
            idleTimeoutMillis: 30_000,
            connectionTimeoutMillis: 5_000,
            // Managed Postgres (Render, Supabase, RDS) terminates TLS with a
            // certificate chain the container does not carry.
            ssl: process.env.DATABASE_SSL === 'true'
                ? { rejectUnauthorized: false }
                : undefined,
        });
    }
    return globalForDb.__posPool;
}

export async function query<T = Record<string, unknown>>(
    text: string,
    params: unknown[] = [],
): Promise<T[]> {
    const result = await getPool().query(text, params);
    return result.rows as T[];
}

/**
 * Run `fn` inside a transaction, rolling back on any throw.
 *
 * Selling is the only operation here that touches four tables at once (sale,
 * sale_items, batches, stock_movements). Any of them failing alone would leave
 * stock and takings disagreeing, so they share one transaction.
 */
export async function transaction<T>(
    fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
    const client = await getPool().connect();
    try {
        await client.query('BEGIN');
        const result = await fn(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

/** Can we reach the database at all? Used by the setup wizard's first step. */
export async function checkConnection(): Promise<{ ok: boolean; error?: string }> {
    try {
        await query('SELECT 1');
        return { ok: true };
    } catch (error) {
        return {
            ok: false,
            error: error instanceof Error ? error.message : 'Unknown database error',
        };
    }
}
