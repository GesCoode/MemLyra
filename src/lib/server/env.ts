import { env } from '$env/dynamic/private';

const DEV_DEFAULTS = {
  DATABASE_URL: 'postgres://memlyra:memlyra@localhost:5432/memlyra',
  SESSION_SECRET: 'local-dev-session-secret-not-for-production'
} as const;

function isProduction(): boolean {
  return env.NODE_ENV === 'production';
}

export function requireEnv(name: 'DATABASE_URL' | 'SESSION_SECRET'): string {
  const value = env[name];
  if (value) {
    return value;
  }

  if (!isProduction() && DEV_DEFAULTS[name]) {
    return DEV_DEFAULTS[name];
  }

  throw new Error(`${name} is not set`);
}
