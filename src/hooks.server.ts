import { redirect } from '@sveltejs/kit';
import { SESSION_COOKIE, validateSession } from '$lib/server/auth';
import { ensureDbMigrations } from '$lib/server/dbMigrations';
import { ensureDevAdminAccount } from '$lib/server/devAdmin';
import type { Handle } from '@sveltejs/kit';

const protectedPrefixes = ['/dashboard'];

export const handle: Handle = async ({ event, resolve }) => {
  await ensureDbMigrations();
  await ensureDevAdminAccount();

  const sessionId = event.cookies.get(SESSION_COOKIE);

  try {
    event.locals.user = sessionId ? await validateSession(sessionId) : null;
  } catch (error) {
    console.error('Failed to validate session', error);
    event.locals.user = null;
  }

  const { pathname } = event.url;
  const isProtected = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));
  const guestAuthPages = new Set([
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password'
  ]);

  if (isProtected && !event.locals.user) {
    const redirectTo = `${pathname}${event.url.search}`;
    throw redirect(303, `/login?redirect=${encodeURIComponent(redirectTo)}`);
  }

  if (guestAuthPages.has(pathname) && event.locals.user) {
    throw redirect(303, '/dashboard');
  }

  const response = await resolve(event);

  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');

  return response;
};
