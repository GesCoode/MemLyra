import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getSql } from '$lib/server/db';

let migrationPromise: Promise<void> | null = null;

function migrationsDirectory(): string {
  const candidates = [
    join(process.cwd(), 'db', 'migrations'),
    join(dirname(fileURLToPath(import.meta.url)), '../../../db/migrations')
  ];

  for (const path of candidates) {
    if (existsSync(path)) {
      return path;
    }
  }

  throw new Error('Missing db/migrations directory');
}

function listMigrationFiles(): string[] {
  return readdirSync(migrationsDirectory())
    .filter((file) => file.endsWith('.sql'))
    .sort();
}

function readMigrationSql(filename: string): string {
  return readFileSync(join(migrationsDirectory(), filename), 'utf8');
}

async function ensureMigrationsTable(): Promise<void> {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

async function getAppliedMigrations(): Promise<Set<string>> {
  const sql = getSql();
  const rows = await sql<{ id: string }[]>`SELECT id FROM schema_migrations`;
  return new Set(rows.map((row) => row.id));
}

async function runPendingMigrations(): Promise<void> {
  await ensureMigrationsTable();
  const applied = await getAppliedMigrations();
  const sql = getSql();

  for (const file of listMigrationFiles()) {
    if (applied.has(file)) {
      continue;
    }

    const migrationSql = readMigrationSql(file);

    await sql.begin(async (tx) => {
      await tx.unsafe(migrationSql);
      await tx`INSERT INTO schema_migrations (id) VALUES (${file})`;
    });

    console.info(`[db] Applied migration ${file}`);
  }
}

export function ensureDbMigrations(): Promise<void> {
  if (!migrationPromise) {
    migrationPromise = runPendingMigrations().catch((error) => {
      migrationPromise = null;
      throw error;
    });
  }

  return migrationPromise;
}

export async function runDbMigrations(): Promise<void> {
  migrationPromise = null;
  await ensureDbMigrations();
}
