import { redirect } from '@sveltejs/kit';
import { SESSION_COOKIE, validateSession } from '$lib/server/auth';
import { ensureDevAdminAccount } from '$lib/server/devAdmin';
import type { Handle } from '@sveltejs/kit';

const protectedPrefixes = ['/dashboard'];

export const handle: Handle = async ({ event, resolve }) => {
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
    throw redirect(303, '/login');
  }

  if (guestAuthPages.has(pathname) && event.locals.user) {
    throw redirect(303, '/dashboard');
  }

  return resolve(event);
};
