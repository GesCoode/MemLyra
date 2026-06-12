import { env } from '$env/dynamic/private';
import { hashPassword } from '$lib/server/auth';
import { createBaseDeckForUser } from '$lib/server/decks';
import { getSql } from '$lib/server/db';

export const DEV_ADMIN_EMAIL = 'admin@local';
export const DEV_ADMIN_NAME = 'admin';
export const DEV_ADMIN_PASSWORD = 'admin';

export function isDevAdminEnabled(): boolean {
  return env.NODE_ENV !== 'production';
}

/** Map short local login "admin" to the seeded dev account email. */
export function resolveDevLoginEmail(email: string): string {
  const trimmed = email.trim().toLowerCase();
  if (isDevAdminEnabled() && trimmed === 'admin') {
    return DEV_ADMIN_EMAIL;
  }
  return trimmed;
}

let seedPromise: Promise<void> | null = null;

export function ensureDevAdminAccount(): Promise<void> {
  if (!isDevAdminEnabled()) {
    return Promise.resolve();
  }

  if (!seedPromise) {
    seedPromise = seedDevAdminAccount().catch((error) => {
      seedPromise = null;
      console.warn(
        '[dev] Could not seed admin account. Start Postgres: docker compose up -d db — then log in as admin / admin'
      );
      console.warn(error);
    });
  }

  return seedPromise;
}

async function seedDevAdminAccount(): Promise<void> {
  const sql = getSql();
  const passwordHash = await hashPassword(DEV_ADMIN_PASSWORD);

  const existing = await sql<{ id: string }[]>`
    SELECT id
    FROM users
    WHERE lower(email) = ${DEV_ADMIN_EMAIL}
    LIMIT 1
  `;

  if (existing[0]) {
    await sql`
      UPDATE users
      SET
        name = ${DEV_ADMIN_NAME},
        password_hash = ${passwordHash},
        email_verified = TRUE
      WHERE id = ${existing[0].id}
    `;
    return;
  }

  const rows = await sql<{ id: string }[]>`
    INSERT INTO users (email, name, password_hash, email_verified)
    VALUES (${DEV_ADMIN_EMAIL}, ${DEV_ADMIN_NAME}, ${passwordHash}, TRUE)
    RETURNING id
  `;

  await createBaseDeckForUser(rows[0].id);
}
