import { env } from '$env/dynamic/private';

export function getAppUrl(url: URL): string {
  const configured = env.ORIGIN?.trim().replace(/\/$/, '');
  if (configured) return configured;

  if (env.NODE_ENV === 'production') {
    throw new Error('ORIGIN must be set in production.');
  }

  return url.origin;
}
