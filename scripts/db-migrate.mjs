import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import postgres from 'postgres';

const databaseUrl =
  process.env.DATABASE_URL ?? 'postgres://memlyra:memlyra@localhost:5432/memlyra';
const migrationsDir = join(dirname(fileURLToPath(import.meta.url)), '../db/migrations');
const sql = postgres(databaseUrl);

try {
  await sql`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  const applied = new Set(
    (await sql`SELECT id FROM schema_migrations`).map((row) => row.id)
  );

  const files = readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  for (const file of files) {
    if (applied.has(file)) {
      continue;
    }

    const migrationSql = readFileSync(join(migrationsDir, file), 'utf8');

    await sql.begin(async (tx) => {
      await tx.unsafe(migrationSql);
      await tx`INSERT INTO schema_migrations (id) VALUES (${file})`;
    });

    console.log(`Applied ${file}`);
  }

  console.log('Database migrations complete.');
} finally {
  await sql.end();
}
