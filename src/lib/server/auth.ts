import bcrypt from 'bcryptjs';
import { env } from '$env/dynamic/private';
import { randomBytes } from 'node:crypto';
import { getSql } from '$lib/server/db';

export const SESSION_COOKIE = 'memlyra_session';
const SESSION_DAYS = 30;
const VERIFICATION_DAYS = 2;
const RESET_HOURS = 1;
const BCRYPT_ROUNDS = 12;

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
};

type DbUser = {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  email_verified: boolean;
  created_at: Date;
};

type UserRow = Pick<DbUser, 'id' | 'email' | 'name' | 'created_at'>;

function toSessionUser(row: Pick<DbUser, 'id' | 'email' | 'name' | 'created_at'>): SessionUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    createdAt: row.created_at.toISOString()
  };
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function sessionExpiryDate(): Date {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DAYS);
  return expiresAt;
}

function verificationExpiryDate(): Date {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + VERIFICATION_DAYS);
  return expiresAt;
}

function resetExpiryDate(): Date {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + RESET_HOURS);
  return expiresAt;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

export async function findUserByEmail(email: string): Promise<DbUser | null> {
  const sql = getSql();
  const rows = await sql<DbUser[]>`
    SELECT id, email, name, password_hash, email_verified, created_at
    FROM users
    WHERE lower(email) = ${normalizeEmail(email)}
    LIMIT 1
  `;

  return rows[0] ?? null;
}

export async function createUser(
  email: string,
  name: string,
  password: string
): Promise<{ user: SessionUser; verificationToken: string }> {
  const sql = getSql();
  const normalizedEmail = normalizeEmail(email);
  const trimmedName = name.trim();
  const passwordHash = await hashPassword(password);

  const rows = await sql<UserRow[]>`
    INSERT INTO users (email, name, password_hash, email_verified)
    VALUES (${normalizedEmail}, ${trimmedName}, ${passwordHash}, FALSE)
    RETURNING id, email, name, created_at
  `;

  const user = toSessionUser(rows[0]);
  const verificationToken = await createVerificationToken(user.id);

  return { user, verificationToken };
}

export async function createVerificationToken(userId: string): Promise<string> {
  const sql = getSql();
  const id = randomBytes(32).toString('hex');
  const expiresAt = verificationExpiryDate();

  await sql`DELETE FROM email_verification_tokens WHERE user_id = ${userId}`;
  await sql`
    INSERT INTO email_verification_tokens (id, user_id, expires_at)
    VALUES (${id}, ${userId}, ${expiresAt})
  `;

  return id;
}

export async function createPasswordResetToken(userId: string): Promise<string> {
  const sql = getSql();
  const id = randomBytes(32).toString('hex');
  const expiresAt = resetExpiryDate();

  await sql`DELETE FROM password_reset_tokens WHERE user_id = ${userId}`;
  await sql`
    INSERT INTO password_reset_tokens (id, user_id, expires_at)
    VALUES (${id}, ${userId}, ${expiresAt})
  `;

  return id;
}

export async function isPasswordResetTokenValid(token: string): Promise<boolean> {
  const sql = getSql();

  const rows = await sql<{ user_id: string }[]>`
    SELECT user_id
    FROM password_reset_tokens
    WHERE id = ${token}
      AND expires_at > NOW()
    LIMIT 1
  `;

  return Boolean(rows[0]);
}

export async function resetPasswordWithToken(token: string, password: string): Promise<boolean> {
  const sql = getSql();

  const rows = await sql<{ user_id: string }[]>`
    SELECT user_id
    FROM password_reset_tokens
    WHERE id = ${token}
      AND expires_at > NOW()
    LIMIT 1
  `;

  const match = rows[0];
  if (!match) {
    await sql`DELETE FROM password_reset_tokens WHERE id = ${token}`;
    return false;
  }

  const passwordHash = await hashPassword(password);

  await sql`
    UPDATE users
    SET password_hash = ${passwordHash}
    WHERE id = ${match.user_id}
  `;
  await sql`DELETE FROM password_reset_tokens WHERE user_id = ${match.user_id}`;
  await sql`DELETE FROM sessions WHERE user_id = ${match.user_id}`;

  return true;
}

export async function updateUserPassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<boolean> {
  const sql = getSql();

  const rows = await sql<{ password_hash: string }[]>`
    SELECT password_hash
    FROM users
    WHERE id = ${userId}
    LIMIT 1
  `;

  const account = rows[0];
  if (!account || !(await verifyPassword(currentPassword, account.password_hash))) {
    return false;
  }

  const passwordHash = await hashPassword(newPassword);
  await sql`
    UPDATE users
    SET password_hash = ${passwordHash}
    WHERE id = ${userId}
  `;

  return true;
}

export async function verifyEmailWithToken(token: string): Promise<boolean> {
  const sql = getSql();

  const rows = await sql<{ user_id: string }[]>`
    SELECT user_id
    FROM email_verification_tokens
    WHERE id = ${token}
      AND expires_at > NOW()
    LIMIT 1
  `;

  const match = rows[0];
  if (!match) {
    await sql`DELETE FROM email_verification_tokens WHERE id = ${token}`;
    return false;
  }

  await sql`
    UPDATE users
    SET email_verified = TRUE
    WHERE id = ${match.user_id}
  `;
  await sql`DELETE FROM email_verification_tokens WHERE user_id = ${match.user_id}`;

  return true;
}

export async function createSession(userId: string): Promise<{ id: string; expiresAt: Date }> {
  const sql = getSql();
  const id = randomBytes(32).toString('hex');
  const expiresAt = sessionExpiryDate();

  await sql`
    INSERT INTO sessions (id, user_id, expires_at)
    VALUES (${id}, ${userId}, ${expiresAt})
  `;

  return { id, expiresAt };
}

export async function deleteSession(sessionId: string): Promise<void> {
  const sql = getSql();
  await sql`DELETE FROM sessions WHERE id = ${sessionId}`;
}

export async function validateSession(sessionId: string): Promise<SessionUser | null> {
  const sql = getSql();

  const rows = await sql<UserRow[]>`
    SELECT u.id, u.email, u.name, u.created_at
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.id = ${sessionId}
      AND s.expires_at > NOW()
      AND u.email_verified = TRUE
    LIMIT 1
  `;

  const user = rows[0];
  if (!user) {
    await sql`DELETE FROM sessions WHERE id = ${sessionId}`;
    return null;
  }

  return toSessionUser(user);
}

export async function updateUserName(userId: string, name: string): Promise<SessionUser | null> {
  const sql = getSql();
  const trimmedName = name.trim();

  const rows = await sql<UserRow[]>`
    UPDATE users
    SET name = ${trimmedName}
    WHERE id = ${userId}
    RETURNING id, email, name, created_at
  `;

  return rows[0] ? toSessionUser(rows[0]) : null;
}

export async function deleteUser(userId: string): Promise<void> {
  const sql = getSql();
  await sql`DELETE FROM users WHERE id = ${userId}`;
}

export function setSessionCookie(
  cookies: import('@sveltejs/kit').Cookies,
  sessionId: string,
  expiresAt: Date,
  secure: boolean
): void {
  cookies.set(SESSION_COOKIE, sessionId, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure,
    expires: expiresAt
  });
}

export function clearSessionCookie(cookies: import('@sveltejs/kit').Cookies): void {
  cookies.delete(SESSION_COOKIE, { path: '/' });
}

export function cookieIsSecure(url: URL): boolean {
  const origin = env.ORIGIN?.replace(/\/$/, '');
  if (origin?.startsWith('https://')) return true;
  return url.protocol === 'https:';
}
