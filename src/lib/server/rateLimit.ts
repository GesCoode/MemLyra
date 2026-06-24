import { getSql } from '$lib/server/db';

export function rateLimitKey(prefix: string, ip: string, identifier = ''): string {
  return `${prefix}:${ip}:${identifier.trim().toLowerCase()}`;
}

export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<boolean> {
  const sql = getSql();
  const resetAt = new Date(Date.now() + windowMs);

  const rows = await sql<{ count: number }[]>`
  WITH upsert AS (
    INSERT INTO rate_limit_buckets (key, count, reset_at)
    VALUES (${key}, 1, ${resetAt})
    ON CONFLICT (key) DO UPDATE SET
      count = CASE
        WHEN rate_limit_buckets.reset_at <= NOW() THEN 1
        ELSE rate_limit_buckets.count + 1
      END,
      reset_at = CASE
        WHEN rate_limit_buckets.reset_at <= NOW() THEN ${resetAt}
        ELSE rate_limit_buckets.reset_at
      END
    RETURNING count
  )
  SELECT count FROM upsert
  `;

  return (rows[0]?.count ?? 1) <= limit;
}

export async function pruneExpiredRateLimits(): Promise<void> {
  const sql = getSql();
  await sql`DELETE FROM rate_limit_buckets WHERE reset_at <= NOW()`;
}
